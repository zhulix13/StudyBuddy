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
      console.log("Active group changed:", activeGroup);
      navigate(`/groups/${activeGroup.id}`); // Navigate to the group page when a group is active
      
   }
}, [activeGroup]);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar
        
        setActiveGroup={setActiveGroup}
        activeGroupId={activeGroup?.id ?? null}
        isOpen={sidebarOpen}
        setsidebarOpen={setSidebarOpen}
      />

      <main className="flex-1 md:ml-[320px] flex flex-col bg-white">
        {/* <MobileHeader
          activeGroup={activeGroup}
          onMenuClick={() => setSidebarOpen(true)}
        /> */}
         <Outlet />
        {/* {activeGroup ? <GroupContent group={activeGroup} /> : <GroupHome />} */}
      </main>
    </div>
  );
};

export default GroupLayout;