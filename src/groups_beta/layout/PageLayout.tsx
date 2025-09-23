"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, MessageCircle, MoreVertical } from "lucide-react";
import { ChatView } from "../chat/ChatView";
import { NotesView } from "../notes/NotesViews";
import { useGroupStore } from "@/store/groupStore";
import GroupDetailsDesktop from "./GroupDetailsDesktop";
import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { StudyGroup } from "@/types/groups";
import { motion, AnimatePresence } from "framer-motion";
import { useNoteStore } from "@/store/noteStore";
import { useAutoMarkSeen } from "@/hooks/useAutoMarkSeen";
import useUiStore from "@/store/uiStore";

// Main Group Header Component
const GroupHeader = ({ group }: { group: StudyGroup }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef(null);

  const handleLeaveGroup = () => {
    console.log("Leave group clicked");
    setIsModalOpen(false);
  };

  const handleSaveEdit = (formData: FormData) => {
    console.log("Save edit:", formData);
  };

  const handleDeleteGroup = () => {
    console.log("Delete group clicked");
    setIsModalOpen(false);
  };

  return (
    <div className="border-b border-slate-200/80 dark:border-slate-700/60 hidden md:block bg-gradient-to-r from-white via-slate-50/30 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 sticky top-0 backdrop-blur-md shadow-sm dark:shadow-black/10">
      <div className="p-6 w-full">
        <div className="flex items-center justify-between">
          {/* Left side - Group info */}
          <div className="flex items-center gap-4 flex-1">
            <Avatar className="w-12 h-12 ring-2 ring-blue-200/80 dark:ring-blue-600/40 shadow-lg">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 dark:from-blue-600 dark:via-blue-700 dark:to-indigo-700 text-white font-semibold shadow-inner">
                {group.avatar_url ? (
                  <img
                    src={group.avatar_url || "/placeholder.svg"}
                    alt={group.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  group.name.charAt(0).toUpperCase()
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 truncate tracking-tight">
                {group.name}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {group.description}
              </p>
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <button
              ref={triggerRef}
              onClick={() => setIsModalOpen(true)}
              className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-300 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:scale-105 hover:shadow-sm"
              title="Group Details"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Group Details Modal */}
      <GroupDetailsDesktop
        group={group}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLeaveGroup={handleLeaveGroup}
        
       
        triggerRef={triggerRef}
      />
    </div>
  );
};

const GroupContent = ({ group }: { group: StudyGroup }) => {
  const activeTab = useGroupStore((s) => s.activeTab);
  const setActiveTab = useGroupStore((s) => s.setActiveTab);
  const mode = useNoteStore((s) => s.mode);
  const setMode = useNoteStore((s) => s.setMode);
  const [searchParams, setSearchParams] = useSearchParams();
  useAutoMarkSeen(group.id, activeTab);
  
  const hideUI = useUiStore((s) => s.hideUI);

  // Handle note click from chat - switches to notes tab and navigates to note
  const handleNoteClick = (noteId: string) => {
    // Switch to notes tab
    setActiveTab("notes");
    
    // Set note viewing mode
    setMode("view");
    
    // Update URL params to show the specific note
    setSearchParams({ n: noteId, m: "view" });
  };

  // Handle switching to chat after sharing a note
  const handleSwitchToChat = () => {
    setActiveTab("chat");
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-50/30 via-white to-slate-50/20 dark:from-slate-900/50 dark:via-slate-900 dark:to-slate-800/30">
      {/* Fixed Header */}
      <AnimatePresence>
        {!hideUI && (
          <motion.div
            key="header"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.2 },
            }}
            className="flex-shrink-0"
          >
            <GroupHeader group={group} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Tabs */}
      <AnimatePresence>
        {!hideUI && (
          <motion.div
            key="tabs"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1],
              opacity: { duration: 0.2 },
            }}
            className="flex-shrink-0 bg-gradient-to-r from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/80 dark:to-slate-900 border-b border-slate-200/80 dark:border-slate-700/60 backdrop-blur-md shadow-sm dark:shadow-black/10"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="max-w-full w-full"
            >
              <TabsList className="grid max-w-[96%] w-full grid-cols-2 mx-auto my-4 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-800 dark:via-slate-700/80 dark:to-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-sm backdrop-blur-sm rounded-lg p-1">
                <TabsTrigger
                  value="notes"
                  className="flex items-center gap-2 transition-all duration-300 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 dark:data-[state=active]:from-blue-900/30 dark:data-[state=active]:to-indigo-900/30 data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-700/50 data-[state=active]:shadow-md data-[state=active]:shadow-blue-100/50 dark:data-[state=active]:shadow-blue-900/20 data-[state=active]:text-blue-800 dark:data-[state=active]:text-blue-200 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:border-slate-300/50 dark:hover:border-slate-600/50 hover:shadow-sm hover:scale-[1.02] text-slate-700 dark:text-slate-300 data-[state=active]:font-medium"
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-medium">Notes</span>
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="flex items-center gap-2 transition-all duration-300 rounded-md data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-50 data-[state=active]:to-indigo-50 dark:data-[state=active]:from-blue-900/30 dark:data-[state=active]:to-indigo-900/30 data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-700/50 data-[state=active]:shadow-md data-[state=active]:shadow-blue-100/50 dark:data-[state=active]:shadow-blue-900/20 data-[state=active]:text-blue-800 dark:data-[state=active]:text-blue-200 bg-white/80 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/30 hover:bg-slate-50/80 dark:hover:bg-slate-800/80 hover:border-slate-300/50 dark:hover:border-slate-600/50 hover:shadow-sm hover:scale-[1.02] text-slate-700 dark:text-slate-300 data-[state=active]:font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-medium">Chat</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flexible Content Area */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsContent
            value="notes"
            className="h-full m-0 p-0 focus-visible:outline-none"
          >
            <div className="h-full bg-gradient-to-b from-transparent via-slate-50/20 to-transparent dark:via-slate-900/20">
              <NotesView group={group} />
            </div>
          </TabsContent>
          <TabsContent
            value="chat"
            className="h-full m-0 p-0 focus-visible:outline-none"
          >
            <div className="h-full bg-gradient-to-b from-transparent via-slate-50/20 chat-bg  to-transparent dark:via-slate-900/20">
              <ChatView groupId={group.id} onNoteClick={handleNoteClick} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupContent;