import Image from "next/image";
import Link from "next/link";
import { getImageUrl } from "@/lib/supabase/storage";

type Props = {
  trip: {
    slug: string;
    title: string;
    destination: string;
    dates: string | null;
    price: string | null;
    featured: boolean;
    status?: string | null;
    status_note?: string | null;
    duration?: string | null;
  };
  photo?: { storage_path: string } | null;
  priority?: boolean;
};

export default function TripCard({ trip, photo, priority = false }: Props) {
  const isSoldOut = trip.status === "sold_out";
  const isLimited = trip.status === "limited";

  return (
    <Link
      href={`/trips/${trip.slug}`}
      className="group block bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
    >
      <div className="relative h-56 bg-brand-lightgray overflow-hidden">
        {photo ? (
          <Image
            src={getImageUrl(photo.storage_path)}
            alt={trip.title}
            fill
            priority={priority}
            className={`object-cover group-hover:scale-105 transition-transform duration-500 ${isSoldOut ? "grayscale-[30%]" : ""}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" />
            </svg>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {trip.featured && (
            <span className="bg-brand-gold text-white text-xs font-bold px-2 py-1 rounded font-[family-name:var(--font-heading)] uppercase tracking-wider">
              Featured
            </span>
          )}
          {isSoldOut && (
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded font-[family-name:var(--font-heading)] uppercase tracking-wider">
              Sold Out
            </span>
          )}
          {isLimited && (
            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded font-[family-name:var(--font-heading)] uppercase tracking-wider">
              Limited Availability
            </span>
          )}
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-brand-teal group-hover:text-brand-gold transition-colors leading-tight">
          {trip.title}
        </h3>
        <p className="text-sm text-gray-500 mt-1">{trip.destination}</p>
        {trip.dates && (
          <p className="text-sm text-brand-charcoal mt-2">{trip.dates}</p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {trip.price && (
            <p className="text-sm font-bold text-brand-gold">{trip.price}</p>
          )}
          {trip.duration && (
            <p className="text-sm text-gray-500">{trip.duration}</p>
          )}
        </div>
        {isSoldOut && trip.status_note && (
          <p className="text-xs text-red-600 mt-1 italic">{trip.status_note}</p>
        )}
        {isLimited && trip.status_note && (
          <p className="text-xs text-orange-600 mt-1 font-semibold">{trip.status_note}</p>
        )}
        <span className="inline-block mt-3 text-sm font-[family-name:var(--font-heading)] text-brand-gold uppercase tracking-wide group-hover:underline">
          View Details →
        </span>
      </div>
    </Link>
  );
}
