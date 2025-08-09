
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Toggle } from '@/components/ui/toggle';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

const Alignment = ({ editor, isLoading }: { editor: any; isLoading: boolean; }) => {
  return (
    <>
           {/* Left Alignment */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={editor.isActive({ textAlign: "left" })}
                          onPressedChange={() =>
                            editor.chain().focus().setTextAlign("left").run()
                          }
                          size="sm"
                          disabled={isLoading}
                          className={`${
                            editor.isActive({ textAlign: "left" })
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "hover:bg-gray-200"
                          }`}
                        >
                          <AlignLeft className="w-4 h-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Align Left</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
      
                  {/* Center Alignment */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={editor.isActive({ textAlign: "center" })}
                          onPressedChange={() =>
                            editor.chain().focus().setTextAlign("center").run()
                          }
                          size="sm"
                          disabled={isLoading}
                          className={`${
                            editor.isActive({ textAlign: "center" })
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "hover:bg-gray-200"
                          }`}
                        >
                          <AlignCenter className="w-4 h-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Align Center</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
      
                  {/* Right Alignment */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={editor.isActive({ textAlign: "right" })}
                          onPressedChange={() =>
                            editor.chain().focus().setTextAlign("right").run()
                          }
                          size="sm"
                          disabled={isLoading}
                          className={`${
                            editor.isActive({ textAlign: "right" })
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "hover:bg-gray-200"
                          }`}
                        >
                          <AlignRight className="w-4 h-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Align Right</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
      
      
                          {/* Justify Alignment */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Toggle
                          pressed={editor.isActive({ textAlign: "justify" })}
                          onPressedChange={() =>
                            editor.chain().focus().setTextAlign("justify").run()
                          }
                          size="sm"
                          disabled={isLoading}
                          className={`${
                            editor.isActive({ textAlign: "justify" })
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "hover:bg-gray-200"
                          }`}
                        >
                          <AlignJustify className="w-4 h-4" />
                        </Toggle>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Justify</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
      
    </>
  )
}

export default Alignment