import { useEffect } from "react";

import { Sidebar} from "../layout/Sidebar";

import { useGroupStore } from "@/store/groupStore";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const GroupLayout = () => {
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup);
  
//   const activeTab = useGroupStore((s) => s.activeTab);
//   const setActiveTab = useGroupStore((s) => s.setActiveTab);

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
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar
        
        setActiveGroup={setActiveGroup}
        activeGroupId={activeGroup?.id ?? null}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 md:ml-[320px] flex flex-col bg-white">
      
         <Outlet />
     
      </main>
    </div>
  );
};

export default GroupLayout;