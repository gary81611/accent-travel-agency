"use client";

import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type ImageSetting = { id: string; key: string; value: string };

const IMAGE_GROUPS = [
  {
    title: "Page Heroes",
    description: "Large banner images at the top of each page. Best at 1920px wide or larger.",
    items: [
      { key: "image_hero_home", label: "Home Page Hero", hint: "Full-screen background behind the headline" },
      { key: "image_hero_home_cta", label: "Home Page CTA Background", hint: "Background for the \"Ready for Your Next Adventure?\" section" },
      { key: "image_hero_trips", label: "Trips Page Hero", hint: "Banner at the top of the Group Tours page" },
      { key: "image_hero_gallery", label: "Gallery Page Hero", hint: "Banner at the top of the Photo Gallery page" },
      { key: "image_hero_about", label: "About Page Hero", hint: "Banner at the top of the About page" },
      { key: "image_hero_contact", label: "Contact Page Hero", hint: "Banner at the top of the Contact page" },
      { key: "image_hero_travel_info", label: "Travel Info Page Hero", hint: "Banner at the top of the Travel Info page" },
    ],
  },
  {
    title: "About Page Photos",
    description: "Images that appear next to each section on the About page.",
    items: [
      { key: "image_about_bus", label: "Section 1 — Bus Photo", hint: "\"Family and Locally Owned Since 1981\" (portrait orientation)" },
      { key: "image_about_2", label: "Section 2", hint: "\"Tell Us Where You Want to Go\"" },
      { key: "image_about_3", label: "Section 3", hint: "\"How Do You Want to Travel?\"" },
      { key: "image_about_4", label: "Section 4", hint: "\"If You Can Dream It, Our Team Can Plan It\"" },
    ],
  },
  {
    title: "Branding",
    description: "Logo and brand images used across the site.",
    items: [
      { key: "image_logo", label: "Logo", hint: "Ornamental frame shown in the header on every page" },
    ],
  },
];

