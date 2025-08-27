
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Highlighter } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
const HighlightTool = ({ editor, isLoading }: { editor: any; isLoading: boolean; }) => {
  return (
    <>
      <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("highlight")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleHighlight().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("highlight")
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <Highlighter className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Highlight</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
    </>
  )
}

export default HighlightTool