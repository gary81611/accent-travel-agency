import { createClient } from "./server";

export type SiteSettings = {
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  business_name: string;
  tagline: string;
  subtitle: string;
  year_established: string;
  facebook: string;
  venmo: string;
  zelle: string;
  [key: string]: string;
};

const DEFAULTS: SiteSettings = {
  phone: "(806) 570-6640",
  email: "accenttravelgroups@gmail.com",
  address: "6006 Tuscany Village",
  city: "Amarillo",
  state: "TX",
  zip: "79119",
  business_name: "Accent Travel Agency",
  tagline: "Ask Us. We've Been There.",
  subtitle: "Since 1981 · Group Travel for 10 or More",
  year_established: "1981",
  facebook: "https://www.facebook.com/accenttravelagency/",
  venmo: "",
  zelle: "",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase.from("settings").select("key, value");

  const settings = { ...DEFAULTS };
  for (const row of (data || []) as { key: string; value: string }[]) {
    if (row.key && !row.key.startsWith("image_")) {
      settings[row.key] = row.value;
    }
  }
  return settings;
}
