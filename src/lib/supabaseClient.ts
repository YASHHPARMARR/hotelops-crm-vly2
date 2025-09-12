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

// Add: clear keys and reset client
export function clearSupabaseKeys() {
  try {
    localStorage.removeItem("VITE_SUPABASE_URL");
    localStorage.removeItem("VITE_SUPABASE_ANON_KEY");
    client = undefined;
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

// Add: Centralized Supabase error normalization to keep messages consistent across UI
export function normalizeSupabaseError(err: any): string {
  const code = err?.code || err?.status || err?.name;
  const message = err?.message || err?.hint || err?.details || "Unknown error";
  const msg = String(message).toLowerCase();

  if (msg.includes("fetch failed") || msg.includes("failed to fetch") || msg.includes("network"))
    return "Network error. Check your connection.";

  if (code === "42501" || /rls|row level security|permission/i.test(String(message)))
    return "Permission denied by RLS. Apply the RLS SQL and ensure you're logged in if required.";

  if (code === "PGRST116" || /duplicate key/i.test(String(message)))
    return "Duplicate ID detected. Try again.";

  if (code === "PGRST204" || code === 404 || /route not found|not found/i.test(msg))
    return "Table or route not found. Verify tables are created in Supabase and Realtime is enabled.";

  if (code === "429" || /rate limit/i.test(String(message)))
    return "Rate limited. Please slow down and try again.";

  if (code === "401" || /unauthorized|auth/i.test(String(message)))
    return "Unauthorized. Please login via the Auth page.";

  return err?.message ?? "Unknown error";
}

// Add: Initialization diagnostics to explain why client is missing
export function getSupabaseInitStatus(): { ok: boolean; missing: { sdk?: boolean; url?: boolean; anon?: boolean } } {
  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  const saved = (() => {
    try {
      return {
        url: localStorage.getItem("VITE_SUPABASE_URL") || undefined,
        anon: localStorage.getItem("VITE_SUPABASE_ANON_KEY") || undefined,
      };
    } catch {
      return { url: undefined, anon: undefined };
    }
  })();

  const supabaseUrl = envUrl ?? saved.url;
  const supabaseAnonKey = envAnon ?? saved.anon;
  const sdk = (typeof window !== "undefined" ? (window as any).supabase : undefined) as any | undefined;

  const missing = {
    sdk: !sdk || typeof sdk.createClient !== "function",
    url: !supabaseUrl,
    anon: !supabaseAnonKey,
  };
  return { ok: !missing.sdk && !missing.url && !missing.anon, missing };
}

// Add: Strict getter that throws with a helpful message if not initialized
export function getSupabaseStrict() {
  const s = getSupabase();
  if (s) return s;

  const status = getSupabaseInitStatus();
  const parts: string[] = [];
  if (status.missing.sdk) parts.push("Supabase JS SDK not available on window.supabase");
  if (status.missing.url) parts.push("Missing Supabase URL (set in Admin → Settings or .env)");
  if (status.missing.anon) parts.push("Missing Supabase Anon Key (set in Admin → Settings or .env)");

  const reason = parts.length ? parts.join("; ") : "Unknown initialization problem";
  throw new Error(`Supabase not initialized: ${reason}`);
}

// Add: Safe wrapper to execute a Supabase call and return uniform result
export async function withSupabase<T>(
  fn: (s: any) => Promise<T>
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  try {
    const s = getSupabaseStrict();
    const data = await fn(s);
    return { ok: true as const, data };
  } catch (e: any) {
    return { ok: false as const, error: normalizeSupabaseError(e) };
  }
}

// Add: Supabase auth helpers and current user email accessor
export async function supabaseSignUp(email: string, password: string) {
  const s = getSupabase();
  if (!s) throw new Error("Supabase not initialized");
  const { data, error } = await s.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function supabaseSignIn(email: string, password: string) {
  const s = getSupabase();
  if (!s) throw new Error("Supabase not initialized");
  const { data, error } = await s.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function supabaseSignOut() {
  const s = getSupabase();
  if (!s) return;
  const { error } = await s.auth.signOut();
  if (error) throw error;
}

export async function getSupabaseUserEmail(): Promise<string | undefined> {
  const s = getSupabase();
  if (!s) return undefined;
  try {
    const { data } = await s.auth.getUser();
    return data?.user?.email ?? undefined;
  } catch {
    return undefined;
  }
}