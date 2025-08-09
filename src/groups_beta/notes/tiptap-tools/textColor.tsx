
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';


const TextColor = ({ editor, isLoading, colors }: { editor: any; isLoading: boolean; colors: string[]; }) => {
  return (
    <>
      <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                            className={`hover:bg-gray-200 relative ${
                              editor.isActive("textStyle", {
                                color: editor.getAttributes("textStyle").color,
                              })
                                ? "border-blue-500"
                                : ""
                            }`}
                            style={{
                              backgroundColor:
                                editor.getAttributes("textStyle").color ||
                                "transparent",
                            }}
                          >
                            <Palette
                              className="w-4 h-4"
                             
                            />
                            {/* Optional: Add a visual indicator (e.g., colored underline) */}
                            {editor.getAttributes("textStyle").color && (
                              <span
                                className="absolute bottom-0 left-0 w-full h-1"
                                style={{
                                  backgroundColor:
                                    editor.getAttributes("textStyle").color,
                                }}
                              />
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-60 p-3">
                          <div className="grid grid-cols-7 gap-2">
                            {colors.map((color) => (
                              <button
                                key={color}
                                className={`w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform ${
                                  editor.isActive("textStyle", { color })
                                    ? "ring-2 ring-blue-500"
                                    : ""
                                }`}
                                style={{ backgroundColor: color }}
                                onClick={() =>
                                  editor.chain().focus().setColor(color).run()
                                }
                              />
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3"
                            onClick={() => editor.chain().focus().unsetColor().run()}
                          >
                            Remove Color
                          </Button>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Text Color</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
    </>
  )
}

export default TextColor