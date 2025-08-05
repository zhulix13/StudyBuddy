import { useState, useEffect } from "react"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Typography from '@tiptap/extension-typography'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  Link as LinkIcon,
  CheckSquare,
  Type,
  X,
  Plus,
  Pin,
  Lock,
  Unlock,
  Loader2
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Toggle } from "@/components/ui/toggle"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Note, NewNote } from "@/types/notes"

interface NoteEditorProps {
  groupId: string
  initialNote?: Partial<Note>
  onSave: (note: NewNote) => void
  onCancel: () => void
  isEditing?: boolean
  isLoading?: boolean
}

export const NoteEditor = ({ 
  groupId, 
  initialNote, 
  onSave, 
  onCancel, 
  isEditing = false,
  isLoading = false
}: NoteEditorProps) => {
  const [title, setTitle] = useState(initialNote?.title || "")
  const [tags, setTags] = useState<string[]>(initialNote?.tags || [])
  const [currentTag, setCurrentTag] = useState("")
  const [isPrivate, setIsPrivate] = useState(initialNote?.is_private ?? true)
  const [pinned, setPinned] = useState(initialNote?.pinned ?? false)

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
        placeholder: 'Start writing your note...',
      }),
      Typography,
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
          class: 'text-blue-600 underline hover:text-blue-800',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph', 'listItem', 'taskItem'],
      }),
    ],
    content: initialNote?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] sm:min-h-[400px] p-3 sm:p-4',
      },
    },
  })

  // Reset form when initialNote changes (for editing mode)
  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || "")
      setTags(initialNote.tags || [])
      setIsPrivate(initialNote.is_private ?? true)
      setPinned(initialNote.pinned ?? false)
      if (editor && initialNote.content) {
        editor.commands.setContent(initialNote.content)
      }
    }
  }, [initialNote, editor])

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleSave = () => {
    if (title.trim() && editor?.getJSON()) {
      onSave({
        title: title.trim(),
        content: editor.getJSON(),
        group_id: groupId,
        is_private: isPrivate,
        tags,
        pinned,
      })
    }
  }

  const canSave = title.trim() && editor?.getText().trim() && !isLoading

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50/50">
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {isEditing ? 'Edit Note' : 'New Note'}
          </h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPinned(!pinned)}
            className={`${pinned ? "text-amber-600" : "text-gray-400"} hidden sm:flex`}
            disabled={isLoading}
          >
            <Pin className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPrivate(!isPrivate)}
            className={`${isPrivate ? "text-red-600" : "text-green-600"} hidden sm:flex`}
            disabled={isLoading}
          >
            {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!canSave}
            className="bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
          >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>

      {/* Title Input */}
      <div className="p-3 sm:p-4 border-b">
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg sm:text-xl font-semibold border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-gray-400"
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
              className={pinned ? "text-amber-600" : "text-gray-400"}
              disabled={isLoading}
            >
              <Pin className="w-4 h-4 mr-1" />
              Pin
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPrivate(!isPrivate)}
              className={isPrivate ? "text-red-600" : "text-green-600"}
              disabled={isLoading}
            >
              {isPrivate ? <Lock className="w-4 h-4 mr-1" /> : <Unlock className="w-4 h-4 mr-1" />}
              {isPrivate ? 'Private' : 'Shared'}
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

      {/* Toolbar */}
      <div className="p-2 sm:p-3 border-b bg-gray-50/50 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {/* Text Formatting */}
          <Toggle
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            size="sm"
            disabled={isLoading}
          >
            <Bold className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            size="sm"
            disabled={isLoading}
          >
            <Italic className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive('strike')}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            size="sm"
            disabled={isLoading}
          >
            <Strikethrough className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive('code')}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            size="sm"
            disabled={isLoading}
          >
            <Code className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive('highlight')}
            onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
            size="sm"
            disabled={isLoading}
          >
            <HighlightIcon className="w-4 h-4" />
          </Toggle>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <Type className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-1">
              {[1, 2, 3].map((level) => (
                <Button
                  key={level}
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start ${
                    editor.isActive('heading', { level }) ? 'bg-gray-100' : ''
                  }`}
                  onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                >
                  Heading {level}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${
                  editor.isActive('paragraph') ? 'bg-gray-100' : ''
                }`}
                onClick={() => editor.chain().focus().setParagraph().run()}
              >
                Paragraph
              </Button>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <Toggle
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            size="sm"
            disabled={isLoading}
          >
            <List className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            size="sm"
            disabled={isLoading}
          >
            <ListOrdered className="w-4 h-4" />
          </Toggle>
          <Toggle
            pressed={editor.isActive('taskList')}
            onPressedChange={() => editor.chain().focus().toggleTaskList().run()}
            size="sm"
            disabled={isLoading}
          >
            <CheckSquare className="w-4 h-4" />
          </Toggle>

          {/* Hide alignment and other controls on small screens */}
          <div className="hidden sm:flex items-center gap-1">
            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment */}
            <Toggle
              pressed={editor.isActive({ textAlign: 'left' })}
              onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
              size="sm"
              disabled={isLoading}
            >
              <AlignLeft className="w-4 h-4" />
            </Toggle>
            <Toggle
              pressed={editor.isActive({ textAlign: 'center' })}
              onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
              size="sm"
              disabled={isLoading}
            >
              <AlignCenter className="w-4 h-4" />
            </Toggle>
            <Toggle
              pressed={editor.isActive({ textAlign: 'right' })}
              onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
              size="sm"
              disabled={isLoading}
            >
              <AlignRight className="w-4 h-4" />
            </Toggle>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Quote & Link */}
            <Toggle
              pressed={editor.isActive('blockquote')}
              onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
              size="sm"
              disabled={isLoading}
            >
              <Quote className="w-4 h-4" />
            </Toggle>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => {
                const url = window.prompt('Enter URL:')
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run()
                }
              }}
            >
              <LinkIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent 
          editor={editor} 
          className="h-full"
        />
      </div>

      {/* Footer Status */}
      <div className="p-2 sm:p-3 border-t bg-gray-50/30 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <span className="hidden sm:inline">{editor.getText().length} characters</span>
          <span className="flex items-center gap-1">
            {isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span className="hidden sm:inline">{isPrivate ? 'Private' : 'Shared'}</span>
          </span>
          {pinned && (
            <span className="flex items-center gap-1 text-amber-600">
              <Pin className="w-3 h-3" />
              <span className="hidden sm:inline">Pinned</span>
            </span>
          )}
        </div>
        <div className="text-gray-400">
          {tags.length > 0 && `${tags.length} tag${tags.length !== 1 ? 's' : ''}`}
        </div>
      </div>
    </div>
  )
}