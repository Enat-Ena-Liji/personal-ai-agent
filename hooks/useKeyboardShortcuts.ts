"use client";

import { useEffect } from "react";

export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      // Check if modifier key is pressed
      const key = event.key.toLowerCase();
      
      // Handle Ctrl/Cmd + key
      if (event.metaKey || event.ctrlKey) {
        const combo = `ctrl-${key}`;
        if (shortcuts[combo]) {
          event.preventDefault();
          shortcuts[combo]();
        }
        return;
      }
      
      // Handle single key
      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts]);
}