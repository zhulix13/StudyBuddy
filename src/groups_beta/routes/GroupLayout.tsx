

import { Sidebar} from "../layout/Sidebar";

import { useGroupStore } from "@/store/groupStore";
import { Outlet } from "react-router-dom";

export const MainLayout = () => {
  const activeGroup = useGroupStore((s) => s.activeGroup);
  const setActiveGroup = useGroupStore((s) => s.setActiveGroup);
  
  const activeTab = useGroupStore((s) => s.activeTab);
  const setActiveTab = useGroupStore((s) => s.setActiveTab);

 const sidebarOpen = useGroupStore((s) => s.sidebarOpen);
 const setSidebarOpen = useGroupStore((s) => s.setSidebarOpen);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <Sidebar
        onSelectGroup={setActiveGroup}
        activeGroupId={activeGroup?.id ?? null}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
