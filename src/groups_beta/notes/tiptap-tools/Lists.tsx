
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toggle } from '@/components/ui/toggle';
import { List, ListOrdered, CheckSquare } from 'lucide-react';

const Lists = ({ editor, isLoading }: { editor: any; isLoading: boolean; }) => {
  return (
    <>
       <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("bulletList")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleBulletList().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("bulletList")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bullet List</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
      
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("orderedList")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleOrderedList().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("orderedList")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <ListOrdered className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Numbered List</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
      
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("taskList")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleTaskList().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("taskList")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <CheckSquare className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Task List</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
    </>
  )
}

export default Lists