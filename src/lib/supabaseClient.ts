declare global {
  interface Window {
    supabase?: any;
  }
}

let client: any | undefined;

// Lazily create the client the first time it's requested
export function getSupabase() {
  if (client) return client;
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const sdk = (typeof window !== "undefined" ? window.supabase : undefined) as any | undefined;
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