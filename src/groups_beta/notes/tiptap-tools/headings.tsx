
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from "@/components/ui/button";
import { Type } from 'lucide-react';


const Headings = ({ isLoading , editor}: { isLoading: boolean; editor: any; }) => {
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
                      className="hover:bg-gray-200"
                    >
                      <Type className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1">
                    {[1, 2, 3, 4, 5, 6].map((level) => (
                      <Button
                        key={level}
                        variant="ghost"
                        size="sm"
                        className={`w-full justify-start ${
                          editor.isActive("heading", { level })
                            ? "bg-blue-100 text-blue-700"
                            : ""
                        }`}
                        onClick={() =>
                          editor.chain().focus().toggleHeading({ level }).run()
                        }
                      >
                        Heading {level}
                      </Button>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`w-full justify-start ${
                        editor.isActive("paragraph")
                          ? "bg-blue-100 text-blue-700"
                          : ""
                      }`}
                      onClick={() =>
                        editor.chain().focus().setParagraph().run()
                      }
                    >
                      Paragraph
                    </Button>
                  </PopoverContent>
                </Popover>
              </TooltipTrigger>
              <TooltipContent>
                <p>Text Style</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
    </>
  )
}

export default Headings