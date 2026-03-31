"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Page = {
  id: string;
  slug: string;
  title: string;
  content: string;
};

export default function AdminPagesPage() {
  const supabase = createClient();
  const [pages, setPages] = useState<Page[]>([]);
  const [selected, setSelected] = useState<Page | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("pages").select().eq("site_id", "accent").order("slug");
      setPages((data || []) as Page[]);
      if (data && data.length > 0) setSelected(data[0] as Page);
    }
    load();
  }, [supabase]);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function savePage() {
    if (!selected) return;
    setSaving(true);

    const { error } = await supabase
      .from("pages")
      .update({ title: selected.title, content: selected.content })
      .eq("id", selected.id);

    setSaving(false);
    if (error) showMessage("error", error.message);
    else showMessage("success", "Page saved!");
  }

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-brand-teal uppercase mb-6">
        Edit Pages
      </h1>

      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${
          message.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {message.text}
        </div>
      )}

      {/* Page tabs */}
      <div className="flex gap-2 mb-6">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => setSelected(page)}
            className={`px-4 py-2 rounded-lg font-[family-name:var(--font-heading)] font-semibold uppercase tracking-wide transition-colors ${
              selected?.id === page.id
                ? "bg-brand-gold text-white"
                : "bg-white text-brand-charcoal hover:bg-brand-gold-pale shadow-sm"
            }`}
          >
            {page.slug === "general-travel-information" ? "Travel Info" : page.title}
          </button>
        ))}
      </div>

      {/* Editor */}
      {selected && (
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">Page Title</label>
            <input
              type="text"
              value={selected.title}
              onChange={(e) => setSelected({ ...selected, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-brand-charcoal mb-1">
              Content <span className="text-gray-400 font-normal">(Markdown supported)</span>
            </label>
            <textarea
              rows={20}
              value={selected.content}
              onChange={(e) => setSelected({ ...selected, content: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none resize-y font-mono text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={savePage}
              disabled={saving}
              className="bg-brand-gold text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <span className="text-xs text-gray-400">
              Use ## for headings, - for lists, [text](url) for links
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
