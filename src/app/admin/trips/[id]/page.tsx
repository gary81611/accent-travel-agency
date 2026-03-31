"use client";

import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type Trip = {
  id: string; title: string; slug: string; destination: string;
  description: string; dates: string | null; price: string | null; featured: boolean;
  brochure_url: string | null; status: string | null; status_note: string | null;
  meals: string | null; duration: string | null;
};
type ItinDay = {
  id: string; trip_id: string; day_number: number; title: string; description: string;
};
type Photo = {
  id: string; trip_id: string; storage_path: string;
  caption: string | null; display_order: number; display_shape: string;
};
type TripOption = { id: string; title: string; slug: string };

const SHAPES = [
  { value: "landscape", label: "Landscape", icon: "▬", aspect: "aspect-[4/3]" },
  { value: "portrait", label: "Portrait", icon: "▮", aspect: "aspect-[3/4]" },
  { value: "square", label: "Square", icon: "■", aspect: "aspect-square" },
  { value: "wide", label: "Wide", icon: "━", aspect: "aspect-[16/9]" },
  { value: "tall", label: "Tall", icon: "┃", aspect: "aspect-[2/3]" },
  { value: "circle", label: "Circle", icon: "●", aspect: "aspect-square rounded-full" },
];

function shapeClass(shape: string) {
  return SHAPES.find((s) => s.value === shape)?.aspect || "aspect-[4/3]";
}

