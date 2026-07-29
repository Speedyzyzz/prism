/** OmniShop OS — UI Store (Zustand) */
import { create } from "zustand";

interface Notification {
  id: string;
  type: "success" | "error" | "info";
  message: string;
  timestamp: number;
}

interface UIStore {
  // Sidebar
  sidebarOpen: boolean;
  toggleSidebar: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  toggleCommandPalette: () => void;

  // Active workspace tracking
  activeWorkspace: string;
  setActiveWorkspace: (workspace: string) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (type: Notification["type"], message: string) => void;
  dismissNotification: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),

  commandPaletteOpen: false,
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  activeWorkspace: "workspace",
  setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),

  notifications: [],
  addNotification: (type, message) =>
    set((s) => ({
      notifications: [
        ...s.notifications,
        { id: crypto.randomUUID(), type, message, timestamp: Date.now() },
      ],
    })),
  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
}));
