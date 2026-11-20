/**
 * Public Supabase project URL.
 * Trim so a trailing newline on NEXT_PUBLIC_SUPABASE_URL is not copied into
 * storage addresses (it is encoded as %0A in image URLs).
 */
export function getSupabaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
}
