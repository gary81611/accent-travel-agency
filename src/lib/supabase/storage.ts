import { getSupabaseUrl } from "./url";

/** Get the public URL for an image stored in the photos bucket */
export function getImageUrl(storagePath: string): string {
  return `${getSupabaseUrl()}/storage/v1/object/public/photos/${storagePath}`;
}
