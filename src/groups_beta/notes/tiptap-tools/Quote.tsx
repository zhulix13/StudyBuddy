
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { LinkIcon, Quote } from 'lucide-react';

const QuoteTool = ({ editor, isLoading, setLink }: { editor: any; isLoading: boolean; setLink: () => void; }) => {
  return (
    <>
      <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={editor.isActive("blockquote")}
                          onPressedChange={() =>
                            editor.chain().focus().toggleBlockquote().run()
                          }
                          size="sm"
                          disabled={isLoading}
                          className={`${
                            editor.isActive("blockquote")
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "hover:bg-gray-200 dark:text-gray-400"
                          }`}
                        >
                          <Quote className="w-4 h-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Quote</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
      
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isLoading}
                          onClick={setLink}
                          className={`${
                            editor.isActive("link")
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "hover:bg-gray-200 dark:text-gray-400"
                          }`}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Add Link</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
    </>
  )
}

export default QuoteTool
