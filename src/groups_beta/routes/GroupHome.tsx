import { MessageCircle } from "lucide-react";
import { Sidebar } from "../layout/Sidebar";
import { useGroupStore } from "@/store/groupStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const GroupHome = () => {
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup);
  const sidebarOpen = useGroupStore((s) => s.sidebarOpen);
  const setSidebarOpen = useGroupStore((s) => s.setSidebarOpen);
  const navigate = useNavigate();

 useEffect(() => {
  if (activeGroup) {
    const currentGroupId = window.location.pathname.split('/groups/')[1]?.split('/')[0];
    
    // Only navigate if we're on a different group or not on a group page
    if (currentGroupId !== activeGroup.id) {
      navigate(`/groups/${activeGroup.id}${window.location.search}`);
    }
  }
}, [activeGroup]);
  return (
    <>
      <div className="hidden md:flex flex-1  items-center mx-auto justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Welcome to StudyBuddy
          </h2>
          <p className="text-gray-500">Select a group to start collaborating</p>
        </div>
      </div>

      <div className="h-screen block md:hidden ">
        <Sidebar
          setActiveGroup={setActiveGroup}
          activeGroupId={activeGroup?.id ?? null}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          
          
        />
      </div>
    </>
  );
};

export default GroupHome;

