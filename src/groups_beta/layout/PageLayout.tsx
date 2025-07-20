import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, MessageCircle } from "lucide-react";
import { ChatView } from "../chat/ChatView";
import { NotesView } from "../notes/NotesViews";

// Assuming Group type is defined somewhere
import type { StudyGroup } from "@/types/groups";

const GroupHeader = ({ group }: { group: StudyGroup }) => (
   <div className="hidden md:block p-6 border-b">
      <div className="flex items-center gap-3">
         <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
               {group.name.charAt(0)}
            </AvatarFallback>
         </Avatar>
         <div>
            <h1 className="text-xl font-bold">{group.name}</h1>
            <p className="text-sm text-gray-500">{group.description}</p>
         </div>
      </div>
   </div>
);

const GroupContent = ({ group }: { group: StudyGroup }) => {
   const [activeTab, setActiveTab] = useState("notes");

   return (
      <div className="flex-1 flex flex-col">
         <GroupHeader group={group} />

         <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="flex-1 flex flex-col"
         >
            <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
               <TabsTrigger value="notes" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Notes
               </TabsTrigger>
               <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Chat
               </TabsTrigger>
            </TabsList>

            <TabsContent value="notes" className="flex-1 mt-4">
               <NotesView groupId={group.id} />
            </TabsContent>

            <TabsContent value="chat" className="flex-1 mt-4">
               <ChatView groupId={group.id} />
            </TabsContent>
         </Tabs>
      </div>
   );
};

export default GroupContent;