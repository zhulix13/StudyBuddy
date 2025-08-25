"use client"

import type React from "react"
import { useEffect, useState, useCallback, useRef } from "react"

// TipTap imports (simplified - add remaining imports manually)
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
// ... add other tiptap imports manually

// Store import
import { useNoteStore } from "@/store/noteStore"

// UI Component imports
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  X, 
  Plus, 
  Pin, 
  Lock, 
  Unlock, 
  Loader2, 
  Save, 
  Send, 
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Settings,
  Palette
} from "lucide-react"

// Tool imports (simplified - add remaining imports manually)
import UndoTool from "./tiptap-tools/undo"
import FontFamilies from "./tiptap-tools/fontFamily"
// ... add other tool imports manually

// Modal import
import { UnsavedChangesModal } from "./UnsavedChangesModal"

// Styles
import "@/tiptap.css"

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
  // Note store hooks
  const {
    editingNote,
    draftNote,
    saveDraftLocally,
    clearLocalDraft,
    loadDraftForGroup,
    isDirty,
    setIsDirty,
    originalContent,
    setOriginalContent,
    checkIfDirty,
  } = useNoteStore()

  // State declarations
  const [title, setTitle] = useState(initialNote?.title || "")
  const [tags, setTags] = useState<string[]>(initialNote?.tags || [])
  const [currentTag, setCurrentTag] = useState("")
  const [isPrivate, setIsPrivate] = useState(initialNote?.is_private ?? false)
  const [pinned, setPinned] = useState(initialNote?.pinned ?? false)
  const [uiTick, setUiTick] = useState(0)
  const [showSavedIndicator, setShowSavedIndicator] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  
  // New UI state for collapsible sections
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false)
  const [isMetaCollapsed, setIsMetaCollapsed] = useState(false)
  const [showTagInput, setShowTagInput] = useState(false)
  
  // Use refs to prevent infinite loops
  const isInitialized = useRef(false)
  const lastSavedContent = useRef<string>("")
  const debounceTimer = useRef<NodeJS.Timeout>(null)

  // Editor configuration (simplified - add remaining extensions manually)
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
      }),
      Placeholder.configure({ 
        placeholder: "Start writing your note...",
        emptyNodeClass: 'first:before:text-gray-400 dark:first:before:text-gray-500 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:pointer-events-none first:before:h-0'
      }),
      // ... add other extensions manually
    ],
    content: initialNote?.content || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[300px] sm:min-h-[400px] p-3 sm:p-4 break-words overflow-wrap-anywhere editor-shell dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-gray-100 prose-p:text-gray-700 dark:prose-p:text-gray-300",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Tab") {
          event.preventDefault()
          const { state, dispatch } = view
          const { selection } = state

          if (event.shiftKey) {
            const tr = state.tr.insertText("", selection.from - 2, selection.from)
            dispatch(tr)
          } else {
            const tr = state.tr.insertText("   ", selection.from, selection.to)
            dispatch(tr)
          }
          return true
        }
        return false
      },
      // ... add other handlers manually
    },
  })

  // Initialize component once (keeping existing logic)
  useEffect(() => {
    if (!isInitialized.current) {
      loadDraftForGroup(groupId)
      
      if (initialNote) {
        setOriginalContent({
          title: initialNote.title || "",
          content: initialNote.content || null,
          tags: initialNote.tags || [],
          is_private: initialNote.is_private ?? false,
          pinned: initialNote.pinned ?? false,
        })
      } else {
        setOriginalContent(null)
      }
      
      isInitialized.current = true
    }
  }, [groupId, initialNote, loadDraftForGroup, setOriginalContent])

  // Load draft data (keeping existing logic)
  useEffect(() => {
    if (draftNote && !initialNote && isInitialized.current) {
      setTitle(draftNote.title || "")
      setTags(draftNote.tags || [])
      setIsPrivate(draftNote.is_private ?? false)
      setPinned(draftNote.pinned ?? false)
      if (editor && draftNote.content) {
        editor.commands.setContent(draftNote.content)
      }
    }
  }, [draftNote, editor, initialNote])

  // Debounced save function (keeping existing logic)
  const debouncedSave = useCallback((draftData: any) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    debounceTimer.current = setTimeout(() => {
      const contentString = JSON.stringify(draftData.content)
      if (contentString !== lastSavedContent.current) {
        saveDraftLocally(draftData, groupId)
        lastSavedContent.current = contentString
      }
    }, 500)
  }, [saveDraftLocally, groupId])

  // Handle content changes (keeping existing logic)
  useEffect(() => {
    if (editor && isInitialized.current) {
      const currentContent = editor.getJSON()
      const contentString = JSON.stringify(currentContent)
      
      if (contentString !== lastSavedContent.current) {
        checkIfDirty(title, currentContent, tags, isPrivate, pinned)

        if (title.trim() || editor.getText().trim() || tags.length > 0) {
          const draftData = {
            title,
            content: currentContent,
            group_id: groupId,
            is_private: isPrivate,
            tags,
            pinned,
          }
          debouncedSave(draftData)
        }
      }
    }
  }, [title, tags, isPrivate, pinned, editor, checkIfDirty, debouncedSave])

  // Editor event handlers (keeping existing logic)
  useEffect(() => {
    if (!editor || !isInitialized.current) return

    const handleUpdate = () => {
      setUiTick(prev => prev + 1)
      
      const currentContent = editor.getJSON()
      const contentString = JSON.stringify(currentContent)
      
      if (contentString !== lastSavedContent.current) {
        checkIfDirty(title, currentContent, tags, isPrivate, pinned)

        if (title.trim() || editor.getText().trim() || tags.length > 0) {
          const draftData = {
            title,
            content: currentContent,
            group_id: groupId,
            is_private: isPrivate,
            tags,
            pinned,
          }
          debouncedSave(draftData)
        }
      }
    }

    editor.on("update", handleUpdate)
    
    return () => {
      editor.off("update", handleUpdate)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [editor, title, groupId, isPrivate, tags, pinned, checkIfDirty, debouncedSave])

  // Show saved indicator (keeping existing logic)
  useEffect(() => {
    if (!isDirty && (title || editor?.getText())) {
      setShowSavedIndicator(true)
      const timer = setTimeout(() => {
        setShowSavedIndicator(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isDirty, title, editor])

  // Handle beforeunload (keeping existing logic)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

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
    if (e.key === "Escape") {
      setShowTagInput(false)
      setCurrentTag("")
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
      clearLocalDraft(groupId)
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
      clearLocalDraft(groupId)
    }
  }, [title, editor, groupId, isPrivate, tags, pinned, onSave, clearLocalDraft])

  const handleSaveDraftAndLeave = useCallback(async () => {
    setShowUnsavedModal(false)
    if (title.trim() && editor?.getJSON()) {
      await handleSaveDraft()
    }
    onCancel()
  }, [title, editor, handleSaveDraft, onCancel])

  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedModal(false)
    clearLocalDraft(groupId)
    onCancel()
  }, [clearLocalDraft, groupId, onCancel])

  const handleCancelNavigation = useCallback(() => {
    setShowUnsavedModal(false)
  }, [])

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

  // Constants (keeping existing)
  const colors = [
    "#000000", "#333333", "#666666", "#999999", "#CCCCCC",
    "#FF0000", "#FF6B00", "#FFCC00", "#66FF00", "#00FF66",
    "#0066FF", "#6600FF", "#CC00FF", "#FF0066",
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
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-900/80">
        <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
      </div>
    )
  }

  // Render
  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900/80">
      {/* Streamlined Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onCancel} 
            disabled={isLoading}
            className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
            {isEditing ? "Edit Note" : "New Note"}
          </h2>

          <div
            className={`flex items-center gap-1 text-xs transition-all duration-300 ${
              showSavedIndicator ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
            <span className="text-green-600 dark:text-green-400 font-medium hidden sm:inline">Saved</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            disabled={!canSave}
            className="h-8 text-xs bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-600"
          >
            {isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            <Save className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Draft</span>
          </Button>

          <Button 
            onClick={handlePublish} 
            disabled={!canSave} 
            size="sm"
            className="h-8 text-xs bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isLoading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            <Send className="w-3 h-3 mr-1" />
            {isEditing ? "Update" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Compact Title Input */}
      <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
        <Input
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-base sm:text-lg font-medium border-none shadow-none px-0 focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent dark:text-gray-100"
          disabled={isLoading}
        />
      </div>

      {/* Collapsible Meta Section */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
        <div className="flex items-center justify-between px-3 py-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPinned(!pinned)}
              className={`h-7 text-xs ${
                pinned 
                  ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" 
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
              disabled={isLoading}
            >
              <Pin className="w-3 h-3 mr-1" />
              <span className="hidden sm:inline">{pinned ? "Pinned" : "Pin"}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPrivate(!isPrivate)}
              className={`h-7 text-xs ${
                isPrivate 
                  ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" 
                  : "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
              }`}
              disabled={isLoading}
            >
              {isPrivate ? <Lock className="w-3 h-3 mr-1" /> : <Unlock className="w-3 h-3 mr-1" />}
              <span className="hidden sm:inline">{isPrivate ? "Private" : "Shared"}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMetaCollapsed(!isMetaCollapsed)}
            className="h-7 w-7 p-0 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isMetaCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </Button>
        </div>

        {/* Collapsible Tags Section */}
        {!isMetaCollapsed && (
          <div className="px-3 pb-2">
            <div className="flex flex-wrap gap-1 mb-2">
              {tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs h-5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-auto p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                    disabled={isLoading}
                  >
                    <X className="w-2 h-2" />
                  </Button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTagInput(!showTagInput)}
                className="h-5 px-2 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                disabled={isLoading}
              >
                <Plus className="w-3 h-3 mr-1" />
                Tag
              </Button>
            </div>
            {showTagInput && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-xs h-7 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                  disabled={isLoading}
                  autoFocus
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={addTag} 
                  disabled={!currentTag.trim() || isLoading}
                  className="h-7 px-2 text-xs dark:border-gray-600"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collapsible Enhanced Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
        <div className="flex items-center justify-between px-3 py-1">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Settings className="w-3 h-3" />
            <span className="hidden sm:inline">Formatting</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsToolbarCollapsed(!isToolbarCollapsed)}
            className="h-7 w-7 p-0 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {isToolbarCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </Button>
        </div>

        {!isToolbarCollapsed && (
          <div className="px-3 pb-2">
            <div className="flex flex-wrap items-center gap-1">
              {/* Undo/Redo */}
              <UndoTool editor={editor} isLoading={isLoading} />
              
              <Separator orientation="vertical" className="h-4 mx-1 bg-gray-300 dark:bg-gray-600" />

              {/* Font Family */}
              <FontFamilies editor={editor} isLoading={isLoading} fontFamilies={fontFamilies} />
              
              <Separator orientation="vertical" className="h-4 mx-1 bg-gray-300 dark:bg-gray-600 hidden sm:block" />

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
          <TableImageRuler editor={editor} isLoading={isLoading} />
          <ImageAlignment editor={editor} />

              {/* Desktop-only features */}
              <div className="hidden sm:flex items-center gap-1">
                <Separator orientation="vertical" className="h-4 mx-1 bg-gray-300 dark:bg-gray-600" />
                  {/* Alignment */}
            <Alignment editor={editor} isLoading={isLoading} />

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Quote & Link */}
            <QuoteTool editor={editor} isLoading={isLoading} setLink={setLink} />

            <Separator orientation="vertical" className="h-6 mx-1" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optimized Editor Content */}
      <div className="flex-1 overflow-y-auto max-w-full bg-white dark:bg-gray-900/80">
        <EditorContent 
          editor={editor} 
          className="h-full w-full [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[calc(100vh-300px)] sm:[&_.ProseMirror]:min-h-[calc(100vh-250px)]" 
        />
      </div>

      {/* Minimal Footer Status */}
      <div className="px-3 py-1 border-t border-gray-200 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">{editor.getText().length} chars</span>
          <span className="hidden sm:inline">
            {editor.getText().split(" ").filter((word) => word.length > 0).length} words
          </span>
          <span className="flex items-center gap-1">
            {isPrivate ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            <span className="hidden sm:inline">{isPrivate ? "Private" : "Shared"}</span>
          </span>
          {pinned && (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Pin className="w-3 h-3" />
            </span>
          )}
        </div>
        <div>
          {tags.length > 0 && `${tags.length} tag${tags.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onSaveDraft={handleSaveDraftAndLeave}
        onDiscardChanges={handleDiscardChanges}
        onCancel={handleCancelNavigation}
        isLoading={isLoading}
      />
    </div>
  )
}