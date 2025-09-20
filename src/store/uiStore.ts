import { persist } from "zustand/middleware";
import { create } from "zustand";


type UIStore = {
   hideUI: boolean;
   setHideUI: (hide: boolean) => void;
};

const useUiStore = create<UIStore>()(
   (set) => ({
      hideUI: false,
      setHideUI: (hide: boolean) => set({ hideUI: hide }),
   })
);

export default useUiStore;