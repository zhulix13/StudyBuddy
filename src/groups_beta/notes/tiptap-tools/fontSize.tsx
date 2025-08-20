"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

const PRESET_SIZES = [
  { label: "8", value: "8px" },
  { label: "9", value: "9px" },
  { label: "10", value: "10px" },
  { label: "11", value: "11px" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "20", value: "20px" },
  { label: "24", value: "24px" },
  { label: "28", value: "28px" },
  { label: "32", value: "32px" },
  { label: "36", value: "36px" },
  { label: "48", value: "48px" },
  { label: "72", value: "72px" },
]

export default function FontSizeTool({ editor, isLoading }: { editor: any; isLoading: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  const currentSize = useMemo(() => {
    if (!editor) return ""
    const size = editor.getAttributes("textStyle")?.fontSize
    if (!size) return ""
    // Extract just the number from "16px" format
    return size.replace("px", "")
  }, [editor])

  const displayValue = currentSize || ""

  useEffect(() => {
    setInputValue(displayValue)
  }, [displayValue])

  const handleInputChange = (value: string) => {
    setInputValue(value)
  }

  const applyFontSize = (size: string) => {
    if (!editor) return
    
    const numericSize = parseFloat(size)
    if (isNaN(numericSize) || numericSize <= 0) {
      // Invalid input, reset to current value
      setInputValue(displayValue)
      return
    }

    const sizeValue = `${numericSize}px`
    editor.chain().focus().setFontSize(sizeValue).run()
    setIsOpen(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      applyFontSize(inputValue)
    } else if (e.key === "Escape") {
      setInputValue(displayValue)
      setIsOpen(false)
    }
  }

  const handleInputBlur = () => {
    applyFontSize(inputValue)
  }

  const handlePresetSelect = (value: string) => {
    const numericValue = value.replace("px", "")
    setInputValue(numericValue)
    applyFontSize(numericValue)
    setIsOpen(false)
  }

  const clearFontSize = () => {
    editor?.chain().focus().unsetFontSize().run()
    setIsOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground hidden sm:inline">Size</Label>
      <div className="relative">
        <div className="flex">
          <Input
            ref={inputRef}
            className="h-8 w-[60px] rounded-r-none border-r-0 text-center"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onBlur={handleInputBlur}
            placeholder="16"
            disabled={!editor || isLoading}
          />
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 rounded-l-none border-l-0 px-1"
            onClick={() => setIsOpen(!isOpen)}
            disabled={!editor || isLoading}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        
        {isOpen && (
          <div className="absolute top-9 left-0 z-50 w-[120px] rounded-md border bg-popover p-1 shadow-md">
            <div className="max-h-[200px] overflow-y-auto">
              {currentSize && (
                <button
                  className="w-full px-2 py-1 text-left text-xs hover:bg-accent rounded-sm text-muted-foreground"
                  onClick={clearFontSize}
                >
                  Default
                </button>
              )}
              {PRESET_SIZES.map((size) => (
                <button
                  key={size.value}
                  className="w-full px-2 py-1 text-left text-sm hover:bg-accent rounded-sm"
                  onClick={() => handlePresetSelect(size.value)}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}