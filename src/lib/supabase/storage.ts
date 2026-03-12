const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

/** Get the public URL for an image stored in the photos bucket */
export function getImageUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/photos/${storagePath}`;
}
