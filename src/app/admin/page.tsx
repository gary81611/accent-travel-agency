"use client";

import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type RecentTrip = { id: string; title: string; destination: string; dates: string | null; featured: boolean };
type RecentPhoto = { id: string; storage_path: string; caption: string | null; display_shape: string };

export default function AdminDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({ trips: 0, photos: 0, pages: 0, featured: 0, galleryPhotos: 0 });
  const [recentTrips, setRecentTrips] = useState<RecentTrip[]>([]);
  const [recentPhotos, setRecentPhotos] = useState<RecentPhoto[]>([]);

  useEffect(() => {
    async function load() {
      const [trips, photos, pages, featured, galleryTrip] = await Promise.all([
        supabase.from("trips").select("id", { count: "exact", head: true }).neq("slug", "gallery"),
        supabase.from("photos").select("id", { count: "exact", head: true }),
        supabase.from("pages").select("id", { count: "exact", head: true }),
        supabase.from("trips").select("id", { count: "exact", head: true }).eq("featured", true),
        supabase.from("trips").select("id").eq("slug", "gallery").single(),
      ]);

      let galleryCount = 0;
      if (galleryTrip.data) {
        const { count } = await supabase.from("photos").select("id", { count: "exact", head: true }).eq("trip_id", galleryTrip.data.id);
        galleryCount = count || 0;
      }

      setStats({
        trips: trips.count || 0,
        photos: photos.count || 0,
        pages: pages.count || 0,
        featured: featured.count || 0,
        galleryPhotos: galleryCount,
      });

      const { data: rTrips } = await supabase
        .from("trips").select("id, title, destination, dates, featured")
        .neq("slug", "gallery").order("created_at", { ascending: false }).limit(5);
      setRecentTrips((rTrips || []) as RecentTrip[]);

      const { data: rPhotos } = await supabase
        .from("photos").select("id, storage_path, caption, display_shape")
        .order("created_at", { ascending: false }).limit(8);
      setRecentPhotos((rPhotos || []) as RecentPhoto[]);
    }
    load();
  }, [supabase]);

  const statCards = [
    { label: "Active Trips", value: stats.trips, icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "text-brand-teal", bg: "bg-brand-teal/10" },
    { label: "Featured Trips", value: stats.featured, icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z", color: "text-brand-gold", bg: "bg-brand-gold/10" },
    { label: "Total Photos", value: stats.photos, icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Gallery Photos", value: stats.galleryPhotos, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Pages", value: stats.pages, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "text-blue-600", bg: "bg-blue-50" },
  ];

  const shortcuts = [
    { label: "Add a New Trip", href: "/admin/trips/new", icon: "M12 4v16m8-8H4", color: "bg-brand-gold" },
    { label: "Manage Trips", href: "/admin/trips", icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "bg-brand-teal" },
    { label: "Photo Gallery", href: "/admin/gallery", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", color: "bg-emerald-600" },
    { label: "Edit Pages", href: "/admin/pages", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "bg-blue-600" },
    { label: "Site Settings", href: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "bg-brand-charcoal" },
    { label: "View Live Site", href: "/", icon: "M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14", color: "bg-gray-500", external: true },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-brand-teal uppercase tracking-wide">
          Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back! Here&apos;s an overview of your site.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-3">
            <div className={`${stat.bg} rounded-full p-2.5 shrink-0`}>
              <svg className={`w-5 h-5 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-charcoal leading-tight">{stat.value}</p>
              <p className="text-[11px] text-gray-400 leading-tight">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-brand-charcoal mb-3 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              target={s.external ? "_blank" : undefined}
              className={`${s.color} text-white rounded-xl px-5 py-4 font-[family-name:var(--font-heading)] text-base font-bold uppercase tracking-wide hover:opacity-90 transition-all hover:shadow-md flex items-center gap-3`}
            >
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
              </svg>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent trips */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-brand-charcoal uppercase tracking-wide">
              Recent Trips
            </h2>
            <Link href="/admin/trips" className="text-xs text-brand-gold hover:underline font-semibold">View All</Link>
          </div>
          {recentTrips.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-6">No trips yet</p>
          ) : (
            <div className="space-y-2">
              {recentTrips.map((trip) => (
                <Link key={trip.id} href={`/admin/trips/${trip.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal group-hover:text-brand-gold transition-colors">
                      {trip.title}
                    </p>
                    <p className="text-xs text-gray-400">{trip.destination}{trip.dates ? ` · ${trip.dates}` : ""}</p>
                  </div>
                  {trip.featured && (
                    <span className="text-[10px] font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full uppercase">
                      Featured
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent photos */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-semibold text-brand-charcoal uppercase tracking-wide">
              Recent Photos
            </h2>
            <Link href="/admin/gallery" className="text-xs text-brand-gold hover:underline font-semibold">Gallery</Link>
          </div>
          {recentPhotos.length === 0 ? (
            <p className="text-sm text-gray-300 text-center py-6">No photos yet</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {recentPhotos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden">
                  <Image src={getImageUrl(photo.storage_path)} alt={photo.caption || ""} fill className="object-cover" sizes="100px" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Helpful tips */}
      <div className="bg-brand-gold-pale/50 rounded-xl p-5 border border-brand-gold/10">
        <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold text-brand-charcoal uppercase tracking-wide mb-2">
          Tips for Managing Your Site
        </h3>
        <ul className="text-sm text-brand-charcoal/70 space-y-1.5">
          <li className="flex items-start gap-2">
            <span className="text-brand-gold mt-0.5">&#9679;</span>
            <span><strong>Trips:</strong> Click any trip to edit details, itinerary, and photos. Drag photos to reorder them.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-gold mt-0.5">&#9679;</span>
            <span><strong>Photo Shapes:</strong> Use the shape buttons below each photo to choose how it displays (landscape, portrait, square, wide, tall, or circle).</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-gold mt-0.5">&#9679;</span>
            <span><strong>Gallery:</strong> The Photo Gallery page manages standalone photos that appear on your public gallery page, separate from trip photos.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-gold mt-0.5">&#9679;</span>
            <span><strong>Featured:</strong> Toggle the &quot;Featured&quot; switch on a trip to show it on your homepage.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
