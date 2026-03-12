"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type Setting = { id: string; key: string; value: string };

const SETTING_LABELS: Record<string, string> = {
  business_name: "Business Name",
  tagline: "Tagline",
  subtitle: "Subtitle",
  phone: "Phone Number",
  email: "Email Address",
  address: "Street Address",
  city: "City",
  state: "State",
  zip: "ZIP Code",
  venmo: "Venmo Handle",
  zelle: "Zelle Email/Phone",
  facebook: "Facebook Page URL",
  year_established: "Year Established",
  value_props: "Value Propositions Banner",
};

export default function AdminSettingsPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("settings").select().order("key");
      setSettings((data || []) as Setting[]);
    }
    load();
  }, [supabase]);

  function updateSetting(key: string, value: string) {
    setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));
  }

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  }

  async function saveSettings() {
    setSaving(true);

    const updates = settings.map((s) =>
      supabase.from("settings").update({ value: s.value }).eq("id", s.id)
    );

    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);

    setSaving(false);
    if (failed?.error) showMessage("error", failed.error.message);
    else showMessage("success", "Settings saved!");
  }

  // Group settings for display
  const contactSettings = settings.filter((s) =>
    ["phone", "email", "address", "city", "state", "zip"].includes(s.key)
  );
  const brandSettings = settings.filter((s) =>
    ["business_name", "tagline", "subtitle", "year_established", "value_props"].includes(s.key)
  );
  const socialSettings = settings.filter((s) =>
    ["facebook", "venmo", "zelle"].includes(s.key)
  );

  return (
    <div>
      <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-brand-teal uppercase mb-6">
        Site Settings
      </h1>

      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold ${
          message.type === "success" ? "bg-green-500" : "bg-red-500"
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Brand */}
        <Section title="Brand & Identity">
          {brandSettings.map((s) => (
            <SettingField key={s.key} label={SETTING_LABELS[s.key] || s.key} value={s.value} onChange={(v) => updateSetting(s.key, v)} />
          ))}
        </Section>

        {/* Contact */}
        <Section title="Contact Information">
          {contactSettings.map((s) => (
            <SettingField key={s.key} label={SETTING_LABELS[s.key] || s.key} value={s.value} onChange={(v) => updateSetting(s.key, v)} />
          ))}
        </Section>

        {/* Social */}
        <Section title="Social & Payment Links">
          {socialSettings.map((s) => (
            <SettingField key={s.key} label={SETTING_LABELS[s.key] || s.key} value={s.value} onChange={(v) => updateSetting(s.key, v)} />
          ))}
        </Section>
      </div>

      <div className="mt-6">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="bg-brand-gold text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-brand-charcoal uppercase mb-4">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function SettingField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-brand-charcoal mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-brand-gold focus:outline-none"
      />
    </div>
  );
}
