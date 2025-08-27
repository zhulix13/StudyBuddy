
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toggle } from '@/components/ui/toggle';
import { Bold, UnderlineIcon, Code, Italic, Strikethrough } from 'lucide-react';


const TextFormat = ({ editor, isLoading }: { editor: any; isLoading: boolean; }) => {
  return (
    <>
        <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("bold")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleBold().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("bold")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        } cursor-pointer`}
                      >
                        <Bold className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Bold</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
      
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("italic")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleItalic().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("italic")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <Italic className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Italic</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
      
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("underline")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleUnderline().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("underline")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <UnderlineIcon className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Underline</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
      
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("strike")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleStrike().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("strike")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <Strikethrough className="w-4 h-4" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Strikethrough</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
      
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={editor.isActive("code")}
                        onPressedChange={() =>
                          editor.chain().focus().toggleCode().run()
                        }
                        size="sm"
                        disabled={isLoading}
                        className={`${
                          editor.isActive("code")
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "hover:bg-gray-200 dark:text-gray-400"
                        }`}
                      >
                        <Code className="w-4 h-4 dark:text-gray-400" />
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Code</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
    </>
  )
}

export default TextFormat