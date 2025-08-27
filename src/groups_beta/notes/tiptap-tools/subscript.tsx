
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toggle } from '@/components/ui/toggle';
import { SubscriptIcon, SuperscriptIcon } from 'lucide-react';

const SubscriptTool = ({ editor, isLoading }: { editor: any; isLoading: boolean; }) => {
  return (
      <div className="hidden sm:flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("subscript")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleSubscript().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("subscript")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <SubscriptIcon className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Subscript</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
    
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("superscript")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleSuperscript().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("superscript")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <SuperscriptIcon className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Superscript</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
  )
}

export default SubscriptTool;