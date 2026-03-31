"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewTripPage() {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    destination: "",
    description: "",
    dates: "",
    price: "",
    featured: false,
  });

  function toSlug(title: string) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    let slug = toSlug(form.title);

    // Check for slug conflicts and add suffix if needed
    const { data: existing } = await supabase.from("trips").select("id").eq("slug", slug).single();
    if (existing) {
      let suffix = 2;
      while (true) {
        const candidate = `${slug}-${suffix}`;
        const { data: dup } = await supabase.from("trips").select("id").eq("slug", candidate).single();
        if (!dup) { slug = candidate; break; }
        suffix++;
      }
    }

    const { data, error: err } = await supabase
      .from("trips")
      .insert({
        title: form.title,
        slug,
        destination: form.destination,
        description: form.description,
        dates: form.dates || null,
        price: form.price || null,
        featured: form.featured,
      })
      .select("id")
      .single();

    if (err) {
      setError(err.message);
      setSaving(false);
    } else {
      router.push(`/admin/trips/${data.id}`);
    }
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-brand-teal uppercase mb-6">
        Add a New Trip
      </h1>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-6 max-w-2xl space-y-5">
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">Trip Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
            placeholder="e.g. Patagonia: Edge of the World"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">Destination *</label>
          <input
            type="text"
            required
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
            placeholder="e.g. Chile & Argentina"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">Dates</label>
          <input
            type="text"
            value={form.dates}
            onChange={(e) => setForm({ ...form, dates: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
            placeholder="e.g. January 22 - February 5, 2027"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">Price</label>
          <input
            type="text"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
            placeholder="e.g. $5,195.00/person"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-brand-charcoal mb-1">Description *</label>
          <textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none resize-y"
            placeholder="Describe the tour..."
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="w-5 h-5 text-brand-gold rounded border-gray-300 focus:ring-brand-gold"
          />
          <label htmlFor="featured" className="text-sm font-semibold text-brand-charcoal">
            Featured on homepage
          </label>
        </div>

        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">{error}</div>}

        <button
          type="submit"
          disabled={saving}
          className="bg-brand-gold text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Trip"}
        </button>
      </form>
    </div>
  );
}
