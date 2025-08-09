"use client"

import type React from "react"

import Image from "@tiptap/extension-image"
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type ResizableImageViewProps = {
  node: any
  updateAttributes: (attrs: Record<string, any>) => void
  selected: boolean
  editor: any
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function ResizableImageView({ node, updateAttributes, selected, editor }: ResizableImageViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState<number | null>(null)
  const [naturalRatio, setNaturalRatio] = useState<number | null>(null)

  const attrs = node?.attrs || {}
  const width = attrs.width as number | undefined
  const height = attrs.height as number | undefined
  const alt = attrs.alt as string | undefined
  const src = attrs.src as string

  useEffect(() => {
    if (!imgRef.current) return
    const img = imgRef.current
    const handleLoad = () => {
      if (!naturalRatio) {
        const ratio = img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1
        setNaturalRatio(ratio || 1)
        // If no width set yet, initialize to min(container width, image natural width, 100%)
        if (containerRef.current && !width) {
          const containerWidth = containerRef.current.clientWidth
          const initial = Math.min(containerWidth, img.naturalWidth || containerWidth)
          updateAttributes({ width: Math.max(120, Math.floor(initial)) })
        }
      }
    }
    if (img.complete) handleLoad()
    else img.addEventListener("load", handleLoad)
    return () => img.removeEventListener("load", handleLoad)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgRef.current, src])

  const onPointerDown = (e: React.PointerEvent, corner: "e" | "w") => {
    e.preventDefault()
    e.stopPropagation()
    if (!containerRef.current) return
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(width || containerRef.current.clientWidth)
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isResizing || !containerRef.current || startWidth == null) return
    const containerWidth = containerRef.current.clientWidth
    const deltaX = e.clientX - startX
    // Only resize horizontally (east handle). West could be added similarly.
    const nextWidth = clamp(startWidth + deltaX, 120, containerWidth)
    const nextHeight = naturalRatio ? Math.floor(nextWidth / naturalRatio) : undefined
    updateAttributes({ width: Math.floor(nextWidth), height: nextHeight })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isResizing) return
    e.preventDefault()
    setIsResizing(false)
  }

  const style = useMemo(() => {
    const base: React.CSSProperties = { maxWidth: "100%", height: "auto", display: "block" }
    if (width) base.width = width
    if (height) base.height = height
    return base
  }, [width, height])

  return (
    <NodeViewWrapper
      as="figure"
      className={cn("relative my-2 flex flex-col items-center", selected && "ring-2 ring-foreground/30")}
      data-drag-handle
      ref={containerRef}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <img
        ref={imgRef}
        src={src || "/placeholder.svg"}
        alt={alt || ""}
        style={style}
        className="rounded-md shadow-sm max-w-full h-auto"
        crossOrigin="anonymous"
      />
      {/* east handle */}
      <div
        role="slider"
        aria-label="Resize image"
        aria-valuemin={120}
        aria-valuemax={containerRef.current?.clientWidth || undefined}
        aria-valuenow={width}
        className={cn(
          "absolute right-[-8px] top-1/2 -translate-y-1/2 h-6 w-6 rounded-full",
          "bg-background/80 backdrop-blur border border-border shadow-sm",
          "flex items-center justify-center cursor-ew-resize select-none",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "resizer-handle",
        )}
        onPointerDown={(e) => onPointerDown(e, "e")}
        onDoubleClick={() => {
          // Reset to contain width
          if (!containerRef.current || !imgRef.current) return
          const containerWidth = containerRef.current.clientWidth
          const imgNatural = imgRef.current.naturalWidth || containerWidth
          const next = Math.min(containerWidth, imgNatural)
          updateAttributes({ width: Math.floor(next), height: undefined })
        }}
      >
        <div className="h-3 w-1 rounded bg-foreground/60" />
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const w = element.getAttribute("width") || element.style.width
          if (!w) return null
          const n = Number.parseInt(String(w).replace("px", ""), 10)
          return isNaN(n) ? null : n
        },
        renderHTML: (attrs) => {
          return attrs.width ? { width: attrs.width } : {}
        },
      },
      height: {
        default: null,
        parseHTML: (element) => {
          const h = element.getAttribute("height") || element.style.height
          if (!h) return null
          const n = Number.parseInt(String(h).replace("px", ""), 10)
          return isNaN(n) ? null : n
        },
        renderHTML: (attrs) => {
          return attrs.height ? { height: attrs.height } : {}
        },
      },
      alt: {
        default: null,
      },
    }
  },
  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView)
  },
})
