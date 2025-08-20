"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"

// TipTap imports
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Typography from "@tiptap/extension-typography"
import Highlight from "@tiptap/extension-highlight"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import Subscript from "@tiptap/extension-subscript"
import Superscript from "@tiptap/extension-superscript"
import Underline from "@tiptap/extension-underline"
import Color from "@tiptap/extension-color"
import BulletList from "@tiptap/extension-bullet-list"
import OrderedList from "@tiptap/extension-ordered-list"
import { FontSize } from "@tiptap/extension-text-style"
import { TextStyle } from "@tiptap/extension-text-style"
import FontFamily from "@tiptap/extension-font-family"
import { TiptapImage } from "./extensions/tiptap-image-extension"
import Focus from "@tiptap/extension-focus"
import BubbleMenu from "@tiptap/extension-bubble-menu"
import { Dropcursor } from "@tiptap/extension-dropcursor"
import { Gapcursor } from "@tiptap/extension-gapcursor"
import CharacterCount from "@tiptap/extension-character-count"

// Store import
import { useNoteStore } from "@/store/noteStore"

// UI Component imports
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, X, Plus, Pin, Lock, Unlock, Loader2, Save, Send, CheckCircle2 } from "lucide-react"


// Tool imports
import UndoTool from "./tiptap-tools/undo"
import FontFamilies from "./tiptap-tools/fontFamily"
import TextFormat from "./tiptap-tools/TextFormat"
import SubscriptTool from "./tiptap-tools/subscript"
import TextColor from "./tiptap-tools/textColor"
import HighlightTool from "./tiptap-tools/highlight"
import Lists from "./tiptap-tools/Lists"
import Alignment from "./tiptap-tools/Alignment"
import QuoteTool from "./tiptap-tools/Quote"
import TableImageRuler from "./tiptap-tools/Table"
import Headings from "./tiptap-tools/headings"
import FontSizeTool from "./tiptap-tools/fontSize"
import { ImageAlignment } from "./ImageAlignment"

// Styles
import '@/tiptap.css'


// Types
import type { Note, NewNote } from "@/types/notes"

interface NoteEditorProps {
  groupId: string
  initialNote?: Partial<Note>
  onSave: (note: NewNote) => void
  onSaveDraft: (note: NewNote) => void
  onCancel: () => void
  isEditing?: boolean
  isLoading?: boolean
}

// Utility function
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Main component
export default function NoteEditor({
  groupId,
  initialNote,
  onSave,
  onSaveDraft,
  onCancel,
  isEditing = false,
  isLoading = false,
}: NoteEditorProps) {



  //Note store hooks
   const {
    editingNote,
    draftNote,
    saveDraftLocally,
    clearLocalDraft,
    isDirty,
    setIsDirty,
  } = useNoteStore();

   // State declarations
  const [title, setTitle] = useState(initialNote?.title || draftNote?.title || "")
  const [tags, setTags] = useState<string[]>(initialNote?.tags || draftNote?.tags || [])
  const [currentTag, setCurrentTag] = useState("")
  const [isPrivate, setIsPrivate] = useState(initialNote?.is_private ?? draftNote?.is_private ?? false)
  const [pinned, setPinned] = useState(initialNote?.pinned ?? draftNote?.pinned ?? false)
  const [, setUiTick] = useState(0)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)


  // Editor configuration
