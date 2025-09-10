declare global {
  interface Window {
    supabase?: any;
  }
}

let client: any | undefined;

// Helper: read persisted keys from localStorage
function readSavedKeys(): { url?: string; anon?: string } {
  try {
    const url = localStorage.getItem("VITE_SUPABASE_URL") || undefined;
    const anon = localStorage.getItem("VITE_SUPABASE_ANON_KEY") || undefined;
    return { url, anon };
  } catch {
    return { url: undefined, anon: undefined };
  }
}

// Allow UI to persist keys and reset client
export function setSupabaseKeys(url: string, anonKey: string) {
  try {
    localStorage.setItem("VITE_SUPABASE_URL", url);
    localStorage.setItem("VITE_SUPABASE_ANON_KEY", anonKey);
    client = undefined; // reset so next getSupabase recreates
  } catch {
    // ignore
  }
}

// Lazily create the client the first time it's requested
export function getSupabase() {
  if (client) return client;

  // Prefer env, fallback to saved keys
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const saved = readSavedKeys();

  const supabaseUrl = envUrl ?? saved.url;
  const supabaseAnonKey = envAnon ?? saved.anon;

  const sdk = (typeof window !== "undefined" ? (window as any).supabase : undefined) as any | undefined;
  if (!sdk || !supabaseUrl || !supabaseAnonKey) return undefined;
  try {
    client = sdk.createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 5 } },
    });
    return client;
  } catch {
    return undefined;
  }
}

// Keep existing eager export for compatibility; now created lazily if not set
export const supabase = getSupabase();