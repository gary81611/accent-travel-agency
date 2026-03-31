import { createClient } from "@/lib/supabase/server";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = "https://accenttravelagency.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/trips`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/travel-info`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  ];

  const { data: trips } = await supabase
    .from("trips")
    .select("slug, created_at")
    .neq("slug", "gallery");

  const tripRoutes: MetadataRoute.Sitemap = (trips || []).map((trip) => ({
    url: `${baseUrl}/trips/${trip.slug}`,
    lastModified: new Date(trip.created_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...tripRoutes];
}
