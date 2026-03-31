"use client";

import { useState } from "react";

export default function ContactForm({ email }: { email: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "opened">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const subject = `Group Tour Inquiry from ${form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("opened");
  }

  if (status === "opened") {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-800 font-semibold text-lg mb-2">Your email client should have opened</p>
        <p className="text-blue-700 mb-4">
          Please send the email to complete your inquiry. If your email client didn&apos;t open, you can email us directly:
        </p>
        <a href={`mailto:${email}`} className="text-brand-gold font-bold text-lg hover:underline">
          {email}
        </a>
        <button
          onClick={() => setStatus("idle")}
          className="block mx-auto mt-4 text-sm text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-brand-charcoal mb-1">Name *</label>
        <input id="name" type="text" required value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-brand-charcoal mb-1">Email *</label>
        <input id="email" type="email" required value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-brand-charcoal mb-1">Phone</label>
        <input id="phone" type="tel" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent" />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-brand-charcoal mb-1">Message *</label>
        <textarea id="message" required rows={5} value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-y" />
      </div>
      <button type="submit"
        className="w-full bg-brand-gold text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors">
        Send Message
      </button>
    </form>
  );
}
