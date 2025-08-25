"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pin, Lock, Unlock, Clock, User, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Note } from "@/types/notes"
import type { ViewMode } from "./ViewModeSelector"
import { Button } from "@/components/ui/button"

interface NoteCardProps {
  note: Note
  viewMode: ViewMode
  onSelect: (note: Note) => void
}

export const NoteCard = ({ note, viewMode, onSelect }: NoteCardProps) => {
  const getContentPreview = (content: any): string => {
    if (typeof content === "string") return content.slice(0, 150)
    if (content?.content) {
      const extractText = (node: any): string => {
        if (node.type === "text") return node.text || ""
        if (node.content) {
          return node.content.map(extractText).join("")
        }
        return ""
      }
      const text = content.content.map(extractText).join(" ")
      return text.slice(0, 150)
    }
    return "No content"
  }

  const formatTime = (date: string) => {
    const formatted = formatDistanceToNow(new Date(date), { addSuffix: true })
    return formatted.replace(" ago", "").replace("about ", "")
  }

  if (viewMode === "grid") {
    return (
      <Card
        className="cursor-pointer group relative overflow-hidden bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:border-blue-300 dark:hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-300 hover:-translate-y-1 min-w-0"
        onClick={() => onSelect(note)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/30 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="pb-3 relative z-10 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                {note.pinned && (
                  <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200/50 dark:border-amber-700/50 flex-shrink-0">
                    <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight line-clamp-2 min-w-0">
                  {note.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100/80 dark:bg-gray-700/60 border border-gray-200/50 dark:border-gray-600/50 flex-shrink-0">
                  {note.is_private ? (
                    <>
                      <Lock className="w-3 h-3" />
                      <span className="font-medium hidden sm:inline">Private</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span className="font-medium hidden sm:inline">Shared</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100/80 dark:bg-gray-700/60 border border-gray-200/50 dark:border-gray-600/50 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span className="font-medium truncate max-w-20 sm:max-w-none">
                    {formatTime(note.updated_at)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 w-8 h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:scale-110 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                // Handle more options
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 relative z-10 p-4 sm:p-5 sm:pt-0">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
              {getContentPreview(note.content)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 min-w-0 flex-1">
              {note.tags?.slice(0, 2).map((tag: any) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 transition-colors max-w-20 truncate"
                >
                  {tag}
                </Badge>
              ))}
              {note.tags && note.tags.length > 2 && (
                <Badge
                  variant="outline"
                  className="text-xs border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 flex-shrink-0"
                >
                  +{note.tags.length - 2}
                </Badge>
              )}
            </div>

            {note.author && (
              <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-gray-50/80 dark:bg-gray-700/40 border border-gray-200/50 dark:border-gray-600/50 flex-shrink-0">
                <img
                  src={note.author.avatar_url || "/placeholder.svg?height=20&width=20"}
                  alt={note.author.name}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0"
                />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-16 sm:max-w-20">
                  {note.author.name?.split(" ")[0] || note.author.username}
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    )
  }

  if (viewMode === "list") {
    return (
      <Card
        className="cursor-pointer group bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:border-blue-300 dark:hover:border-blue-500/60 hover:shadow-lg hover:shadow-blue-500/5 dark:hover:shadow-blue-400/10 transition-all duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-700/40 min-w-0"
        onClick={() => onSelect(note)}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                {note.pinned && (
                  <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200/50 dark:border-amber-700/50 flex-shrink-0">
                    <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 min-w-0 flex-1">
                  {note.title}
                </h3>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100/80 dark:bg-gray-700/60 text-xs flex-shrink-0">
                  {note.is_private ? (
                    <>
                      <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300 font-medium hidden sm:inline">Private</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-300 font-medium hidden sm:inline">Shared</span>
                    </>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-1 mb-2 sm:mb-3 leading-relaxed">
                {getContentPreview(note.content)}
              </p>

              <div className="flex items-center gap-3 sm:gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  <span className="truncate max-w-24 sm:max-w-none">
                    {formatTime(note.updated_at)}
                  </span>
                </div>

                {note.author && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <img
                      src={note.author.avatar_url || "/placeholder.svg?height=16&width=16"}
                      alt={note.author.name}
                      className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-600"
                    />
                    <span className="truncate max-w-20 sm:max-w-28 font-medium">
                      {note.author.name || note.author.username}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="flex flex-wrap gap-1">
                {note.tags?.slice(0, 1).map((tag: any) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50 hidden sm:inline-flex max-w-20 truncate"
                  >
                    {tag}
                  </Badge>
                ))}
                {note.tags && note.tags.length > 1 && (
                  <Badge variant="outline" className="text-xs hidden sm:inline-flex flex-shrink-0">
                    +{note.tags.length - 1}
                  </Badge>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 w-7 h-7 sm:w-8 sm:h-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:scale-110"
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle more options
                }}
              >
                <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (viewMode === "details") {
    return (
      <Card
        className="cursor-pointer group bg-white dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/80 hover:border-blue-300 dark:hover:border-blue-500/60 hover:shadow-xl hover:shadow-blue-500/10 dark:hover:shadow-blue-400/20 transition-all duration-300 min-w-0"
        onClick={() => onSelect(note)}
      >
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                {note.pinned && (
                  <div className="p-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200/50 dark:border-amber-700/50 flex-shrink-0">
                    <Pin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                )}
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-w-0">
                  {note.title}
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/80 dark:bg-gray-700/40 border border-gray-200/50 dark:border-gray-600/50">
                  {note.is_private ? (
                    <>
                      <Lock className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate">Private Note</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 truncate">Shared Note</span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/80 dark:bg-gray-700/40 border border-gray-200/50 dark:border-gray-600/50">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                    {formatTime(note.updated_at)}
                  </span>
                </div>

                {note.author && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50/80 dark:bg-gray-700/40 border border-gray-200/50 dark:border-gray-600/50 col-span-1 sm:col-span-2">
                    <User className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    <img
                      src={note.author.avatar_url || "/placeholder.svg?height=20&width=20"}
                      alt={note.author.name}
                      className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600 flex-shrink-0"
                    />
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                      {note.author.name || note.author.username}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-all duration-200 w-9 h-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:scale-110 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                // Handle more options
              }}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="p-4 rounded-lg bg-gray-50/50 dark:bg-gray-700/30 border border-gray-200/50 dark:border-gray-600/50 mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4 leading-relaxed">
              {getContentPreview(note.content)}
            </p>
          </div>

          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag: any) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-700/50 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/40 dark:hover:to-indigo-800/40 transition-colors max-w-32 truncate"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Compact view
  return (
    <div
      className="cursor-pointer group hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50/30 dark:hover:from-gray-800/50 dark:hover:to-blue-900/20 transition-all duration-200 p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 min-w-0"
      onClick={() => onSelect(note)}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 flex-shrink-0">
          {note.pinned && (
            <div className="p-1 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200/50 dark:border-amber-700/50">
              <Pin className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </div>
          )}
          <div className="p-1 rounded-full bg-gray-100/80 dark:bg-gray-700/60">
            {note.is_private ? (
              <Lock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            ) : (
              <Unlock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {note.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
            {getContentPreview(note.content)}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
          {note.tags && note.tags.length > 0 && (
            <div className="hidden sm:flex gap-1">
              {note.tags.slice(0, 2).map((tag: any) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs px-2 py-0 h-5 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 max-w-20 truncate"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {note.author && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <img
                src={note.author.avatar_url || "/placeholder.svg?height=20&width=20"}
                alt={note.author.name}
                className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-600"
              />
              <span className="font-medium truncate max-w-20 sm:max-w-28">
                {note.author.name?.split(" ")[0] || note.author.username}
              </span>
            </div>
          )}

          <span className="font-medium truncate max-w-20 sm:max-w-none">
            {formatTime(note.updated_at)}
          </span>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-all duration-200 w-7 h-7 p-0 flex-shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700/60 hover:scale-110"
          onClick={(e) => {
            e.stopPropagation()
            // Handle more options
          }}
        >
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>
    </div>
  )
}