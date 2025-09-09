const THEME_STORAGE_KEY = "app_theme";
export type AppTheme = "neon" | "ocean" | "sunset";

export function getTheme(): AppTheme {
  const t = (typeof window !== "undefined" && localStorage.getItem(THEME_STORAGE_KEY)) as AppTheme | null;
  if (t === "neon" || t === "ocean" || t === "sunset") return t;
  return "neon";
}

export function setTheme(theme: AppTheme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    // Dispatch an event so listeners (AdminShell) can react immediately
    window.dispatchEvent(new CustomEvent("app:theme-changed", { detail: { theme } }));
  } catch {
    // ignore
  }
}

export function applyThemeToDocument(theme: AppTheme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function cycleTheme(current?: AppTheme): AppTheme {
  const order: AppTheme[] = ["neon", "ocean", "sunset"];
  const idx = order.indexOf(current ?? getTheme());
  return order[(idx + 1) % order.length];
}
