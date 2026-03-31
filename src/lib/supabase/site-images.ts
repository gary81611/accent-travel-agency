import { createClient } from "./server";

// Fetches all image_* settings and returns a map like { hero_home: "heroes/...", hero_home_pos: "center 30%" }
export async function getSiteImages(): Promise<Record<string, string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .like("key", "image_%");

  const images: Record<string, string> = {};
  for (const row of (data || []) as { key: string; value: string }[]) {
    // Strip "image_" prefix for cleaner access: image_hero_home -> hero_home
    images[row.key.replace("image_", "")] = row.value;
  }
  return images;
}
