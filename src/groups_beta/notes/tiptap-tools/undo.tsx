

   import { TooltipProvider, TooltipContent, TooltipTrigger, Tooltip } from '@/components/ui/tooltip'
   import { Redo, Undo } from 'lucide-react'
   import { Button } from '@/components/ui/button'

const UndoTool = ({ editor, isLoading }: { editor: any; isLoading: boolean; }) => {
  return (
    <>
       {/* Undo/Redo */}
       <TooltipProvider>
         <Tooltip>
           <TooltipTrigger asChild>
             <Button
               variant="ghost"
               size="sm"
               onClick={() => editor.chain().focus().undo().run()}
               disabled={!editor.can().undo() || isLoading}
               className="hover:bg-gray-200"
             >
               <Undo className="w-4 h-4 dark:text-gray-400" />
             </Button>
           </TooltipTrigger>
           <TooltipContent>
             <p>Undo</p>
           </TooltipContent>
         </Tooltip>
       </TooltipProvider>

       <TooltipProvider>
         <Tooltip>
           <TooltipTrigger asChild>
             <Button
               variant="ghost"
               size="sm"
               onClick={() => editor.chain().focus().redo().run()}
               disabled={!editor.can().redo() || isLoading}
               className="hover:bg-gray-200"
             >
               <Redo className="w-4 h-4 dark:text-gray-400" />
             </Button>
           </TooltipTrigger>
           <TooltipContent>
             <p>Redo</p>
           </TooltipContent>
         </Tooltip>
       </TooltipProvider>
    </>
  )
}

export default UndoTool

