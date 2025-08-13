import React from "react"
import { Button } from "@/components/ui/button"
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react"

interface ImageAlignmentProps {
  editor: any
}

export function ImageAlignment({ editor }: ImageAlignmentProps) {
  if (!editor) return null

  // Check if image is selected
  const isImageSelected = React.useMemo(() => {
    const { selection } = editor.state
    
    // Check for node selection
    if (selection.node && selection.node.type.name === "image") {
      return true
    }
    
    // Check for images in text selection
    const { from, to } = selection
    let hasImage = false
    editor.state.doc.nodesBetween(from, to, (node: any) => {
      if (node.type.name === "image") {
        hasImage = true
        return false
      }
    })
    return hasImage
  }, [editor.state.selection])

  // Get current alignment
  const currentAlignment = React.useMemo(() => {
    const { selection } = editor.state
    
    if (selection.node && selection.node.type.name === "image") {
      return selection.node.attrs.align || "left"
    }
    
    const { from, to } = selection
    let alignment = "left"
    editor.state.doc.nodesBetween(from, to, (node: any) => {
      if (node.type.name === "image") {
        alignment = node.attrs.align || "left"
        return false
      }
    })
    return alignment
  }, [editor.state.selection])

  const setAlignment = (align: "left" | "center" | "right") => {
    const { selection } = editor.state

    if (selection.node && selection.node.type.name === "image") {
      editor.chain().focus().updateAttributes("image", { align }).run()
      return
    }

    const { from, to } = selection
    editor.state.doc.nodesBetween(from, to, (node: any, pos: number) => {
      if (node.type.name === "image") {
        editor
          .chain()
          .focus()
          .setNodeSelection(pos)
          .updateAttributes("image", { align })
          .run()
        return false
      }
    })
  }

  if (!isImageSelected) return null

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded">
      <span className="text-xs text-blue-600 mr-2">Image Position:</span>
      
      <Button
        variant={currentAlignment === "left" ? "default" : "outline"}
        size="sm"
        onClick={() => setAlignment("left")}
        className="h-8 w-8 p-0"
      >
        <AlignLeft className="w-4 h-4" />
      </Button>
      
      <Button
        variant={currentAlignment === "center" ? "default" : "outline"}
        size="sm"
        onClick={() => setAlignment("center")}
        className="h-8 w-8 p-0"
      >
        <AlignCenter className="w-4 h-4" />
      </Button>
      
      <Button
        variant={currentAlignment === "right" ? "default" : "outline"}
        size="sm"
        onClick={() => setAlignment("right")}
        className="h-8 w-8 p-0"
      >
        <AlignRight className="w-4 h-4" />
      </Button>
    </div>
  )
}