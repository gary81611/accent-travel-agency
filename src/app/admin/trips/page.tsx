"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Trip = {
  id: string;
  title: string;
  slug: string;
  destination: string;
  dates: string | null;
  featured: boolean;
};

export default function AdminTripsPage() {
  const supabase = createClient();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    const { data } = await supabase
      .from("trips")
      .select("id, title, slug, destination, dates, featured")
      .neq("slug", "gallery")
      .order("created_at", { ascending: false });
    setTrips((data as Trip[]) || []);
    setLoading(false);
  }

  async function deleteTrip(id: string, title: string) {
    if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

    await supabase.from("trips").delete().eq("id", id);
    setTrips(trips.filter((t) => t.id !== id));
  }

  if (loading) {
    return <p className="text-gray-500 py-8">Loading trips...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-brand-teal uppercase">
          Manage Trips
        </h1>
        <Link
          href="/admin/trips/new"
          className="bg-brand-gold text-white px-6 py-2 rounded-md font-[family-name:var(--font-heading)] font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors"
        >
          + Add a New Trip
        </Link>
      </div>

      {trips.length === 0 ? (
        <p className="text-gray-500 py-8">No trips yet. Add your first trip!</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Trip</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Dates</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Featured</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-brand-charcoal">{trip.title}</p>
                    <p className="text-sm text-gray-500">{trip.destination}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                    {trip.dates || "—"}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {trip.featured ? (
                      <span className="bg-brand-gold/10 text-brand-gold text-xs px-2 py-1 rounded-full font-semibold">
                        Featured
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/trips/${trip.id}`}
                      className="text-brand-gold hover:underline text-sm font-semibold mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteTrip(trip.id, trip.title)}
                      className="text-red-400 hover:text-red-600 text-sm font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
