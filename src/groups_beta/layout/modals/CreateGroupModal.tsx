// Desktop Create Group Panel with Supabase Integration

"use client";


import { useIsMobile } from "@/hooks/useIsMobile";
import { DesktopCreateGroupPanel } from "./DesktopCreateGroupPanel";

import { createPortal } from "react-dom";

import { MobileCreateGroupPanel } from "./CreateGroupModalMobile";

// Desktop Panel Variants
const desktopPanelVariants = {
  hidden: {
    x: "100%",
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      duration: 0.4,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 40,
      duration: 0.3,
    },
  },
};

const desktopBackdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Modal variants for success/error
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: { opacity: 0, scale: 0.95, y: -20, transition: { duration: 0.2 } },
};




// Main Create Group Slider Panel Component
export const CreateGroupSliderPanel = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (group: any) => void;
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileCreateGroupPanel
        isOpen={isOpen}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return createPortal(
    <DesktopCreateGroupPanel
      isOpen={isOpen}
      onClose={onClose}
      onSuccess={onSuccess}
      desktopBackdropVariants={desktopBackdropVariants}
      desktopPanelVariants={desktopPanelVariants}
      modalVariants={modalVariants}
    />,
    document.body
  );
};
