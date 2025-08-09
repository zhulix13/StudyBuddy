"use client"

import { useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

const SIZES = [
  { label: "Default", value: "default" },
  { label: "12", value: "12px" },
  { label: "14", value: "14px" },
  { label: "16", value: "16px" },
  { label: "18", value: "18px" },
  { label: "24", value: "24px" },
  { label: "32", value: "32px" },
]

export default function FontSizeTool({ editor, isLoading }: { editor: any; isLoading: boolean }) {
  const value = useMemo(() => {
    if (!editor) return ""
    const size = editor.getAttributes("textStyle")?.fontSize
    return size || ""
  }, [editor])

  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs text-muted-foreground hidden sm:inline">Size</Label>
      <Select
        disabled={!editor || isLoading}
        value={value}
        onValueChange={(v) => {
          if (!v) editor?.chain().focus().unsetFontSize().run()
          else editor?.chain().focus().setFontSize(v).run()
        }}
      >
        <SelectTrigger className="h-8 w-[90px]">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent>
          {SIZES.map((s) => (
            <SelectItem key={s.value || "default"} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