export default function AdminImagesPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<ImageSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const loadSettings = useCallback(async () => {
    const { data } = await supabase.from("settings").select().like("key", "image_%");
    setSettings((data || []) as ImageSetting[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  function getValue(key: string): string {
    return settings.find((s) => s.key === key)?.value || "";
  }

  async function savePosition(key: string, position: string) {
    const posKey = `${key}_pos`;
    setSaving(key);

    const existing = settings.find((s) => s.key === posKey);
    if (existing) {
      await supabase.from("settings").update({ value: position }).eq("id", existing.id);
    } else {
      await supabase.from("settings").insert({ key: posKey, value: position });
    }

    flash("ok", "Position saved!");
    setSaving(null);
    loadSettings();
  }

  async function handleUpload(key: string, file: File) {
    setUploading(key);

    let folder = "heroes";
    if (key.startsWith("image_about")) folder = "about";
    if (key === "image_logo") folder = "branding";

    const ext = file.name.split(".").pop();
    const filename = `${key.replace("image_", "")}-${Date.now()}.${ext}`;
    const storagePath = `${folder}/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(storagePath, file, { upsert: true });

    if (uploadError) {
      flash("err", `Upload failed: ${uploadError.message}`);
      setUploading(null);
      return;
    }

    const existing = settings.find((s) => s.key === key);
    if (existing) {
      await supabase.from("settings").update({ value: storagePath }).eq("id", existing.id);
    } else {
      await supabase.from("settings").insert({ key, value: storagePath });
    }

    flash("ok", "Image updated!");
    setUploading(null);
    loadSettings();
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-8">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold flex items-center gap-2 ${
          toast.type === "ok" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.type === "ok" ? "\u2713" : "\u2717"} {toast.text}
        </div>
      )}

      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-brand-teal uppercase tracking-wide">
          Site Images
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Change any image on your website. Click a photo to upload a replacement. Use the slider to reposition.
        </p>
      </div>

      {IMAGE_GROUPS.map((group) => (
        <div key={group.title} className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-brand-charcoal uppercase tracking-wide mb-1">
            {group.title}
          </h2>
          <p className="text-sm text-gray-400 mb-5">{group.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {group.items.map((item) => (
              <ImageCard
                key={item.key}
                imageKey={item.key}
                label={item.label}
                hint={item.hint}
                storagePath={getValue(item.key)}
                position={getValue(`${item.key}_pos`) || "center center"}
                uploading={uploading === item.key}
                saving={saving === item.key}
                onUpload={(file) => handleUpload(item.key, file)}
                onSavePosition={(pos) => savePosition(item.key, pos)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ImageCard({
  imageKey,
  label,
  hint,
  storagePath,
  position,
  uploading,
  saving,
  onUpload,
  onSavePosition,
}: {
  imageKey: string;
  label: string;
  hint: string;
  storagePath: string;
  position: string;
  uploading: boolean;
  saving: boolean;
  onUpload: (file: File) => void;
  onSavePosition: (pos: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [repositioning, setRepositioning] = useState(false);
  // Parse the vertical % from position string like "center 30%"
  const initialY = (() => {
    const match = position.match(/(\d+)%/);
    // If there's a second value (vertical), use it; otherwise default 50
    const parts = position.split(/\s+/);
    if (parts.length >= 2) {
      const yMatch = parts[1].match(/(\d+)/);
      if (yMatch) return parseInt(yMatch[1]);
    }
    if (match) return parseInt(match[1]);
    return 50;
  })();
  const [yPos, setYPos] = useState(initialY);

  // Sync when position prop changes
  useEffect(() => {
    const parts = position.split(/\s+/);
    if (parts.length >= 2) {
      const yMatch = parts[1].match(/(\d+)/);
      if (yMatch) { setYPos(parseInt(yMatch[1])); return; }
    }
    const match = position.match(/(\d+)/);
    if (match) setYPos(parseInt(match[1]));
    else setYPos(50);
  }, [position]);

  function handleSave() {
    onSavePosition(`center ${yPos}%`);
    setRepositioning(false);
  }

  return (
    <div>
      <div className="relative aspect-[16/10] rounded-xl overflow-hidden border-2 border-gray-100 group">
        {/* Clickable area for upload */}
        <div
          onClick={() => !uploading && !repositioning && inputRef.current?.click()}
          className={`absolute inset-0 z-10 ${repositioning ? "pointer-events-none" : "cursor-pointer"}`}
        >
          {/* Hover overlay — only when not repositioning */}
          {!repositioning && (
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                {uploading ? (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm font-semibold">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm font-semibold">Click to Replace</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {storagePath ? (
          <Image
            src={getImageUrl(storagePath)}
            alt={label}
            fill
            className="object-cover"
            style={{ objectPosition: `center ${yPos}%` }}
            sizes="300px"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Repositioning slider overlay */}
        {repositioning && storagePath && (
          <div className="absolute inset-0 z-20 bg-black/30 flex items-center">
            {/* Vertical slider on right side */}
            <div className="absolute right-3 top-3 bottom-3 flex flex-col items-center">
              <span className="text-[9px] text-white font-bold mb-1">TOP</span>
              <input
                type="range"
                min={0}
                max={100}
                value={yPos}
                onChange={(e) => setYPos(parseInt(e.target.value))}
                className="flex-1 accent-brand-gold"
                style={{
                  writingMode: "vertical-lr",
                  direction: "rtl",
                  width: "20px",
                }}
              />
              <span className="text-[9px] text-white font-bold mt-1">BTM</span>
            </div>
            {/* Horizontal guide line showing current position */}
            <div
              className="absolute left-0 right-10 h-px bg-brand-gold"
              style={{ top: `${yPos}%` }}
            />
            {/* Save / Cancel buttons */}
            <div className="absolute bottom-2 left-2 flex gap-2 z-30">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-600 transition-colors"
              >
                {saving ? "Saving..." : "Save Position"}
              </button>
              <button
                onClick={() => {
                  setYPos(initialY);
                  setRepositioning(false);
                }}
                className="bg-white/80 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-2 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-brand-charcoal">{label}</p>
          <p className="text-[11px] text-gray-400">{hint}</p>
        </div>
        {storagePath && !repositioning && (
          <button
            onClick={() => setRepositioning(true)}
            className="shrink-0 ml-2 mt-0.5 text-[11px] text-brand-gold hover:text-brand-gold-light font-semibold flex items-center gap-1 transition-colors"
            title="Adjust photo position"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            Reposition
          </button>
        )}
      </div>
    </div>
  );
}
