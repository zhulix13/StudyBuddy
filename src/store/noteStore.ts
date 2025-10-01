import { create } from "zustand"
import { persist } from "zustand/middleware"
import debounce from "lodash/debounce"
import type { Note, NewNote } from "@/types/notes"

type modeType = null | "view" | "edit" | "create"

interface NoteStore {
  notes: Note[]
  selectedNote: Note | null
  editingNote: Note | null
  draftNote: Partial<NewNote> | null
  mode: modeType
  isDirty: boolean
  originalContent: { title: string; content: any; tags: string[]; is_private: boolean; pinned: boolean } | null
  setMode: (mode: modeType) => void
  setNotes: (notes: Note[]) => void
  setSelectedNote: (note: Note | null) => void
  setEditingNote: (note: Note | null) => void
  saveDraftLocally: (note: Partial<NewNote>, groupId: string) => void
  clearLocalDraft: (groupId: string) => void
  loadDraftForGroup: (groupId: string) => void
  setIsDirty: (dirty: boolean) => void
  setOriginalContent: (
    content: { title: string; content: any; tags: string[]; is_private: boolean; pinned: boolean } | null,
  ) => void
  checkIfDirty: (
    currentTitle: string,
    currentContent: any,
    currentTags: string[],
    currentIsPrivate: boolean,
    currentPinned: boolean,
  ) => void
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => {
      const debouncedSave = debounce((note: Partial<NewNote>, groupId: string) => {
        const draftKey = `note-draft-${groupId}`
        localStorage.setItem(draftKey, JSON.stringify(note))
        set({ draftNote: note })
        console.log("[v0] Draft saved to localStorage for group:", groupId, note.title)
      }, 2000) // 2 second debounce as per requirements

      return {
        notes: [],
        selectedNote: null,
        editingNote: null,
        draftNote: null,
        mode: null,
        isDirty: false,
        originalContent: null,
        setNotes: (notes) => set({ notes }),
        setSelectedNote: (note) => set({ selectedNote: note }),
        setEditingNote: (note) => set({ editingNote: note }),
        setMode: (mode) => set({ mode }),
        setIsDirty: (dirty) => set({ isDirty: dirty }),
        setOriginalContent: (content) => set({ originalContent: content }),
        saveDraftLocally: (note, groupId) => {
          debouncedSave(note, groupId)
        },
        clearLocalDraft: (groupId) => {
          const draftKey = `note-draft-${groupId}`
          localStorage.removeItem(draftKey)
          set({ draftNote: null, isDirty: false })
          console.log("[v0] Local draft cleared for group:", groupId)
        },
        loadDraftForGroup: (groupId) => {
          const draftKey = `note-draft-${groupId}`
          const savedDraft = localStorage.getItem(draftKey)
          if (savedDraft) {
            try {
              const draft = JSON.parse(savedDraft)
              set({ draftNote: draft })
              console.log("[v0] Loaded draft for group:", groupId)
            } catch (error) {
              console.error("[v0] Error parsing saved draft:", error)
              localStorage.removeItem(draftKey)
            }
          } else {
            set({ draftNote: null })
          }
        },
       checkIfDirty: (currentTitle, currentContent, currentTags, currentIsPrivate, currentPinned) => {
  const { originalContent } = get()

  if (!originalContent) {
    // If no original content, check if current content has ACTUAL content
    const hasTitle = currentTitle.trim().length > 0
    const hasContent = currentContent?.content?.some((node: any) => {
      if (node.type === 'paragraph') {
        return node.content?.some((child: any) => child.text?.trim().length > 0)
      }
      if (node.type === 'heading' || node.type === 'blockquote') {
        return node.content?.some((child: any) => child.text?.trim().length > 0)
      }
      if (node.type === 'bulletList' || node.type === 'orderedList' || node.type === 'taskList') {
        return true // Lists count as content
      }
      if (node.type === 'image' || node.type === 'table' || node.type === 'horizontalRule') {
        return true // Media/structural elements count
      }
      return false
    })
    const hasTags = currentTags.length > 0
    
    const hasActualContent = hasTitle || hasContent || hasTags
    const { isDirty: currentIsDirty } = get()
    if (currentIsDirty !== hasActualContent) {
      set({ isDirty: hasActualContent })
    }
    return
  }

  // Compare current content with original
  const titleChanged = currentTitle.trim() !== originalContent.title.trim()
  const contentChanged = JSON.stringify(currentContent) !== JSON.stringify(originalContent.content)
  const tagsChanged = JSON.stringify(currentTags.sort()) !== JSON.stringify(originalContent.tags.sort())
  const privateChanged = currentIsPrivate !== originalContent.is_private
  const pinnedChanged = currentPinned !== originalContent.pinned

  const hasChanges = titleChanged || contentChanged || tagsChanged || privateChanged || pinnedChanged
  const { isDirty: currentIsDirty } = get()
  if (currentIsDirty !== hasChanges) {
    set({ isDirty: hasChanges })
  }
},
      }
    },
    {
      name: "note-store",
      partialize: (state) => ({
        notes: state.notes,
        selectedNote: state.selectedNote,
        editingNote: state.editingNote,
        mode: state.mode,
      }),
    },
  ),
)
