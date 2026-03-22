import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chat } from "@/integrations/api/client";

interface ChatMessage {
  id: string;
  content: string;
  sender_type: "visitor" | "ai" | "agent";
  created_at: string;
}

const FALLBACK_MESSAGE =
  "I'm sorry, I'm having trouble right now. Please try again or contact us at info@ecctechnologies.ai.";

function getSessionId() {
  let sid = sessionStorage.getItem("ecc_chat_session");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("ecc_chat_session", sid);
  }
  return sid;
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sendingRef = useRef(false);

  const fetchMessages = useCallback(async (convId: string) => {
    // Skip polling while a message is being sent to avoid clobbering optimistic state
    if (sendingRef.current) return;

    try {
      const data = await chat.fetchMessages({
        conversation_id: convId,
        session_id: getSessionId(),
      });

      if (Array.isArray(data?.messages) && data.messages.length > 0) {
        setMessages(data.messages as ChatMessage[]);
      }
    } catch (err) {
      console.error("Failed to fetch chat messages:", err);
    }
  }, []);

  useEffect(() => {
    if (!conversationId || !started) return;

    pollingRef.current = setInterval(() => {
      void fetchMessages(conversationId);
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [conversationId, started, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const startChat = async () => {
    if (!name.trim() || starting) return;

    setStarting(true);

    try {
      const data = await chat.startChat({
        session_id: getSessionId(),
        visitor_name: name.trim(),
        visitor_email: email.trim() || null,
      });

      if (!data?.conversation_id) {
        throw new Error("No conversation_id returned");
      }

      setConversationId(data.conversation_id);
      setStarted(true);

      if (data.welcome_message) {
        setMessages([data.welcome_message as ChatMessage]);
      }
    } catch (err) {
      console.error("Failed to start chat:", err);
      toast.error("Couldn't start the chat. Please try again.");
    } finally {
      setStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversationId || loading) return;

    const userMsg = input.trim();
    const tempId = crypto.randomUUID();
    const visitorMessage: ChatMessage = {
      id: tempId,
      content: userMsg,
      sender_type: "visitor",
      created_at: new Date().toISOString(),
    };

    setInput("");
    setMessages((prev) => [...prev, visitorMessage]);
    setLoading(true);
    sendingRef.current = true;

    try {
      const data = await chat.sendMessage({
        conversation_id: conversationId,
        message: userMsg,
        session_id: getSessionId(),
      });

      // Replace optimistic visitor message with real DB record + append AI reply
      if (data?.visitor_message && data?.reply_message) {
        setMessages((prev) => {
          const withoutOptimistic = prev.filter((m) => m.id !== tempId);
          return [
            ...withoutOptimistic,
            data.visitor_message as ChatMessage,
            data.reply_message as ChatMessage,
          ];
        });
        return;
      }

      if (data?.reply_message) {
        setMessages((prev) => [...prev, data.reply_message as ChatMessage]);
        return;
      }

      // Fallback
      setMessages((prev) => {
        if (prev.some((m) => m.content === FALLBACK_MESSAGE && m.sender_type === "ai")) return prev;
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: FALLBACK_MESSAGE,
            sender_type: "ai" as const,
            created_at: new Date().toISOString(),
          },
        ];
      });
    } catch (err) {
      console.error("Failed to send chat message:", err);
      toast.error("The chat assistant is unavailable right now.");
      setMessages((prev) => {
        if (prev.some((m) => m.content === FALLBACK_MESSAGE && m.sender_type === "ai")) return prev;
        return [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: FALLBACK_MESSAGE,
            sender_type: "ai" as const,
            created_at: new Date().toISOString(),
          },
        ];
      });
    } finally {
      setLoading(false);
      sendingRef.current = false;
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-opacity hover:opacity-90"
            aria-label="Open chat"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex h-[520px] max-h-[calc(100vh-3rem)] w-[380px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex flex-shrink-0 items-center justify-between bg-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <div>
                  <div className="font-display text-sm font-semibold">ECC Assistant</div>
                  <div className="text-xs opacity-80">Online</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:opacity-70" aria-label="Close chat">
                <X className="h-5 w-5" />
              </button>
            </div>

            {!started ? (
              <div className="flex flex-1 flex-col justify-center gap-4 p-6">
                <p className="text-center text-sm text-muted-foreground">
                  Welcome! Please enter your details to start chatting.
                </p>
                <Input
                  placeholder="Your Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={starting}
                />
                <Input
                  placeholder="Email (optional)"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={starting}
                />
                <Button
                  onClick={startChat}
                  disabled={!name.trim() || starting}
                  className="bg-primary hover:opacity-90"
                >
                  {starting ? "Starting..." : "Start Chat"}
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${msg.sender_type === "visitor" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.sender_type !== "visitor" && (
                          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                            msg.sender_type === "visitor"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <div className="prose prose-sm max-w-none [&>p]:m-0 dark:prose-invert">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        </div>
                        {msg.sender_type === "visitor" && (
                          <div className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                            <User className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    ))}

                    {loading && (
                      <div className="flex gap-2">
                        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Bot className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="rounded-xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                          Thinking...
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex flex-shrink-0 gap-2 border-t border-border p-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void sendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="bg-primary hover:opacity-90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
