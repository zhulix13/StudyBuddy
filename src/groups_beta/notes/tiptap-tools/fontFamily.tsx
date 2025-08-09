
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from '@/components/ui/select';

const FontFamilies = ({ editor, isLoading, fontFamilies }: { editor: any; isLoading: boolean; fontFamilies: any[]; }) => {
  return (
    <>
      <div className="hidden sm:block">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Select
                    value={
                      editor.getAttributes("textStyle")?.fontFamily || "Inter"
                    }
                    onValueChange={(value: any) => {
                      if (value === "Inter") {
                        editor.chain().focus().unsetFontFamily().run();
                      } else {
                        editor.chain().focus().setFontFamily(value).run();
                      }
                    }}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map((font: any) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Font Family</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
    </>
  )
}

export default FontFamilies