"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { NodeViewWrapper } from "@tiptap/react"

interface ResizableImageViewProps {
  node: any
  updateAttributes: (attrs: any) => void
  selected: boolean
  editor: any
}

export default function ResizableImageView({ node, updateAttributes, selected, editor }: ResizableImageViewProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const startPos = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const { src, alt, title, width, height, align = "left" } = node.attrs

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.preventDefault()
    e.stopPropagation()

    setIsResizing(true)
    setResizeHandle(handle)

    const rect = imageRef.current?.getBoundingClientRect()
    if (rect) {
      startPos.current = {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      }
    }
  }

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current || !resizeHandle) return

      const deltaX = e.clientX - startPos.current.x
      const deltaY = e.clientY - startPos.current.y

      let newWidth = startPos.current.width
      let newHeight = startPos.current.height

      // Calculate new dimensions based on resize handle
      switch (resizeHandle) {
        case "se": // bottom-right
          newWidth = Math.max(50, startPos.current.width + deltaX)
          newHeight = Math.max(50, startPos.current.height + deltaY)
          break
        case "sw": // bottom-left
          newWidth = Math.max(50, startPos.current.width - deltaX)
          newHeight = Math.max(50, startPos.current.height + deltaY)
          break
        case "ne": // top-right
          newWidth = Math.max(50, startPos.current.width + deltaX)
          newHeight = Math.max(50, startPos.current.height - deltaY)
          break
        case "nw": // top-left
          newWidth = Math.max(50, startPos.current.width - deltaX)
          newHeight = Math.max(50, startPos.current.height - deltaY)
          break
        case "e": // right
          newWidth = Math.max(50, startPos.current.width + deltaX)
          break
        case "w": // left
          newWidth = Math.max(50, startPos.current.width - deltaX)
          break
        case "s": // bottom
          newHeight = Math.max(50, startPos.current.height + deltaY)
          break
        case "n": // top
          newHeight = Math.max(50, startPos.current.height - deltaY)
          break
      }

      // Maintain aspect ratio for corner handles
      if (["se", "sw", "ne", "nw"].includes(resizeHandle)) {
        const aspectRatio = startPos.current.width / startPos.current.height
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          newHeight = newWidth / aspectRatio
        } else {
          newWidth = newHeight * aspectRatio
        }
      }

      imageRef.current.style.width = `${newWidth}px`
      imageRef.current.style.height = `${newHeight}px`
    }

    const handleMouseUp = () => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect()
        updateAttributes({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        })
      }

      setIsResizing(false)
      setResizeHandle(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, resizeHandle, updateAttributes])

  const getWrapperClasses = () => {
    const baseClasses = "image-wrapper"
    
    switch (align) {
      case "center":
        return `${baseClasses} block w-full text-center my-4`
      case "right":
        return `${baseClasses} float-right clear-right ml-4 mb-4`
      case "left":
      default:
        return `${baseClasses} float-left clear-left mr-4 mb-4`
    }
  }

  const getContainerStyle = () => {
    const baseStyle: React.CSSProperties = {
      position: "relative",
      display: "inline-block",
      maxWidth: "100%",
    }

    switch (align) {
      case "center":
        return {
          ...baseStyle,
          display: "block",
          margin: "1rem auto",
        }
      case "right":
        return {
          ...baseStyle,
          margin: "0 0 1rem 1rem",
        }
      case "left":
      default:
        return {
          ...baseStyle,
          margin: "0 1rem 1rem 0",
        }
    }
  }

  const resizeHandles = [
    { position: "nw", cursor: "nw-resize", style: { top: -4, left: -4 } },
    { position: "n", cursor: "n-resize", style: { top: -4, left: "50%", transform: "translateX(-50%)" } },
    { position: "ne", cursor: "ne-resize", style: { top: -4, right: -4 } },
    { position: "e", cursor: "e-resize", style: { top: "50%", right: -4, transform: "translateY(-50%)" } },
    { position: "se", cursor: "se-resize", style: { bottom: -4, right: -4 } },
    { position: "s", cursor: "s-resize", style: { bottom: -4, left: "50%", transform: "translateX(-50%)" } },
    { position: "sw", cursor: "sw-resize", style: { bottom: -4, left: -4 } },
    { position: "w", cursor: "w-resize", style: { top: "50%", left: -4, transform: "translateY(-50%)" } },
  ]

  return (
    <NodeViewWrapper className={getWrapperClasses()} ref={containerRef} data-align={align}>
      <div className="relative inline-block" style={getContainerStyle()}>
        <img
          ref={imageRef}
          src={src || "/placeholder.svg"}
          alt={alt}
          title={title}
          width={width}
          height={height}
          className={`max-w-full h-auto ${selected ? "ring-2 ring-blue-500" : ""}`}
          style={{
            width: width ? `${width}px` : "auto",
            height: height ? `${height}px` : "auto",
          }}
          draggable={false}
        />

        {/* Resize handles - only show when selected */}
        {selected && !isResizing && (
          <>
            {resizeHandles.map(({ position, cursor, style }) => (
              <div
                key={position}
                className="absolute w-2 h-2 bg-blue-500 border border-white rounded-sm hover:bg-blue-600 cursor-pointer z-10"
                style={{
                  ...style,
                  cursor,
                }}
                onMouseDown={(e) => handleMouseDown(e, position)}
              />
            ))}
          </>
        )}
      </div>
    </NodeViewWrapper>
  )
}