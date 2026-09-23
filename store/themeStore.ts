import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "dark",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "dark" ? "light" : "dark",
        })),
    }),
    { name: "pack-ship-theme" },
  ),
);

export const THEME_INIT_SCRIPT = `(function(){try{var r=localStorage.getItem("pack-ship-theme");var t=r?JSON.parse(r):null;var m=(t&&t.state&&t.state.theme)||"dark";document.documentElement.setAttribute("data-theme",m);document.documentElement.style.colorScheme=m}catch(e){document.documentElement.setAttribute("data-theme","dark");document.documentElement.style.colorScheme="dark"}})();`;
