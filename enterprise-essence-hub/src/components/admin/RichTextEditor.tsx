import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  RotateCcw,
  Undo2,
  Redo2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table as TableIcon,
} from "lucide-react";
import "./RichTextEditor.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder = "Start typing..." }: RichTextEditorProps) {
  const [linkDialog, setLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [imageDialog, setImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          HTMLAttributes: {
            class: "mb-2",
          },
        },
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: "bg-muted p-3 rounded font-mono text-sm overflow-x-auto",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline.configure(),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
      setCharCount(editor.getText().length);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-96 p-4 rounded-md border border-input bg-background text-foreground",
      },
    },
  });

  if (!editor) {
    return <div className="w-full h-96 border border-border rounded-lg animate-pulse bg-muted" />;
  }

  const addLink = () => {
    if (!linkUrl.trim()) return;
    editor.chain().focus().setLink({ href: linkUrl }).run();
    setLinkDialog(false);
    setLinkUrl("");
    setLinkText("");
  };

  const addImage = () => {
    if (!imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageDialog(false);
    setImageUrl("");
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const toggleBold = () => editor.chain().focus().toggleBold().run();
  const toggleItalic = () => editor.chain().focus().toggleItalic().run();
  const toggleStrike = () => editor.chain().focus().toggleStrike().run();
  const toggleUnderline = () => editor.chain().focus().toggleUnderline().run();
  const toggleH1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
  const toggleH2 = () => editor.chain().focus().toggleHeading({ level: 2 }).run();
  const toggleH3 = () => editor.chain().focus().toggleHeading({ level: 3 }).run();
  const toggleBullet = () => editor.chain().focus().toggleBulletList().run();
  const toggleOrderedList = () => editor.chain().focus().toggleOrderedList().run();
  const toggleBlockquote = () => editor.chain().focus().toggleBlockquote().run();
  const toggleCode = () => editor.chain().focus().toggleCode().run();
  const clearFormatting = () => editor.chain().focus().clearNodes().unsetAllMarks().run();
  const undo = () => editor.chain().focus().undo().run();
  const redo = () => editor.chain().focus().redo().run();

  const isActive = (fn: () => boolean): boolean => {
    try {
      return fn();
    } catch {
      return false;
    }
  };

  const btnClass = (active: boolean) =>
    `p-2 rounded transition-colors text-xs sm:text-sm ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-foreground hover:bg-muted/80"
    }`;

  return (
    <div className="space-y-2 border border-border rounded-lg bg-background overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border-b border-border bg-muted/30 overflow-x-auto">
        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={undo}
            className={btnClass(false)}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={redo}
            className={btnClass(false)}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        {/* Text Style */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleBold}
            className={btnClass(isActive(() => editor.isActive("bold")))}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleItalic}
            className={btnClass(isActive(() => editor.isActive("italic")))}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleUnderline}
            className={btnClass(isActive(() => editor.isActive("underline")))}
            title="Underline (Ctrl+U)"
          >
            <u className="text-sm">U</u>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleStrike}
            className={btnClass(isActive(() => editor.isActive("strike")))}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        {/* Headings */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleH1}
            className={btnClass(isActive(() => editor.isActive("heading", { level: 1 })))}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleH2}
            className={btnClass(isActive(() => editor.isActive("heading", { level: 2 })))}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleH3}
            className={btnClass(isActive(() => editor.isActive("heading", { level: 3 })))}
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        {/* Alignment */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={btnClass(isActive(() => editor.isActive({ textAlign: "left" })))}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={btnClass(isActive(() => editor.isActive({ textAlign: "center" })))}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={btnClass(isActive(() => editor.isActive({ textAlign: "right" })))}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        {/* Lists */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleBullet}
            className={btnClass(isActive(() => editor.isActive("bulletList")))}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleOrderedList}
            className={btnClass(isActive(() => editor.isActive("orderedList")))}
            title="Ordered List"
          >
            <ListOrdered className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        {/* Blocks */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleBlockquote}
            className={btnClass(isActive(() => editor.isActive("blockquote")))}
            title="Blockquote"
          >
            <Quote className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={toggleCode}
            className={btnClass(isActive(() => editor.isActive("code")))}
            title="Inline Code"
          >
            <Code className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        {/* Media & Table */}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setLinkDialog(true)}
            className="p-2 rounded transition-colors text-xs sm:text-sm bg-muted text-foreground hover:bg-muted/80"
            title="Add Link"
          >
            <LinkIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setImageDialog(true)}
            className="p-2 rounded transition-colors text-xs sm:text-sm bg-muted text-foreground hover:bg-muted/80"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={insertTable}
            className="p-2 rounded transition-colors text-xs sm:text-sm bg-muted text-foreground hover:bg-muted/80"
            title="Insert Table"
          >
            <TableIcon className="w-4 h-4" />
          </Button>
        </div>

        <div className="w-px bg-border" />

        {/* Clear */}
        <Button
          size="sm"
          variant="ghost"
          onClick={clearFormatting}
          className="p-2 rounded transition-colors text-xs sm:text-sm bg-muted text-foreground hover:bg-muted/80"
          title="Clear Formatting"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Character count */}
      <div className="px-3 py-2 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        {charCount} characters
      </div>

      {/* Link Dialog */}
      <Dialog open={linkDialog} onOpenChange={setLinkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                onKeyPress={(e) => e.key === 'Enter' && addLink()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialog(false)}>Cancel</Button>
            <Button onClick={addLink}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={imageDialog} onOpenChange={setImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                onKeyPress={(e) => e.key === 'Enter' && addImage()}
              />
            </div>
            {imageUrl && (
              <div className="border border-border rounded-lg p-2">
                <img src={imageUrl} alt="Preview" className="max-w-full max-h-48 rounded" onError={() => {}} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialog(false)}>Cancel</Button>
            <Button onClick={addImage}>Add Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
