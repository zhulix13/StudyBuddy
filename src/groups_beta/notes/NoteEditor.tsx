import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Image from "@tiptap/extension-image";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Underline from "@tiptap/extension-underline";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Highlighter as HighlightIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  CheckSquare,
  Type,
  X,
  Plus,
  Pin,
  Lock,
  Unlock,
  Loader2,
  Underline as UnderlineIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Image as ImageIcon,
  Minus,
  Palette,
  Undo,
  Redo,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Note, NewNote } from "@/types/notes";

interface NoteEditorProps {
  groupId: string;
  initialNote?: Partial<Note>;
  onSave: (note: NewNote) => void;
  onCancel: () => void;
  isEditing?: boolean;
  isLoading?: boolean;
}

export const NoteEditor = ({
  groupId,
  initialNote,
  onSave,
  onCancel,
  isEditing = false,
  isLoading = false,
}: NoteEditorProps) => {
  const [title, setTitle] = useState(initialNote?.title || "");
  const [tags, setTags] = useState<string[]>(initialNote?.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [isPrivate, setIsPrivate] = useState(initialNote?.is_private ?? true);
  const [pinned, setPinned] = useState(initialNote?.pinned ?? false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your note...",
      }),
      Typography,
      TextStyle,
      Color.configure({
        types: ["textStyle"],
      }),
      FontFamily.configure({
        types: ["textStyle"],
      }),
      Underline,
      Subscript,
      Superscript,
      Highlight.configure({
        multicolor: true,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline hover:text-blue-800 break-words",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph", "listItem", "taskItem"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-4 border-gray-300",
        },
      }),
    ],
    content: initialNote?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] sm:min-h-[400px] p-3 sm:p-4 break-words overflow-wrap-anywhere",
      },
    },
  });

  // Reset form when initialNote changes (for editing mode)
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || "");
      setTags(initialNote.tags || []);
      setIsPrivate(initialNote.is_private ?? true);
      setPinned(initialNote.pinned ?? false);
      if (editor && initialNote.content) {
        editor.commands.setContent(initialNote.content);
      }
    }
  }, [initialNote, editor]);

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSave = () => {
    if (title.trim() && editor?.getJSON()) {
      onSave({
        title: title.trim(),
        content: editor.getJSON(),
        group_id: groupId,
        is_private: isPrivate,
        tags,
        pinned,
      });
    }
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    if (editor) {
      editor
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    }
  };

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url })
      .run();
  };

  const canSave = title.trim() && editor?.getText().trim() && !isLoading;

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  // Re-render on editor updates so isActive(...) stays in sync
  const [, setUiTick] = useState(0);

  useEffect(() => {
    if (!editor) return;
    const tick = () => setUiTick((x) => x + 1);

    editor.on("selectionUpdate", tick);
    editor.on("transaction", tick);
    editor.on("update", tick);
    editor.on("focus", tick);
    editor.on("blur", tick);

    return () => {
      editor.off("selectionUpdate", tick);
      editor.off("transaction", tick);
      editor.off("update", tick);
      editor.off("focus", tick);
      editor.off("blur", tick);
    };
  }, [editor]);

  const colors = [
    "#000000",
    "#333333",
    "#666666",
    "#999999",
    "#CCCCCC",
    "#FF0000",
    "#FF6B00",
    "#FFCC00",
    "#66FF00",
    "#00FF66",
    "#0066FF",
    "#6600FF",
    "#CC00FF",
    "#FF0066",
  ];

  const fontFamilies = [
    { value: "Inter", label: "Inter" },
    { value: "Arial", label: "Arial" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier New" },
    { value: "Helvetica", label: "Helvetica" },
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {isEditing ? "Edit Note" : "New Note"}
          </h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPinned(!pinned)}
            className={`${
              pinned ? "text-amber-600 bg-amber-50" : "text-gray-400"
            } hidden sm:flex`}
            disabled={isLoading}
          >
            <Pin className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`${
              isPrivate
                ? "text-red-600 bg-red-50"
                : "text-green-600 bg-green-50"
            } hidden sm:flex`}
            disabled={isLoading}
          >
            {isPrivate ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Unlock className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
            className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Update" : "Save"}
          </Button>
        </div>
      </div>

      {/* Title Input */}
      <div className="p-3 sm:p-4 border-b">
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg sm:text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-gray-400 break-words"
          disabled={isLoading}
        />
      </div>

      {/* Mobile Privacy/Pin Controls */}
      <div className="p-3 border-b bg-gray-50/30 sm:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPinned(!pinned)}
              className={`${
                pinned ? "text-amber-600 bg-amber-50" : "text-gray-400"
              }`}
              disabled={isLoading}
            >
              <Pin className="w-4 h-4 mr-1" />
              Pin
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`${
                isPrivate
                  ? "text-red-600 bg-red-50"
                  : "text-green-600 bg-green-50"
              }`}
              disabled={isLoading}
            >
              {isPrivate ? (
                <Lock className="w-4 h-4 mr-1" />
              ) : (
                <Unlock className="w-4 h-4 mr-1" />
              )}
              {isPrivate ? "Private" : "Shared"}
            </Button>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="p-3 sm:p-4 border-b bg-gray-50/30">
        <div className="flex flex-wrap gap-2 mb-3">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-auto p-0 hover:bg-transparent"
                onClick={() => removeTag(tag)}
                disabled={isLoading}
              >
                <X className="w-3 h-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add tags..."
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-sm"
            disabled={isLoading}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={addTag}
            disabled={!currentTag.trim() || isLoading}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Toolbar */}
      <div className="p-2 sm:p-3 border-b bg-gray-50/50 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {/* Undo/Redo */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().undo().run()}
                  disabled={!editor.can().undo() || isLoading}
                  className="hover:bg-gray-200"
                >
                  <Undo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().redo().run()}
                  disabled={!editor.can().redo() || isLoading}
                  className="hover:bg-gray-200"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Font Family */}
          <div className="hidden sm:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={
                      editor.getAttributes("textStyle")?.fontFamily || "Inter"
                    }
                    onValueChange={(value: any) => {
                      if (value === "Inter") {
                        editor.chain().focus().unsetFontFamily().run();
                      } else {
                        editor.chain().focus().setFontFamily(value).run();
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Font Family</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Separator
            orientation="vertical"
            className="h-6 mx-1 hidden sm:block"
          />

          {/* Text Formatting */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("bold")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleBold().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("bold")
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-200"
                  } cursor-pointer`}
                >
                  <Bold className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bold</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("italic")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleItalic().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("italic")
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Italic className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Italic</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("underline")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleUnderline().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("underline")
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <UnderlineIcon className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Underline</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("strike")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleStrike().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("strike")
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Strikethrough className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Strikethrough</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("code")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleCode().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("code")
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <Code className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Subscript/Superscript */}
          <div className="hidden sm:flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={editor.isActive("subscript")}
                    onPressedChange={() =>
                      editor.chain().focus().toggleSubscript().run()
                    }
                    size="sm"
                    disabled={isLoading}
                    className={`${
                      editor.isActive("subscript")
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <SubscriptIcon className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Subscript</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={editor.isActive("superscript")}
                    onPressedChange={() =>
                      editor.chain().focus().toggleSuperscript().run()
                    }
                    size="sm"
                    disabled={isLoading}
                    className={`${
                      editor.isActive("superscript")
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <SuperscriptIcon className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Superscript</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Color */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className={`hover:bg-gray-200 relative ${
                        editor.isActive("textStyle", {
                          color: editor.getAttributes("textStyle").color,
                        })
                          ? "border-blue-500"
                          : ""
                      }`}
                      style={{
                        backgroundColor:
                          editor.getAttributes("textStyle").color ||
                          "transparent",
                      }}
                    >
                      <Palette
                        className="w-4 h-4"
                       
                      />
                      {/* Optional: Add a visual indicator (e.g., colored underline) */}
                      {editor.getAttributes("textStyle").color && (
                        <span
                          className="absolute bottom-0 left-0 w-full h-1"
                          style={{
                            backgroundColor:
                              editor.getAttributes("textStyle").color,
                          }}
                        />
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-3">
                    <div className="grid grid-cols-7 gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          className={`w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform ${
                            editor.isActive("textStyle", { color })
                              ? "ring-2 ring-blue-500"
                              : ""
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() =>
                            editor.chain().focus().setColor(color).run()
                          }
                        />
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                      onClick={() => editor.chain().focus().unsetColor().run()}
                    >
                      Remove Color
                    </Button>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text Color</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Highlight */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("highlight")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleHighlight().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("highlight")
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <HighlightIcon className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Highlight</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isLoading}
                      className="hover:bg-gray-200"
                    >
                      <Type className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1">
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                      <Button
                        key={level}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start ${
                          editor.isActive("heading", { level })
                            ? "bg-blue-100 text-blue-700"
                            : ""
                        }`}
                        onClick={() =>
                          editor.chain().focus().toggleHeading({ level }).run()
                        }
                      >
                        Heading {level}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${
                        editor.isActive("paragraph")
                          ? "bg-blue-100 text-blue-700"
                          : ""
                      }`}
                      onClick={() =>
                        editor.chain().focus().setParagraph().run()
                      }
                    >
                      Paragraph
                    </Button>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text Style</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("bulletList")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleBulletList().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("bulletList")
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <List className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bullet List</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("orderedList")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleOrderedList().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("orderedList")
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <ListOrdered className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Numbered List</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle
                  pressed={editor.isActive("taskList")}
                  onPressedChange={() =>
                    editor.chain().focus().toggleTaskList().run()
                  }
                  size="sm"
                  disabled={isLoading}
                  className={`${
                    editor.isActive("taskList")
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <CheckSquare className="w-4 h-4" />
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>
                <p>Task List</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Desktop-only features */}
          <div className="hidden sm:flex items-center gap-1">
            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={editor.isActive({ textAlign: "left" })}
                    onPressedChange={() =>
                      editor.chain().focus().setTextAlign("left").run()
                    }
                    size="sm"
                    disabled={isLoading}
                    className={`${
                      editor.isActive({ textAlign: "left" })
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Left</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={editor.isActive({ textAlign: "center" })}
                    onPressedChange={() =>
                      editor.chain().focus().setTextAlign("center").run()
                    }
                    size="sm"
                    disabled={isLoading}
                    className={`${
                      editor.isActive({ textAlign: "center" })
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <AlignCenter className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Center</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={editor.isActive({ textAlign: "right" })}
                    onPressedChange={() =>
                      editor.chain().focus().setTextAlign("right").run()
                    }
                    size="sm"
                    disabled={isLoading}
                    className={`${
                      editor.isActive({ textAlign: "right" })
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <AlignRight className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Align Right</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={editor.isActive({ textAlign: "justify" })}
                    onPressedChange={() =>
                      editor.chain().focus().setTextAlign("justify").run()
                    }
                    size="sm"
                    disabled={isLoading}
                    className={`${
                      editor.isActive({ textAlign: "justify" })
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <AlignJustify className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Justify</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Quote & Link */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Toggle
                    pressed={editor.isActive("blockquote")}
                    onPressedChange={() =>
                      editor.chain().focus().toggleBlockquote().run()
                    }
                    size="sm"
                    disabled={isLoading}
                    className={`${
                      editor.isActive("blockquote")
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <Quote className="w-4 h-4" />
                  </Toggle>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Quote</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={setLink}
                    className={`${
                      editor.isActive("link")
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Table & Image */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={addTable}
                    className="hover:bg-gray-200"
                  >
                    <TableIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Insert Table</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={addImage}
                    className="hover:bg-gray-200"
                  >
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Insert Image</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() =>
                      editor.chain().focus().setHorizontalRule().run()
                    }
                    className="hover:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Horizontal Rule</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Footer Status */}
      <div className="p-2 sm:p-3 border-t bg-gray-50/30 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline">
            {editor.getText().length} characters
          </span>
          <span className="hidden sm:inline">
            {
              editor
                .getText()
                .split(" ")
                .filter((word) => word.length > 0).length
            }{" "}
            words
          </span>
          <span className="flex items-center gap-1">
            {isPrivate ? (
              <Lock className="w-3 h-3" />
            ) : (
              <Unlock className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">
              {isPrivate ? "Private" : "Shared"}
            </span>
          </span>
          {pinned && (
            <span className="flex items-center gap-1 text-amber-600">
              <Pin className="w-3 h-3" />
              <span className="hidden sm:inline">Pinned</span>
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {tags.length > 0 &&
            `${tags.length} tag${tags.length !== 1 ? "s" : ""}`}
        </div>
      </div>
    </div>
  );
};
