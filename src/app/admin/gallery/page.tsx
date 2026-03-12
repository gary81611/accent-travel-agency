"use client";

import { createClient } from "@/lib/supabase/client";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type Photo = {
  id: string; trip_id: string; storage_path: string;
  caption: string | null; display_order: number; display_shape: string;
};
type TripOption = { id: string; title: string; slug: string };

const SHAPES = [
  { value: "landscape", label: "Landscape", icon: "▬" },
  { value: "portrait", label: "Portrait", icon: "▮" },
  { value: "square", label: "Square", icon: "■" },
  { value: "wide", label: "Wide", icon: "━" },
  { value: "tall", label: "Tall", icon: "┃" },
  { value: "circle", label: "Circle", icon: "●" },
];

function shapeClass(shape: string) {
  const map: Record<string, string> = {
    landscape: "aspect-[4/3]", portrait: "aspect-[3/4]", square: "aspect-square",
    wide: "aspect-[16/9]", tall: "aspect-[2/3]", circle: "aspect-square rounded-full",
  };
  return map[shape] || "aspect-[4/3]";
}

export default function AdminGalleryPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [allTrips, setAllTrips] = useState<TripOption[]>([]);
  const [galleryTripId, setGalleryTripId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [moveTarget, setMoveTarget] = useState("");
  const [dragOverZone, setDragOverZone] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    // Find or create gallery virtual trip
    let { data: gallery } = await supabase
      .from("trips").select("id").eq("slug", "gallery").single();

    if (!gallery) {
      const { data: created } = await supabase.from("trips").insert({
        title: "Photo Gallery", slug: "gallery", destination: "Gallery",
        description: "Standalone gallery photos", featured: false,
      }).select("id").single();
      gallery = created;
    }

    if (gallery) {
      setGalleryTripId(gallery.id);
      const { data: photoData } = await supabase
        .from("photos").select().eq("trip_id", gallery.id).order("display_order");
      setPhotos((photoData || []) as Photo[]);
    }

    const { data: trips } = await supabase
      .from("trips").select("id, title, slug").neq("slug", "gallery").order("title");
    setAllTrips((trips || []) as TripOption[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleFiles(files: FileList) {
    if (!galleryTripId) return;
    setUploading(true);
    let order = photos.length;
    let done = 0;

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `gallery/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("photos").upload(path, file, { upsert: true });
      if (!error) {
        await supabase.from("photos").insert({
          trip_id: galleryTripId, storage_path: path, caption: null,
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
    const count = selectedPhotos.size;
    await Promise.all(
      [...selectedPhotos].map((pid) =>
        supabase.from("photos").update({ trip_id: moveTarget }).eq("id", pid)
      )
    );
    setPhotos(photos.filter((p) => !selectedPhotos.has(p.id)));
    setSelectedPhotos(new Set());
    setMoveTarget("");
    flash("ok", `Moved ${count} photo(s) to trip.`);
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

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading gallery...</div>;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-xl text-white text-sm font-semibold flex items-center gap-2 ${
          toast.type === "ok" ? "bg-emerald-500" : "bg-red-500"
        }`}>
          {toast.type === "ok" ? "✓" : "✗"} {toast.text}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-brand-teal uppercase tracking-wide">
          Photo Gallery
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Manage standalone gallery photos that appear on the public Gallery page. These are separate from trip-specific photos.
        </p>
      </div>

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
          <span className="text-xs text-gray-300">{photos.length} photo{photos.length !== 1 ? "s" : ""}</span>
          {selectedPhotos.size > 0 && (
            <>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-brand-gold font-semibold">{selectedPhotos.size} selected</span>

              <div className="flex items-center gap-1.5 ml-auto">
                <select value={moveTarget} onChange={(e) => setMoveTarget(e.target.value)}
                  className="text-xs border rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-brand-gold focus:outline-none">
                  <option value="">Move to trip...</option>
                  {allTrips.map((t) => (
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
          <p className="font-semibold text-lg">No gallery photos yet</p>
          <p className="text-sm mt-1">Drag and drop photos above to get started</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onPhotoDrag}>
          <Droppable droppableId="gallery-photos" direction="horizontal">
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

                        <div className="relative">
                          <div className={`relative overflow-hidden ${shapeClass(photo.display_shape)}`}>
                            <Image src={getImageUrl(photo.storage_path)} alt={photo.caption || ""} fill
                              className="object-cover" sizes="250px" />
                          </div>

                          <button onClick={() => toggleSelect(photo.id)}
                            className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                              selectedPhotos.has(photo.id)
                                ? "bg-brand-gold border-brand-gold text-white"
                                : "border-white/80 bg-black/20 text-transparent hover:border-white hover:bg-black/40"
                            }`}>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                          </button>

                          <div {...p.dragHandleProps}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                            title="Drag to reorder">
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" /></svg>
                          </div>

                          <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            #{i + 1}
                          </div>
                        </div>

                        <div className="p-2.5 space-y-2">
                          <input type="text" placeholder="Add a caption..."
                            value={photo.caption || ""}
                            onChange={(e) => updatePhoto(photo.id, { caption: e.target.value || null })}
                            className="w-full text-xs px-2 py-1.5 border border-gray-100 rounded-lg focus:ring-1 focus:ring-brand-gold focus:border-brand-gold focus:outline-none placeholder-gray-300" />

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
  );
}