export default function EditTripPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [itinerary, setItinerary] = useState<ItinDay[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [allTrips, setAllTrips] = useState<TripOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "itinerary" | "photos">("details");
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [moveTarget, setMoveTarget] = useState<string>("");
  const [dragOverZone, setDragOverZone] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const brochureInputRef = useRef<HTMLInputElement>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    const [tripRes, itinRes, photoRes, tripsRes] = await Promise.all([
      supabase.from("trips").select().eq("id", id).single(),
      supabase.from("itineraries").select().eq("trip_id", id).order("day_number"),
      supabase.from("photos").select().eq("trip_id", id).order("display_order"),
      supabase.from("trips").select("id, title, slug").neq("slug", "gallery").order("title"),
    ]);
    setTrip(tripRes.data as Trip);
    setItinerary((itinRes.data || []) as ItinDay[]);
    setPhotos((photoRes.data || []) as Photo[]);
    setAllTrips((tripsRes.data || []) as TripOption[]);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── TRIP DETAILS ──────────────────────────────────────────
  async function saveTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!trip) return;
    setSaving(true);
    const { error } = await supabase.from("trips").update({
      title: trip.title, destination: trip.destination, description: trip.description,
      dates: trip.dates, price: trip.price, featured: trip.featured,
      brochure_url: trip.brochure_url, status: trip.status, status_note: trip.status_note,
      meals: trip.meals, duration: trip.duration,
    }).eq("id", trip.id);
    setSaving(false);
    flash(error ? "err" : "ok", error ? error.message : "Trip saved!");
  }

  // ── ITINERARY ─────────────────────────────────────────────
  function addDay() {
    setItinerary([...itinerary, {
      id: `new-${Date.now()}`, trip_id: id,
      day_number: itinerary.length + 1, title: "", description: "",
    }]);
  }
  function updateDay(i: number, field: string, val: string) {
    const u = [...itinerary];
    (u[i] as Record<string, unknown>)[field] = val;
    setItinerary(u);
  }
  function removeDay(i: number) {
    if (!confirm(`Delete Day ${itinerary[i].day_number}?`)) return;
    const day = itinerary[i];
    if (!day.id.startsWith("new-")) supabase.from("itineraries").delete().eq("id", day.id).then();
    const u = itinerary.filter((_, j) => j !== i);
    u.forEach((d, j) => (d.day_number = j + 1));
    setItinerary(u);
  }
  function onItinDrag(r: DropResult) {
    if (!r.destination) return;
    const items = [...itinerary];
    const [m] = items.splice(r.source.index, 1);
    items.splice(r.destination.index, 0, m);
    items.forEach((d, i) => (d.day_number = i + 1));
    setItinerary(items);
  }
  async function saveItinerary() {
    setSaving(true);
    // Insert new rows first, then delete removed ones (safe — no data loss on insert failure)
    const rows = itinerary.map((d) => ({
      trip_id: id, day_number: d.day_number, title: d.title, description: d.description,
    }));
    if (rows.length > 0) {
      const { error } = await supabase.from("itineraries").upsert(rows, { onConflict: "trip_id,day_number" });
      if (error) { flash("err", error.message); setSaving(false); return; }
    }
    // Delete day numbers no longer in the current set
    const currentDays = itinerary.map((d) => d.day_number);
    if (currentDays.length > 0) {
      await supabase.from("itineraries").delete().eq("trip_id", id).not("day_number", "in", `(${currentDays.join(",")})`);
    } else {
      await supabase.from("itineraries").delete().eq("trip_id", id);
    }
    flash("ok", "Itinerary saved!");
    setSaving(false);
    loadData();
  }

  // ── PHOTOS ────────────────────────────────────────────────
  async function handleFiles(files: FileList) {
    setUploading(true);
    const slug = trip?.slug || id;
    let order = photos.length;
    let done = 0;

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
      if (!error) {
        await supabase.from("photos").insert({
          trip_id: id, storage_path: path, caption: null,
          display_order: order++, display_shape: "landscape",
        });
      }
      done++;
      setUploadProgress(Math.round((done / files.length) * 100));
    }
    setUploading(false);
    setUploadProgress(0);
    flash("ok", `${files.length} photo(s) uploaded!`);
    loadData();
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOverZone(false);
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files);
  }

  function onPhotoDrag(r: DropResult) {
    if (!r.destination) return;
    const items = [...photos];
    const [m] = items.splice(r.source.index, 1);
    items.splice(r.destination.index, 0, m);
    items.forEach((p, i) => (p.display_order = i));
    setPhotos(items);
    Promise.all(items.map((p) => supabase.from("photos").update({ display_order: p.display_order }).eq("id", p.id)));
  }

  async function updatePhoto(photoId: string, updates: Partial<Photo>) {
    await supabase.from("photos").update(updates).eq("id", photoId);
    setPhotos(photos.map((p) => (p.id === photoId ? { ...p, ...updates } : p)));
  }

  async function deleteSelected() {
    if (selectedPhotos.size === 0) return;
    if (!confirm(`Delete ${selectedPhotos.size} photo(s)? This cannot be undone.`)) return;
    const toDelete = photos.filter((p) => selectedPhotos.has(p.id));
    await Promise.all(toDelete.map((p) => supabase.storage.from("photos").remove([p.storage_path])));
    await Promise.all(toDelete.map((p) => supabase.from("photos").delete().eq("id", p.id)));
    setPhotos(photos.filter((p) => !selectedPhotos.has(p.id)));
    setSelectedPhotos(new Set());
    flash("ok", `${toDelete.length} photo(s) deleted.`);
  }

  async function moveSelected() {
    if (selectedPhotos.size === 0 || !moveTarget) return;
    await Promise.all(
      [...selectedPhotos].map((pid) =>
        supabase.from("photos").update({ trip_id: moveTarget }).eq("id", pid)
      )
    );
    setPhotos(photos.filter((p) => !selectedPhotos.has(p.id)));
    setSelectedPhotos(new Set());
    setMoveTarget("");
    flash("ok", `Moved ${selectedPhotos.size} photo(s) to another trip.`);
  }

  function toggleSelect(pid: string) {
    const s = new Set(selectedPhotos);
    s.has(pid) ? s.delete(pid) : s.add(pid);
    setSelectedPhotos(s);
  }
  function selectAll() {
    if (selectedPhotos.size === photos.length) setSelectedPhotos(new Set());
    else setSelectedPhotos(new Set(photos.map((p) => p.id)));
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading trip...</div>;
  if (!trip) return <div className="text-red-500 py-20 text-center">Trip not found.</div>;

  const tabs = [
    { key: "details" as const, label: "Trip Details", count: null },
    { key: "itinerary" as const, label: "Itinerary", count: itinerary.length },
    { key: "photos" as const, label: "Photos", count: photos.length },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold flex items-center gap-2 animate-[fadeIn_0.2s] ${
          toast.type === "ok" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.type === "ok" ? "✓" : "✗"} {toast.text}
        </div>
      )}

      {/* Header */}
      <div>
        <button onClick={() => router.push("/admin/trips")} className="text-sm text-gray-400 hover:text-brand-gold mb-2 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Trips
        </button>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-brand-teal uppercase tracking-wide">
          {trip.title}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">{trip.destination} {trip.dates ? `· ${trip.dates}` : ""}</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.key
                ? "bg-brand-teal text-white shadow-sm"
                : "text-gray-500 hover:text-brand-charcoal hover:bg-gray-50"
            }`}
          >
            {t.label}
            {t.count !== null && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? "bg-white/20" : "bg-gray-100"
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ════════ DETAILS TAB ════════════════════════════════ */}
      {activeTab === "details" && (
        <form onSubmit={saveTrip} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Trip Title" required>
              <input type="text" value={trip.title} onChange={(e) => setTrip({ ...trip, title: e.target.value })} className="field" />
            </Field>
            <Field label="Destination" required>
              <input type="text" value={trip.destination} onChange={(e) => setTrip({ ...trip, destination: e.target.value })} className="field" />
            </Field>
            <Field label="Travel Dates" hint="e.g. January 22 - February 5, 2027">
              <input type="text" value={trip.dates || ""} onChange={(e) => setTrip({ ...trip, dates: e.target.value })} className="field" />
            </Field>
            <Field label="Price" hint="e.g. $5,195.00/person">
              <input type="text" value={trip.price || ""} onChange={(e) => setTrip({ ...trip, price: e.target.value })} className="field" />
            </Field>
            <Field label="Duration" hint="e.g. 15 days">
              <input type="text" value={trip.duration || ""} onChange={(e) => setTrip({ ...trip, duration: e.target.value })} className="field" />
            </Field>
            <Field label="Meals Included" hint="e.g. 13 breakfasts, 6 lunches, 10 dinners">
              <input type="text" value={trip.meals || ""} onChange={(e) => setTrip({ ...trip, meals: e.target.value })} className="field" />
            </Field>
            <Field label="Status">
              <select value={trip.status || "active"} onChange={(e) => setTrip({ ...trip, status: e.target.value })} className="field">
                <option value="active">Active</option>
                <option value="sold_out">Sold Out</option>
                <option value="limited">Limited Availability</option>
              </select>
            </Field>
            <Field label="Status Note" hint="e.g. 4 Seats now available!">
              <input type="text" value={trip.status_note || ""} onChange={(e) => setTrip({ ...trip, status_note: e.target.value })} className="field" />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={8} value={trip.description} onChange={(e) => setTrip({ ...trip, description: e.target.value })} className="field resize-y" />
          </Field>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className={`w-11 h-6 rounded-full transition-colors relative ${trip.featured ? "bg-brand-gold" : "bg-gray-200"}`}>
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${trip.featured ? "translate-x-[22px]" : "translate-x-0.5"}`} />
            </div>
            <input type="checkbox" checked={trip.featured} onChange={(e) => setTrip({ ...trip, featured: e.target.checked })} className="sr-only" />
            <span className="text-sm font-semibold text-brand-charcoal">Show on homepage as featured trip</span>
          </label>

          {/* Brochure / Document upload */}
          <div className="border-t pt-5">
            <label className="block text-sm font-semibold text-brand-charcoal mb-2">
              Trip Brochure / Detailed Itinerary
            </label>
            <p className="text-[11px] text-gray-400 mb-3">
              Upload a PDF or document with the full trip details. A &quot;Click Here For More Information&quot; button will appear on the trip page.
            </p>
            {trip.brochure_url ? (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <svg className="w-8 h-8 text-brand-gold shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-charcoal truncate">Brochure attached</p>
                  <a href={trip.brochure_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-gold hover:underline">View document</a>
                </div>
                <button type="button" onClick={() => setTrip({ ...trip, brochure_url: null })} className="text-xs text-red-400 hover:text-red-600 font-semibold">Remove</button>
                <button type="button" onClick={() => brochureInputRef.current?.click()} className="btn-secondary text-xs">Replace</button>
              </div>
            ) : (
              <button type="button" onClick={() => brochureInputRef.current?.click()} disabled={uploadingBrochure}
                className="btn-secondary flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {uploadingBrochure ? "Uploading..." : "Upload Brochure (PDF)"}
              </button>
            )}
            <input ref={brochureInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploadingBrochure(true);
                const ext = file.name.split(".").pop();
                const path = `brochures/${trip.slug}-${Date.now()}.${ext}`;
                const { error } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
                if (error) { flash("err", error.message); }
                else {
                  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photos/${path}`;
                  setTrip({ ...trip, brochure_url: url });
                  flash("ok", "Brochure uploaded! Click Save to apply.");
                }
                setUploadingBrochure(false);
                e.target.value = "";
              }}
            />
          </div>

          <SaveButton saving={saving} />
        </form>
      )}

      {/* ════════ ITINERARY TAB ══════════════════════════════ */}
      {activeTab === "itinerary" && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">Drag days to reorder. Changes are saved when you click Save.</p>
            <button onClick={addDay} className="btn-secondary text-sm">+ Add Day</button>
          </div>

          {itinerary.length === 0 ? (
            <div className="text-center py-12 text-gray-300">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="font-semibold">No itinerary days yet</p>
              <p className="text-sm mt-1">Click &quot;Add Day&quot; to start building the itinerary</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onItinDrag}>
              <Droppable droppableId="itin">
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.droppableProps} className="space-y-2">
                    {itinerary.map((day, i) => (
                      <Draggable key={day.id} draggableId={day.id} index={i}>
                        {(p, snap) => (
                          <div ref={p.innerRef} {...p.draggableProps}
                            className={`border rounded-xl p-4 transition-shadow ${snap.isDragging ? "shadow-lg bg-white ring-2 ring-brand-gold/30" : "bg-gray-50 hover:bg-white"}`}>
                            <div className="flex items-start gap-3">
                              <div {...p.dragHandleProps} className="mt-2 cursor-grab active:cursor-grabbing text-gray-300 hover:text-brand-gold transition-colors" title="Drag to reorder">
                                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" /></svg>
                              </div>
                              <div className="bg-brand-gold text-white text-xs font-bold w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1">
                                {day.day_number}
                              </div>
                              <div className="flex-1 space-y-2">
                                <input type="text" placeholder="Day title (e.g. Arrive in Buenos Aires)" value={day.title}
                                  onChange={(e) => updateDay(i, "title", e.target.value)}
                                  className="field text-sm font-semibold" />
                                <textarea placeholder="What happens this day..." rows={2} value={day.description}
                                  onChange={(e) => updateDay(i, "description", e.target.value)}
                                  className="field text-sm resize-y" />
                              </div>
                              <button onClick={() => removeDay(i)} className="mt-2 text-gray-300 hover:text-red-500 transition-colors" title="Delete day">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {itinerary.length > 0 && (
            <div className="flex gap-3 pt-2">
              <SaveButton saving={saving} onClick={saveItinerary} />
              <button onClick={addDay} className="btn-secondary">+ Add Another Day</button>
            </div>
          )}
        </div>
      )}

      {/* ════════ PHOTOS TAB ═════════════════════════════════ */}
      {activeTab === "photos" && (
        <div className="space-y-4">
          {/* Upload zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOverZone(true); }}
            onDragLeave={() => setDragOverZone(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white rounded-xl shadow-sm border-2 border-dashed cursor-pointer transition-all text-center py-10 px-6 ${
              dragOverZone ? "border-brand-gold bg-brand-gold-pale/30 scale-[1.01]" : "border-gray-200 hover:border-brand-gold/50 hover:bg-gray-50"
            }`}
          >
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} className="hidden" />
            {uploading ? (
              <div>
                <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-brand-gold rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-sm text-gray-500 mt-3">Uploading... {uploadProgress}%</p>
              </div>
            ) : (
              <>
                <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                <p className="font-semibold text-brand-charcoal">Drop photos here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP &middot; Multiple files OK</p>
              </>
            )}
          </div>

          {/* Bulk actions toolbar */}
          {photos.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
              <button onClick={selectAll} className="text-xs font-semibold text-gray-500 hover:text-brand-gold transition-colors">
                {selectedPhotos.size === photos.length ? "Deselect All" : "Select All"}
              </button>
              {selectedPhotos.size > 0 && (
                <>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-brand-gold font-semibold">{selectedPhotos.size} selected</span>

                  {/* Move to trip */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <select value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}
                      className="text-xs border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-brand-gold focus:outline-none">
                      <option value="">Move to trip...</option>
                      {allTrips.filter((t) => t.id !== id).map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                    </select>
                    <button onClick={moveSelected} disabled={!moveTarget}
                      className="text-xs font-semibold text-brand-teal hover:text-brand-gold disabled:text-gray-300 transition-colors">
                      Move
                    </button>
                  </div>

                  <button onClick={deleteSelected} className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors">
                    Delete Selected
                  </button>
                </>
              )}
            </div>
          )}

          {/* Photo grid */}
          {photos.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm text-center py-16 text-gray-300">
              <svg className="w-16 h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <p className="font-semibold text-lg">No photos yet</p>
              <p className="text-sm mt-1">Drag and drop photos above to get started</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={onPhotoDrag}>
              <Droppable droppableId="photos" direction="horizontal">
                {(prov) => (
                  <div ref={prov.innerRef} {...prov.droppableProps}
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo, i) => (
                      <Draggable key={photo.id} draggableId={photo.id} index={i}>
                        {(p, snap) => (
                          <div ref={p.innerRef} {...p.draggableProps}
                            className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all group ${
                              snap.isDragging ? "shadow-xl ring-2 ring-brand-gold/40 rotate-2 scale-105" : ""
                            } ${selectedPhotos.has(photo.id) ? "ring-2 ring-brand-gold" : ""}`}>

                            {/* Image + selection overlay */}
                            <div className="relative">
                              <div className={`relative overflow-hidden ${shapeClass(photo.display_shape)}`}>
                                <Image src={getImageUrl(photo.storage_path)} alt={photo.caption || ""} fill
                                  className="object-cover" sizes="250px" />
                              </div>

                              {/* Select checkbox */}
                              <button onClick={() => toggleSelect(photo.id)}
                                className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                  selectedPhotos.has(photo.id)
                                    ? "bg-brand-gold border-brand-gold text-white"
                                    : "border-white/80 bg-black/20 text-transparent hover:border-white hover:bg-black/40"
                                }`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              </button>

                              {/* Drag handle */}
                              <div {...p.dragHandleProps}
                                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                                title="Drag to reorder">
                                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" /></svg>
                              </div>

                              {/* Order badge */}
                              <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                #{i + 1}
                              </div>
                            </div>

                            {/* Controls below image */}
                            <div className="p-2.5 space-y-2">
                              {/* Caption */}
                              <input type="text" placeholder="Add a caption..."
                                value={photo.caption || ""}
                                onChange={(e) => updatePhoto(photo.id, { caption: e.target.value || null })}
                                className="w-full text-xs px-2 py-1.5 border border-gray-100 rounded-lg focus:ring-1 focus:ring-brand-gold focus:border-brand-gold focus:outline-none placeholder-gray-300" />

                              {/* Shape selector */}
                              <div className="flex gap-1">
                                {SHAPES.map((s) => (
                                  <button key={s.value} title={s.label}
                                    onClick={() => updatePhoto(photo.id, { display_shape: s.value })}
                                    className={`flex-1 text-center text-[11px] py-1 rounded transition-colors ${
                                      photo.display_shape === s.value
                                        ? "bg-brand-gold text-white font-bold"
                                        : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    }`}>
                                    {s.icon}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {prov.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      )}
    </div>
  );
}

// ── Shared subcomponents ────────────────────────────────────
function Field({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-charcoal mb-1">
        {label} {required && <span className="text-brand-gold">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick?: () => void }) {
  return (
    <button type={onClick ? "button" : "submit"} onClick={onClick} disabled={saving}
      className="bg-brand-gold text-white px-8 py-3 rounded-xl font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors disabled:opacity-50 shadow-sm hover:shadow-md">
      {saving ? "Saving..." : "Save Changes"}
    </button>
  );
}
