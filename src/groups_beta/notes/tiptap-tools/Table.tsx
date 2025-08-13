"use client"

import type React from "react"
import { useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TableIcon, ImageIcon, Minus, Upload, LinkIcon, Trash2, AlignLeft, AlignCenter, AlignRight } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function TableImageRuler({
  editor,
  isLoading,
}: {
  editor: any
  isLoading: boolean
}) {
  const [openTable, setOpenTable] = useState(false)
  const [rows, setRows] = useState(3)
  const [cols, setCols] = useState(3)
  const [withHeaderRow, setWithHeaderRow] = useState(true)

  const fileRef = useRef<HTMLInputElement | null>(null)

  const isInTable = editor?.isActive?.("table")
  const isOnImage = useIsImageSelected(editor)
  const selectedImageAlignment = getSelectedImageAlignment(editor)

  const insertTable = () => {
    if (!editor) return
    editor
      .chain()
      .focus()
      .insertTable({ rows: Math.max(1, rows), cols: Math.max(1, cols), withHeaderRow })
      .run()
    setOpenTable(false)
  }

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run()
  }

  const pickDevice = () => fileRef.current?.click()

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await toDataURL(file)
    editor
      ?.chain()
      .focus()
      .setImage({
        src: dataUrl,
        alt: file.name,
        title: file.name,
        align: "left",
        width: 300,
      })
      .run()
    e.target.value = ""
  }

  const insertUrl = async () => {
    const url = window.prompt("Enter image URL")
    if (!url) return
    editor
      ?.chain()
      .focus()
      .setImage({
        src: url,
        alt: "Image",
        align: "left",
        width: 300,
      })
      .run()
  }

  const deleteSelectedImage = () => {
    if (!editor) return

    const { state } = editor
    const { selection } = state

    // Check if we have a node selection with an image
    if (selection.node && selection.node.type.name === "image") {
      editor.chain().focus().deleteSelection().run()
      return
    }

    // For text selection, find image nodes and delete them
    const { from, to } = selection
    let imagePos = null
    
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === "image") {
        imagePos = pos
        return false // Stop iteration
      }
    })

    if (imagePos !== null) {
      editor
        .chain()
        .focus()
        .deleteRange({ from: imagePos, to: imagePos + 1 })
        .run()
    }
  }

  const setImageAlignment = (align: "left" | "center" | "right") => {
    if (!editor || !isOnImage) return
    
    const { state } = editor
    const { selection } = state

    // Handle node selection
    if (selection.node && selection.node.type.name === "image") {
      editor.chain().focus().updateAttributes("image", { align }).run()
      return
    }

    // Handle text selection - find image nodes and update them
    const { from, to } = selection
    state.doc.nodesBetween(from, to, (node, pos) => {
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

    // DEBUG: Add these console logs temporarily
  console.log("🖼️ Image selected:", isOnImage)
  console.log("📍 Image alignment:", selectedImageAlignment)
  console.log("📊 Editor state:", editor?.state?.selection)

  return (
    <>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {/* Table insert */}
      <TooltipProvider>
        <Tooltip>
          <Popover open={openTable} onOpenChange={setOpenTable}>
            <TooltipTrigger asChild>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading} className="hover:bg-gray-200 bg-transparent">
                  <TableIcon className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Insert Table</p>
            </TooltipContent>
            <PopoverContent className="w-64" align="start">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="rows">Rows</Label>
                  <Input
                    id="rows"
                    type="number"
                    min={1}
                    max={50}
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="h-8 w-20"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Label htmlFor="cols">Columns</Label>
                  <Input
                    id="cols"
                    type="number"
                    min={1}
                    max={20}
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                    className="h-8 w-20"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="hdr">Header row</Label>
                  <Switch id="hdr" checked={withHeaderRow} onCheckedChange={setWithHeaderRow} />
                </div>
                <Button onClick={insertTable} className="w-full">
                  Insert table
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </Tooltip>
      </TooltipProvider>

      {/* Image insert */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading} className="hover:bg-gray-200 bg-transparent">
                  <ImageIcon className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={pickDevice}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload from device
                </DropdownMenuItem>
                <DropdownMenuItem onClick={insertUrl}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Insert from URL
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>Insert Image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Image alignment controls - only show when image is selected */}
      {isOnImage && (
        <>
          <Separator orientation="vertical" className="h-6 mx-1" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedImageAlignment === "left" ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                  onClick={() => setImageAlignment("left")}
                  className="hover:bg-gray-200"
                >
                  <AlignLeft className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Align Left</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedImageAlignment === "center" ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                  onClick={() => setImageAlignment("center")}
                  className="hover:bg-gray-200"
                >
                  <AlignCenter className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Align Center</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={selectedImageAlignment === "right" ? "default" : "outline"}
                  size="sm"
                  disabled={isLoading}
                  onClick={() => setImageAlignment("right")}
                  className="hover:bg-gray-200"
                >
                  <AlignRight className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Align Right</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </>
      )}

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Delete context buttons */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-red-50 text-red-600 bg-transparent"
                disabled={!isInTable || isLoading}
                onClick={deleteTable}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete Table</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Button
                variant="outline"
                size="sm"
                className="hover:bg-red-50 text-red-600 bg-transparent"
                disabled={!isOnImage || isLoading}
                onClick={deleteSelectedImage}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete Image</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Separator orientation="vertical" className="h-6 mx-1" />

      {/* Horizontal Rule */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="hover:bg-gray-200 bg-transparent"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Horizontal Rule</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  )
}

function toDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function useIsImageSelected(editor: any) {
  return useMemo(() => {
    if (!editor) return false
    const { selection } = editor.state

    // Check for node selection with image
    if (selection.node && selection.node.type.name === "image") {
      return true
    }

    // Check if there are any image nodes in the current selection range
    const { from, to } = selection
    let hasImage = false
    
    editor.state.doc.nodesBetween(from, to, (node: any) => {
      if (node.type.name === "image") {
        hasImage = true
        return false // Stop iteration
      }
    })

    return hasImage
  }, [editor])
}

function getSelectedImageAlignment(editor: any) {
  if (!editor) return null
  const { selection } = editor.state

  // Check for node selection
  if (selection.node && selection.node.type.name === "image") {
    return selection.node.attrs.align || "left"
  }

  // Check selection range for image nodes
  const { from, to } = selection
  let alignment = null
  
  editor.state.doc.nodesBetween(from, to, (node: any) => {
    if (node.type.name === "image") {
      alignment = node.attrs.align || "left"
      return false // Stop iteration
    }
  })

  return alignment
}