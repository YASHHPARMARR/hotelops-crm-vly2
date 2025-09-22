import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export function setSupabaseKeys(url: string, anonKey: string) {
  try {
    supabaseClient = createClient(url, anonKey);
    localStorage.setItem('VITE_SUPABASE_URL', url);
    localStorage.setItem('VITE_SUPABASE_ANON_KEY', anonKey);
    // Notify app that Supabase is ready without requiring a page refresh
    try { window.dispatchEvent(new Event('supabase:ready')); } catch {}
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabaseClient = null;
  }
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  try {
    // Try environment variables first
    const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    
    if (envUrl && envAnonKey) {
      supabaseClient = createClient(envUrl, envAnonKey);
      return supabaseClient;
    }

    // Fallback to localStorage
    const lsUrl = localStorage.getItem('VITE_SUPABASE_URL');
    const lsAnonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
    
    if (lsUrl && lsAnonKey) {
      supabaseClient = createClient(lsUrl, lsAnonKey);
      return supabaseClient;
    }
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }

  return null;
}

export function clearSupabaseKeys() {
  supabaseClient = null;
  localStorage.removeItem('VITE_SUPABASE_URL');
  localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
  // Notify app that Supabase was cleared
  try { window.dispatchEvent(new Event('supabase:cleared')); } catch {}
}

export async function getSupabaseUserEmail(): Promise<string | null> {
  const client = getSupabase();
  if (!client) {
    // Fallback to stored demo email if Supabase isn't initialized
    try {
      const demoEmail = typeof window !== "undefined" ? localStorage.getItem("DEMO_USER_EMAIL") : null;
      return demoEmail || null;
    } catch {
      return null;
    }
  }
  
  try {
    const { data: { user } } = await client.auth.getUser();
    if (user?.email) return user.email || null;

    // Fallback: use demo email captured from Convex auth
    try {
      const demoEmail = typeof window !== "undefined" ? localStorage.getItem("DEMO_USER_EMAIL") : null;
      return demoEmail || null;
    } catch {
      return null;
    }
  } catch {
    // Fallback: use demo email captured from Convex auth
    try {
      const demoEmail = typeof window !== "undefined" ? localStorage.getItem("DEMO_USER_EMAIL") : null;
      return demoEmail || null;
    } catch {
      return null;
    }
  }
}

export function normalizeSupabaseError(error: any): string {
  if (!error) return 'Unknown error';
  
  if (typeof error === 'string') return error;
  
  if (error.message) {
    // Common Supabase/PostgreSQL errors
    if (error.message.includes('permission denied') || error.message.includes('RLS')) {
      return 'Permission denied by RLS. Apply the RLS SQL and ensure you\'re logged in if required.';
    }
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      return 'Table does not exist. Please run the setup SQL from Admin Settings.';
    }
    return error.message;
  }
  
  return 'Unknown error occurred';
}

export function getSupabaseInitStatus(): any {
  try {
    const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    const lsUrl = localStorage.getItem('VITE_SUPABASE_URL') || null;
    const lsAnonKey = localStorage.getItem('VITE_SUPABASE_ANON_KEY') || null;

    const source = envUrl && envAnonKey ? "env" : (lsUrl && lsAnonKey ? "local" : "none");
    const connected = !!getSupabase();
    return {
      connected,
      source,
      url: envUrl || lsUrl,
    };
  } catch {
    return { connected: false, source: "none", url: null };
  }
}

export async function supabaseSignIn(email: string, password?: string): Promise<any> {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not initialized");
  if (password && password.length > 0) {
    return await client.auth.signInWithPassword({ email, password });
  }
  return await client.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  });
}

/** Deprecated: password-based supabaseSignUp removed in favor of magic-link version below */

export async function supabaseSignOut(): Promise<any> {
  const client = getSupabase();
  if (!client) throw new Error("Supabase not initialized");
  return await client.auth.signOut();
}

export async function supabaseSignUp(email: string): Promise<void> {
  const supabase = getSupabase?.();
  if (!supabase) throw new Error("Supabase is not configured");

  // Prefer an explicit public URL if provided, else current origin, else dev fallback
  const explicitEnvUrl =
    (import.meta.env as any)?.VITE_PUBLIC_URL ||
    (import.meta.env as any)?.VITE_APP_URL ||
    (import.meta.env as any)?.VITE_SITE_URL ||
    undefined;

  const lsOverride = (typeof window !== "undefined" && localStorage.getItem("SUPABASE_REDIRECT_URL")) || undefined;

  const origin =
    explicitEnvUrl ||
    lsOverride ||
    (typeof window !== "undefined" && window.location?.origin) ||
    "http://localhost:5173";

  const redirect = origin.endsWith("/") ? origin : `${origin}/`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirect },
  });

  if (error) throw error;
}