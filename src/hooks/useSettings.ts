import { useEffect, useState } from "react";
import { storage, type Position, type ThemeMode } from "@/lib/storage";

interface Settings {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  position: Position;
  showValidation: boolean;
  showTools: boolean;
}

/**
 * Reads + subscribes to user UI settings (theme, position, optional
 * panel features). Resolves theme="auto" against `prefers-color-scheme`.
 * Re-renders consumers on any change in storage or system color-scheme
 * preference.
 */
export function useSettings(): Settings {
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [position, setPositionState] = useState<Position>("bottom-left");
  const [showValidation, setShowValidationState] = useState<boolean>(false);
  const [showTools, setShowToolsState] = useState<boolean>(false);
  const [systemDark, setSystemDark] = useState<boolean>(() =>
    typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true,
  );

  useEffect(() => {
    storage.getTheme().then(setThemeState);
    storage.getPosition().then(setPositionState);
    storage.getShowValidation().then(setShowValidationState);
    storage.getShowTools().then(setShowToolsState);
    const unsubscribe = storage.onAnyChange((changes) => {
      if (changes["tagpeek-theme"])
        setThemeState(changes["tagpeek-theme"] as ThemeMode);
      if (changes["tagpeek-position"])
        setPositionState(changes["tagpeek-position"] as Position);
      if (typeof changes["tagpeek-show-validation"] === "boolean")
        setShowValidationState(changes["tagpeek-show-validation"]);
      if (typeof changes["tagpeek-show-tools"] === "boolean")
        setShowToolsState(changes["tagpeek-show-tools"]);
    });

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMqChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", onMqChange);

    return () => {
      unsubscribe();
      mq.removeEventListener("change", onMqChange);
    };
  }, []);

  const resolvedTheme: "light" | "dark" =
    theme === "auto" ? (systemDark ? "dark" : "light") : theme;

  return { theme, resolvedTheme, position, showValidation, showTools };
}
