// QuickActions.tsx
import { useState, useRef } from "react";
import { Clock, Users, FileText, Target, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGroupStore } from "@/store/groupStore";
import { useNoteStore } from "@/store/noteStore";
import { GroupSelectModal } from "./groupselect";
import { QuickActionsCreateGroupModal } from "./groupcreate";
import type { StudyGroup } from "@/types/groups";
import { toast } from "sonner";

const QuickActions = () => {
  const navigate = useNavigate();
  const { setActiveGroup, setActiveTab } = useGroupStore();
  const { setMode } = useNoteStore();
  
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const newNoteButtonRef = useRef<HTMLButtonElement>(null);
  const createGroupButtonRef = useRef<HTMLButtonElement>(null);

  const handleNewNoteClick = () => {
    setIsGroupModalOpen(true);
  };

  const handleCreateGroupClick = () => {
    setIsCreateGroupModalOpen(true);
  };

  const handleGroupSelect = (group: StudyGroup) => {
    setActiveGroup(group);
    setActiveTab('notes')
    setMode("create");
    setIsGroupModalOpen(false);
    navigate(`/groups/${group.id}`);
    toast.success(`Opening ${group.name} to create new note`);
  };

  const handleCreateGroupSuccess = (newGroup: StudyGroup) => {
    setActiveGroup(newGroup);
    navigate(`/groups/${newGroup.id}`);
    
  };

  const actions = [
    {
      label: "Create Group",
      icon: Plus,
      color: "from-blue-500 to-blue-600",
      action: handleCreateGroupClick,
      ref: createGroupButtonRef,
    },
    {
      label: "Join Session",
      icon: Users,
      color: "from-purple-500 to-purple-600",
      action: () => toast.info("Join session feature coming soon!"),
    },
    {
      label: "New Note",
      icon: FileText,
      color: "from-green-500 to-green-600",
      action: handleNewNoteClick,
      ref: newNoteButtonRef,
    },
    {
      label: "Set Goal",
      icon: Target,
      color: "from-orange-500 to-orange-600",
      action: () => toast.info("Set goal feature coming soon!"),
    },
  ];

  return (
    <>
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                ref={action.ref}
                onClick={action.action}
                className={`
                  flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-3 
                  p-3 sm:p-4 rounded-xl text-white font-medium text-sm sm:text-base
                  bg-gradient-to-r ${action.color} hover:shadow-lg transform hover:scale-105
                  transition-all duration-200 active:scale-95
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs sm:text-base">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Group Selection Modal for New Note */}
      <GroupSelectModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onSelectGroup={handleGroupSelect}
        anchorRef={newNoteButtonRef as any}
      />

      {/* Create Group Modal */}
      <QuickActionsCreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onSuccess={handleCreateGroupSuccess}
        anchorRef={createGroupButtonRef as any}
      />
    </>
  );
};

export default QuickActions;