import { useEffect, useState, useRef } from "react";
import { chat } from "@/integrations/api/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Send, RefreshCw, Zap } from "lucide-react";
type Conversation = {
  id: string;
  visitor_name?: string | null;
  visitor_email?: string | null;
  status?: string | null;
  updated_at?: string | null;
};
type Message = {
  id: string;
  sender_type: "visitor" | "ai" | "agent";
  content: string;
  created_at: string;
};
type ChatStatus = "open" | "assigned" | "resolved" | "closed";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export default function ChatManager() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchConversations = async () => {
    try {
      const data = await chat.listConversations(100);
      setConversations((data as Conversation[]) || []);
    } catch (error) {
      console.error("Fetch conversations error:", error);
      toast.error("Failed to load conversations");
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await chat.getConversation(conversationId);
      setMessages((data?.messages as Message[]) || []);

      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (error) {
      console.error("Fetch messages error:", error);
      toast.error("Failed to load messages");
      setMessages([]);
    }
  };

  const markConversationAssigned = async (conversationId: string) => {
    const conversation = conversations.find((item) => item.id === conversationId);
    if (conversation?.status !== "open") {
      return;
    }

    try {
      await chat.updateConversation(conversationId, { status: "assigned" });
      await fetchConversations();
    } catch (error) {
      console.error("Assign conversation error:", error);
    }
  };

  const sendAdminMessage = async () => {
    if (!selected || !responseMessage.trim()) {
      return;
    }

    setSending(true);

    try {
      await chat.sendAdminMessage(selected, responseMessage.trim());

      toast.success("Message sent");
      setResponseMessage("");
      await fetchMessages(selected);
      await markConversationAssigned(selected);
    } catch (error) {
      toast.error(`Failed to send message: ${getErrorMessage(error)}`);
    } finally {
      setSending(false);
    }
  };

  const generateAIResponse = async () => {
    if (!selected) {
      toast.error("Please select a conversation first");
      return;
    }

    if (!messages.some((message) => message.sender_type === "visitor")) {
      toast.error("No visitor message found to respond to");
      return;
    }

    setGeneratingAI(true);

    try {
      const data = await chat.generateAIReply(selected);
      if (!data?.reply_message) {
        throw new Error("No response generated");
      }

      toast.success("AI response generated and sent");
      await fetchMessages(selected);
      await markConversationAssigned(selected);
    } catch (error) {
      console.error("AI generation error:", error);
      toast.error(`Failed to generate AI response: ${getErrorMessage(error)}`);
    } finally {
      setGeneratingAI(false);
    }
  };

  useEffect(() => {
    void fetchConversations();
  }, []);

  useEffect(() => {
    if (selected) {
      void fetchMessages(selected);
    }
  }, [selected]);

  const updateStatus = async (id: string, status: ChatStatus) => {
    try {
      await chat.updateConversation(id, { status });
    } catch {
      toast.error("Failed to update status");
      return;
    }

    toast.success("Status updated");
    await fetchConversations();
  };

  const statusColor = (status: string | null): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "open":
        return "default";
      case "assigned":
        return "outline";
      case "resolved":
        return "secondary";
      case "closed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div>
      <h1 className="mb-6 text-2xl font-display font-bold text-foreground">Chat Management</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-4 lg:col-span-1">
          <h3 className="mb-3 font-display font-semibold text-foreground">Conversations</h3>
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelected(conversation.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  selected === conversation.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {conversation.visitor_name || "Anonymous"}
                  </span>
                  <Badge variant={statusColor(conversation.status)} className="text-xs">
                    {conversation.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {conversation.visitor_email || "No email"}
                </p>
              </button>
            ))}

            {conversations.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No conversations yet.</p>
            )}
          </div>
        </Card>

        <Card className="flex flex-col p-4 lg:col-span-2">
          {selected ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground">Messages</h3>
                <Select
                  value={conversations.find((conversation) => conversation.id === selected)?.status || "open"}
                  onValueChange={(value) => void updateStatus(selected, value as ChatStatus)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="mb-4 h-96 flex-1">
                <div className="space-y-3 pr-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.sender_type === "visitor"
                          ? "bg-muted"
                          : message.sender_type === "ai"
                            ? "ml-auto bg-primary/10"
                            : "ml-auto bg-accent/10"
                      }`}
                    >
                      <p className="mb-1 text-xs font-medium capitalize text-muted-foreground">
                        {message.sender_type}
                      </p>
                      <p className="text-sm text-foreground">{message.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="space-y-3 border-t border-border pt-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type admin response..."
                    value={responseMessage}
                    onChange={(event) => setResponseMessage(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendAdminMessage();
                      }
                    }}
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button
                    onClick={sendAdminMessage}
                    disabled={sending || !responseMessage.trim()}
                    size="sm"
                    className="gap-1"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={generateAIResponse}
                    disabled={generatingAI}
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1"
                  >
                    <Zap className="h-4 w-4" />
                    {generatingAI ? "Generating..." : "Generate AI Response"}
                  </Button>
                  <Button
                    onClick={() => void fetchMessages(selected)}
                    variant="outline"
                    size="sm"
                    className="gap-1"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="py-20 text-center text-muted-foreground">
              Select a conversation to view messages.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
