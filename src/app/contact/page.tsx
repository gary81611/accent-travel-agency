"use client";

import Image from "next/image";
import { getImageUrl } from "@/lib/supabase/storage";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");

    // Build a mailto link as a simple contact approach (no backend needed for now)
    const subject = `Group Tour Inquiry from ${form.name}`;
    const body = `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`;
    window.location.href = `mailto:accenttravelgroups@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setStatus("success");
  }

  return (
    <>
      {/* Hero */}
      <section className="relative h-64 flex items-center justify-center overflow-hidden">
        <Image
          src={getImageUrl("heroes/contact-hero-2880w.jpg")}
          alt="Contact Accent Travel Agency"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-brand-teal/60" />
        <div className="relative z-10 text-center text-white">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold uppercase tracking-wider">
            Contact Us
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact form */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl text-brand-teal uppercase mb-2">
              Send Us a Message
            </h2>
            <div className="w-16 h-1 bg-brand-gold mb-4" />
            <p className="text-brand-charcoal mb-6">
              Your destination waits! For all of your travel needs, contact our experienced and
              reliable staff. If we miss your call for any reason, we&apos;ll call you back the same
              business day.
            </p>

            {status === "success" ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <p className="text-green-700 font-semibold text-lg mb-2">Thank you!</p>
                <p className="text-green-600">
                  We appreciate you contacting us. One of our colleagues will get back in touch with
                  you soon!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-brand-charcoal mb-1">
                    Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-brand-charcoal mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-brand-charcoal mb-1">
                    Phone
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-brand-charcoal mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-y"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full bg-brand-gold text-white px-8 py-3 rounded-md font-[family-name:var(--font-heading)] text-xl font-bold uppercase tracking-wide hover:bg-brand-gold-light transition-colors disabled:opacity-50"
                >
                  {status === "sending" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Contact info */}
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl md:text-3xl text-brand-teal uppercase mb-2">
              Get in Touch
            </h2>
            <div className="w-16 h-1 bg-brand-gold mb-6" />

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-brand-gold rounded-full p-3 text-white shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-charcoal">Call or Text</h3>
                  <a href="tel:8065706640" className="text-brand-gold text-lg font-bold hover:underline">
                    (806) 570-6640
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-gold rounded-full p-3 text-white shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-charcoal">Email</h3>
                  <a href="mailto:accenttravelgroups@gmail.com" className="text-brand-gold hover:underline">
                    accenttravelgroups@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-gold rounded-full p-3 text-white shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-charcoal">Address</h3>
                  <p className="text-brand-charcoal">
                    6006 Tuscany Village<br />
                    Amarillo, TX 79119
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-gold rounded-full p-3 text-white shrink-0">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-charcoal">Follow Us</h3>
                  <a
                    href="https://www.facebook.com/accenttravelagency/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-gold hover:underline"
                  >
                    Accent Travel Agency on Facebook
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-gold rounded-full p-3 text-white shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-charcoal">Other Payment Options</h3>
                  <p className="text-brand-charcoal text-sm">
                    Venmo: <span className="font-semibold">@dirk-schmitz</span><br />
                    Zelle: <span className="font-semibold">j.dirk.schmitz</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
