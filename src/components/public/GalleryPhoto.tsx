"use client";

import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/lib/supabase/storage";

type Props = {
  storage_path: string;
  caption: string | null;
  display_shape: string;
  isCircle: boolean;
  shapeClass: string;
};

export default function GalleryPhoto({ storage_path, caption, isCircle, shapeClass }: Props) {
  const [broken, setBroken] = useState(false);

  if (broken) return null;

  return (
    <>
      <div className={`relative ${shapeClass}`}>
        <Image
          src={getImageUrl(storage_path)}
          alt={caption || "Travel photo"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={() => setBroken(true)}
        />
      </div>
      {caption && !isCircle && (
        <p className="px-3 py-2 text-sm text-brand-charcoal">{caption}</p>
      )}
    </>
  );
}