const editor = useEditor({
    extensions: [
    StarterKit.configure({
      bulletList: false,
      orderedList: false,
    }),
    BulletList.configure({ keepMarks: true, keepAttributes: false }),
    OrderedList.configure({ keepMarks: true, keepAttributes: false }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({ placeholder: "Start writing your note..." }),
    Typography,
    TextStyle,
    Color.configure({ types: ["textStyle"] }),
    FontFamily.configure({ types: ["textStyle"] }),
    FontSize,
    Underline,
    Subscript,
    Superscript,
    Highlight.configure({ multicolor: true }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "underline hover:opacity-80 break-words",
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph", "listItem", "taskItem"],
    }),
    Table.configure({
      resizable: true,
      lastColumnResizable: true,
      HTMLAttributes: {
        class: "my-3",
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
    TiptapImage.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        class: "rounded-lg",
      },
    }),
    HorizontalRule.configure({
      HTMLAttributes: { class: "my-4 border-gray-300" },
    }),
    Focus.configure({
      className: "has-focus", // Add visual focus styling
      mode: "all",
    }),
    BubbleMenu.configure({
      element: null, // We'll create the bubble menu component separately
    }),
    Dropcursor.configure({
      color: "#3b82f6", // Blue cursor when dragging
      width: 2,
    }),
    Gapcursor,
    CharacterCount.configure({
      limit: 10000, // Optional character limit
    }),
  ],
  content: initialNote?.content || "",
  editorProps: {
    attributes: {
      class:
        "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] sm:min-h-[400px] p-3 sm:p-4 break-words overflow-wrap-anywhere editor-shell",
    },
    handleKeyDown: (view, event) => {
      // Handle Tab key for indentation
      if (event.key === "Tab") {
        event.preventDefault()
        const { state, dispatch } = view
        const { selection } = state

        if (event.shiftKey) {
          // Shift+Tab: Outdent
          const tr = state.tr.insertText("", selection.from - 2, selection.from)
          dispatch(tr)
        } else {
          // Tab: Indent with 2 spaces
          const tr = state.tr.insertText("   ", selection.from, selection.to)
          dispatch(tr)
        }
        return true
      }
      return false
    },
    handlePaste: (view, event) => {
      const items = event.clipboardData?.items
      if (!items) return false
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile()
          if (file) {
            fileToDataURL(file).then((src) => {
              editor?.chain().focus().setImage({ src }).run()
            })
            return true
          }
        }
      }
      return false
    },
    handleDrop: (view, event, _slice, moved) => {
      if (moved) return false
      const dt = event.dataTransfer
      if (!dt || !dt.files?.length) return false
      const file = dt.files[0]
      if (file && file.type.startsWith("image/")) {
        event.preventDefault()
        fileToDataURL(file).then((src) => {
          editor?.chain().focus().setImage({ src }).run()
        })
        return true
      }
      return false
    },
  },
  })



  // Effects


    // Load from local draft if available
    useEffect(() => {
      if (draftNote && !initialNote) {
        setTitle(draftNote.title || "")
        setTags(draftNote.tags || [])
        setIsPrivate(draftNote.is_private ?? false)
        setPinned(draftNote.pinned ?? false)
        if (editor && draftNote.content) {
          editor.commands.setContent(draftNote.content)
        }
      }
    }, [draftNote, editor])
  
    // Auto-save to draft (debounced via store)
    useEffect(() => {
      if (editor && (title || editor.getJSON())) {
        const draftData = {
          title,
          content: editor.getJSON(),
          group_id: groupId,
          is_private: isPrivate,
          tags,
          pinned,
        }
        saveDraftLocally(draftData)
      }
    }, [title, tags, isPrivate, pinned, saveDraftLocally, groupId, editor])
  
    // Show saved indicator when draft is saved
    useEffect(() => {
      if (isDirty) {
        setShowSavedIndicator(true)
        const timer = setTimeout(() => {
          setShowSavedIndicator(false)
          setIsDirty(false)
        }, 2000)
        return () => clearTimeout(timer)
      }
    }, [isDirty, setIsDirty])
  
    // Warn before leaving if unsaved changes
    useEffect(() => {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isDirty) {
          e.preventDefault()
          e.returnValue = ""
        }
      }
  
      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [isDirty])


  useEffect(() => {
    if (initialNote) {
      setTitle(initialNote.title || "")
      setTags(initialNote.tags || [])
      setIsPrivate(initialNote.is_private ?? false)
      setPinned(initialNote.pinned ?? false)
      if (editor && initialNote.content) {
        editor.commands.setContent(initialNote.content)
      }
    }
  }, [initialNote, editor])

  useEffect(() => {
    if (!editor) return
    const tick = () => setUiTick((x) => x + 1)
    editor.on("selectionUpdate", tick)
    editor.on("transaction", tick)
    editor.on("update", tick)
    editor.on("focus", tick)
    editor.on("blur", tick)
    return () => {
      editor.off("selectionUpdate", tick)
      editor.off("transaction", tick)
      editor.off("update", tick)
      editor.off("focus", tick)
      editor.off("blur", tick)
    }
  }, [editor])

  // Event handlers
  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleSaveDraft = useCallback(async () => {
      if (title.trim() && editor?.getJSON()) {
        const noteData = {
          title: title.trim(),
          content: editor.getJSON(),
          group_id: groupId,
          is_private: isPrivate,
          tags,
          pinned,
          status: "draft" as const,
        }
        await onSaveDraft(noteData)
        clearLocalDraft()
      }
    }, [title, editor, groupId, isPrivate, tags, pinned, onSaveDraft, clearLocalDraft])
  
    const handlePublish = useCallback(async () => {
      if (title.trim() && editor?.getJSON()) {
        const noteData = {
          title: title.trim(),
          content: editor.getJSON(),
          group_id: groupId,
          is_private: isPrivate,
          tags,
          pinned,
          status: "published" as const,
        }
        await onSave(noteData)
        clearLocalDraft()
      }
    }, [title, editor, groupId, isPrivate, tags, pinned, onSave, clearLocalDraft])
  
    const handleCancel = useCallback(() => {
      if (isDirty) {
        if (window.confirm("Discard unsaved changes?")) {
          clearLocalDraft()
          onCancel()
        }
      } else {
        onCancel()
      }
    }, [isDirty, clearLocalDraft, onCancel])

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href
    const url = window.prompt("Enter URL:", previousUrl)
    if (url === null) return
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run()
  }

  // Computed values
  const canSave = Boolean(title.trim() && editor?.getText().trim() && !isLoading)

  // Constants
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
  ]

  const fontFamilies = [
    { value: "Inter", label: "Inter" },
    { value: "Arial", label: "Arial" },
    { value: "Georgia", label: "Georgia" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Courier New", label: "Courier New" },
    { value: "Helvetica", label: "Helvetica" },
  ]

  // Early return for loading state
  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    )
  }

  // Render
  return (
    <div className="h-full flex flex-col bg-white">
      {/* Enhanced Header */}
           <div className="flex items-center justify-between p-3 sm:p-4 border-b bg-gray-50/50">
             <div className="flex items-center gap-2 sm:gap-3">
               <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isLoading}>
                 <ArrowLeft className="w-4 h-4" />
               </Button>
               <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                 {isEditing ? "Edit Note" : "New Note"}
               </h2>
               
               {/* Auto-save indicator */}
               <div className={`flex items-center gap-2 text-sm transition-all duration-300 ${
                 showSavedIndicator ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
               }`}>
                 <CheckCircle2 className="w-4 h-4 text-green-600 animate-pulse" />
                 <span className="text-green-600 font-medium">Saved</span>
               </div>
             </div>
             
             <div className="flex items-center gap-1 sm:gap-2">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setPinned(!pinned)}
                 className={`${pinned ? "text-amber-600 bg-amber-50" : "text-gray-400"} hidden sm:flex`}
                 disabled={isLoading}
               >
                 <Pin className="w-4 h-4" />
               </Button>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsPrivate(!isPrivate)}
                 className={`${isPrivate ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}
                 disabled={isLoading}
               >
                 {isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
               </Button>
               
               {/* Save as Draft Button */}
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={handleSaveDraft} 
                 disabled={!canSave}
                 className="hidden sm:flex"
               >
                 {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                 <Save className="w-4 h-4 mr-1" />
                 Save Draft
               </Button>
               
               {/* Publish Button */}
               <Button onClick={handlePublish} disabled={!canSave} className="text-sm sm:text-base">
                 {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                 <Send className="w-4 h-4 mr-1 sm:mr-2" />
                 {isEditing ? "Update" : "Publish"}
               </Button>
             </div>
           </div>
     
           {/* Mobile Save Options */}
           <div className="p-3 border-b bg-gray-50/30 sm:hidden">
             <div className="flex items-center gap-2">
               <Button 
                 variant="outline" 
                 size="sm"
                 onClick={handleSaveDraft} 
                 disabled={!canSave}
                 className="flex-1"
               >
                 <Save className="w-4 h-4 mr-1" />
                 Save Draft
               </Button>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setPinned(!pinned)}
                 className={`${pinned ? "text-amber-600 bg-amber-50" : "text-gray-400"}`}
                 disabled={isLoading}
               >
                 <Pin className="w-4 h-4 mr-1" />
                 Pin
               </Button>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setIsPrivate(!isPrivate)}
                 className={`${isPrivate ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}
                 disabled={isLoading}
               >
                 {isPrivate ? <Lock className="w-4 h-4 mr-1" /> : <Unlock className="w-4 h-4 mr-1" />}
                 {isPrivate ? "Private" : "Shared"}
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
              className={`${pinned ? "text-amber-600 bg-amber-50" : "text-gray-400"}`}
              disabled={isLoading}
            >
              <Pin className="w-4 h-4 mr-1" />
              Pin
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`${isPrivate ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50"}`}
              disabled={isLoading}
            >
              {isPrivate ? <Lock className="w-4 h-4 mr-1" /> : <Unlock className="w-4 h-4 mr-1" />}
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
          <Button variant="outline" size="sm" onClick={addTag} disabled={!currentTag.trim() || isLoading}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Enhanced Toolbar */}
      <div className="p-2 sm:p-3 border-b bg-gray-50/50">
        <div className="flex flex-wrap items-center gap-1">
          {/* Undo/Redo */}
          <UndoTool editor={editor} isLoading={isLoading} />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Font Family */}
          <FontFamilies
            editor={editor}
            isLoading={isLoading}
            fontFamilies={fontFamilies}
          />
          <FontSizeTool editor={editor} isLoading={isLoading} />
          <Separator
            orientation="vertical"
            className="h-6 mx-1 hidden sm:block"
          />

          {/* Text Formatting */}
          <TextFormat editor={editor} isLoading={isLoading} />

          {/* Subscript/Superscript */}
          <SubscriptTool editor={editor} isLoading={isLoading} />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Text Color */}
          <TextColor editor={editor} isLoading={isLoading} colors={colors} />

          {/* Highlight */}
          <HighlightTool editor={editor} isLoading={isLoading} />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Headings */}
          <Headings editor={editor} isLoading={isLoading} />

          <Separator orientation="vertical" className="h-6 mx-1" />

          {/* Lists */}
          <Lists editor={editor} isLoading={isLoading} />

          

          {/* Table & Image & Ruler*/}
          <TableImageRuler
            editor={editor}
            isLoading={isLoading}
          />
          <ImageAlignment editor={editor} />
          
          {/* Desktop-only features */}
          <div className="hidden sm:flex items-center gap-1">
            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Alignment */}
            <Alignment editor={editor} isLoading={isLoading} />

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Quote & Link */}
            <QuoteTool
              editor={editor}
              isLoading={isLoading}
              setLink={setLink}
            />

            <Separator orientation="vertical" className="h-6 mx-1" />

            
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto max-w-full">
        <EditorContent editor={editor} className="h-full w-full" />
      </div>

      {/* Footer Status */}
      <div className="p-2 sm:p-3 border-t bg-gray-50/30 text-xs text-gray-500 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden sm:inline">{editor.getText().length} characters</span>
                <span className="hidden sm:inline">
                  {editor.getText().split(" ").filter((word) => word.length > 0).length} words
                </span>
                <span className="flex items-center gap-1">
                  {isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  <span className="hidden sm:inline">{isPrivate ? "Private" : "Shared"}</span>
                </span>
                {pinned && (
                  <span className="flex items-center gap-1 text-amber-600">
                    <Pin className="w-3 h-3" />
                    <span className="hidden sm:inline">Pinned</span>
                  </span>
                )}
                {draftNote && (
                  <span className="flex items-center gap-1 text-blue-600">
                    <Save className="w-3 h-3" />
                    <span className="hidden sm:inline">Draft saved</span>
                  </span>
                )}
              </div>
              <div className="text-gray-400">
                {tags.length > 0 && `${tags.length} tag${tags.length !== 1 ? "s" : ""}`}
              </div>
            </div>
    </div>
  )
}