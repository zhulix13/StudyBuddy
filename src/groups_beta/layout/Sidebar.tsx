"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Plus, Settings } from "lucide-react";
import { GroupCard } from "../layout/GroupCard";
import { getGroupsWhereUserIsMember } from "@/services/supabase-groups";
import type { StudyGroup } from "@/types/groups";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import CreateGroupModal from "./CreateGroupModal";
import SettingsModal from "./SettingsModal";
import { useIsMobile } from "@/hooks/useIsMobile";

interface SidebarProps {
  setActiveGroup: (group: StudyGroup | null) => void;
  activeGroupId: string | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const Sidebar = ({
  setActiveGroup,
  activeGroupId,
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const {
    data: groups = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user-groups"],
    queryFn: getGroupsWhereUserIsMember,
    staleTime: 1000 * 60 * 5, // 5 minutes
    onSuccess: (data: StudyGroup[]) => {
      if (data.length === 0) {
        toast.info(
          "You have no groups yet. Join or create one to get started."
        );
      } else {
        toast.success("Groups loaded successfully");
        console.log("Groups loaded:", data);
      }
      // Check if the current persisted activeGroup.id exists in the new fetched list
      if (activeGroupId) {
        const stillValid = data.find(
          (group: StudyGroup) => group.id === activeGroupId
        );
        if (stillValid) {
          setActiveGroup(stillValid);
        } else {
          setActiveGroup(null); // or reset logic if the group was deleted or user removed
        }
      }
    },
    onError: (err: any) => {
      toast.error("Failed to load groups");
      console.error("Error fetching groups:", err);
    },
  });

  const filteredGroups: StudyGroup[] = groups.filter((group: StudyGroup) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGroupClick = (group: StudyGroup) => {
    setActiveGroup(group);
    navigate(`/groups/${group.id}`);
    setSidebarOpen(false); // Close sidebar after selecting a group
    // if (setSidebarMobileOpen) {
    //   setSidebarMobileOpen(false)
    // }
  };

  const handleCreateSuccess = (newGroup: StudyGroup) => {
    setActiveGroup(newGroup);
    navigate(`/groups/${newGroup.id}`);

    setIsCreateModalOpen(false);
  };

  const LoadingState = () => (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="p-4 border rounded-md">
          <Skeleton height={20} width={`60%`} />
          <Skeleton height={15} width={`40%`} className="mt-2" />
        </div>
      ))}
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <Search className="w-8 h-8 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500 mb-1">
        {searchTerm ? "No groups found" : "No study groups yet"}
      </p>
      <p className="text-xs text-gray-400">
        {searchTerm
          ? "Try a different search term"
          : "Join or create a group to get started"}
      </p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
        <Search className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-sm text-red-600 mb-1">Failed to load groups</p>
      <p className="text-xs text-gray-400">{(error as Error)?.message}</p>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full ">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Study Groups</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 h-8 w-8"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            disabled={isLoading}
          />
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full flex items-center gap-2"
          disabled={isLoading}
        >
          <Plus className="w-4 h-4" />
          Create Group
        </Button>
      </div>

      {/* Groups List */}
      <ScrollArea className="flex-1 pb-12 overflow-y-scroll hide-scrollbar">
        <div className="p-4">
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState />
          ) : filteredGroups.length === 0 ? (
            <EmptyState />
          ) : (
            filteredGroups.map((group: StudyGroup) => (
              <GroupCard
                key={group.id}
                group={group}
                isActive={group.id === activeGroupId}
                onClick={() => handleGroupClick(group)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Modals */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );

  return (
    <>
      <div className="md:hidden block w-fit">
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="w-full p-0">
              {sidebarContent}
            </SheetContent>
          </Sheet>
        )}
      </div>
      {/* Mobile Sidebar */}

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed left-0 top-16 h-full w-[320px] border-r bg-white ">
        {sidebarContent}
      </aside>
    </>
  );
};
