const THEME_STORAGE_KEY = "app_theme";
export type AppTheme =
  | "neon"
  | "ocean"
  | "sunset"
  | "forest"
  | "pastel"
  | "midnight"
  | "sand"
  | "rose"
  | "beige"
  | "ivory"
  | "lavender"
  | "pearl"
  | "onyx"
  | "amethyst"
  | "sky"
  | "mocha"
  | "mint";

export function getTheme(): AppTheme {
  const t = (typeof window !== "undefined" && localStorage.getItem(THEME_STORAGE_KEY)) as AppTheme | null;
  const allowed: AppTheme[] = [
    "neon",
    "ocean",
    "sunset",
    "forest",
    "pastel",
    "midnight",
    "sand",
    "rose",
    "beige",
    "ivory",
    "lavender",
    "pearl",
    "onyx",
    "amethyst",
    "sky",
    "mocha",
    "mint",
  ];
  if (t && allowed.includes(t)) return t;
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
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);

  // Toggle dark base only for dark themes to avoid mixed light/dark experience
  const lightThemes: AppTheme[] = ["pastel", "sand", "beige", "ivory", "lavender", "pearl", "sky", "mocha", "mint"];
  if (lightThemes.includes(theme)) {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}

export function cycleTheme(current?: AppTheme): AppTheme {
  const order: AppTheme[] = [
    "neon",
    "ocean",
    "sunset",
    "forest",
    "midnight",
    "rose",
    "sand",
    "pastel",
    "beige",
    "ivory",
    "lavender",
    "pearl",
    "sky",
    "mocha",
    "mint",
    "onyx",
    "amethyst",
  ];
  const idx = order.indexOf(current ?? getTheme());
  return order[(idx + 1) % order.length];
}