declare global {
  interface Window {
    supabase?: any;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Create client only when SDK and env vars exist; otherwise undefined (falls back to local mode)
function makeClient() {
  const sdk = (typeof window !== "undefined" ? window.supabase : undefined) as any | undefined;
  if (!sdk || !supabaseUrl || !supabaseAnonKey) return undefined;
  try {
    return sdk.createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
      realtime: { params: { eventsPerSecond: 5 } },
    });
  } catch {
    return undefined;
  }
}

export const supabase = makeClient();