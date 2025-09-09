declare module "@supabase/supabase-js" {
  export type SupabaseClient = any;
  export function createClient(
    url: string,
    anonKey: string,
    options?: any
  ): SupabaseClient;
}
