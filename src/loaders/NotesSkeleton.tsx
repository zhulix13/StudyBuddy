import { Skeleton } from "@/components/ui/skeleton"

const NotesSkeleton = ({ count = 6 }) => {
  return (
    <div className="space-y-7 my-5 max-w-[95%] mx-auto">
      {/* Header skeleton section */}
      <div className="flex items-center justify-between p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Skeleton className="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-800" />
          <div className="space-y-2">
            {/* Group name */}
            <Skeleton className="h-5 w-32 bg-gray-200 dark:bg-gray-700" />
            {/* Description */}
            <Skeleton className="h-3 w-64 bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
        {/* Menu dots */}
        <Skeleton className="h-6 w-6 bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(count)
          .fill(0)
          .map((_, idx) => (
            <div
              key={idx}
              className="rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 p-4 shadow-sm backdrop-blur-sm flex flex-col gap-3 min-h-[200px]"
            >
              {/* Title */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-24 bg-gray-200 dark:bg-gray-700" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <Skeleton className="h-4 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>

              {/* Meta info (Shared + time) */}
              <div className="flex gap-2 items-center">
                <Skeleton className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-3 w-12 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Content body */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-4/5 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-3/5 bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Footer with tags and user */}
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-12 rounded-full bg-blue-200 dark:bg-blue-800" />
                  <Skeleton className="h-5 w-8 rounded-full bg-purple-200 dark:bg-purple-800" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <Skeleton className="h-3 w-16 bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export default NotesSkeleton
