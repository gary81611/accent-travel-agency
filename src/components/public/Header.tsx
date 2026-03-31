"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { SiteSettings } from "@/lib/supabase/site-settings";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Group Tours", href: "/trips" },
  { label: "Gallery", href: "/gallery" },
  { label: "Travel Info", href: "/travel-info" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header({
  transparent = false,
  settings,
}: {
  transparent?: boolean;
  settings: SiteSettings;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const isGlass = transparent && !scrolled;
  const phoneRaw = settings.phone.replace(/\D/g, "");

  return (
    <header className={`w-full fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isGlass ? "" : "shadow-md"
    }`}>
      {/* Slim utility bar */}
      <div className={`text-xs tracking-wider transition-all duration-500 ${
        isGlass ? "bg-black/20 backdrop-blur-sm text-white/70" : "bg-brand-teal text-white/80"
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex justify-between items-center">
          <a href={`tel:${phoneRaw}`} className="hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {settings.phone}
          </a>
          <span className="hidden md:inline text-inherit">
            {settings.city}, {settings.state} &nbsp;&middot;&nbsp; {settings.subtitle}
          </span>
          <a
            href={`mailto:${settings.email}`}
            className="hover:text-white transition-colors hidden sm:flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {settings.email}
          </a>
        </div>
      </div>

      {/* Main header bar */}
      <div className={`transition-all duration-500 ${
        isGlass
          ? "bg-black/15 backdrop-blur-sm border-b border-white/10"
          : "bg-white border-b border-gray-100"
      }`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16 lg:h-auto">
            <Link href="/" className="group shrink-0 lg:py-3">
              <span className={`font-[family-name:var(--font-heading)] text-[22px] sm:text-[28px] font-bold uppercase tracking-[0.12em] leading-none transition-colors duration-500 ${
                isGlass ? "text-white" : "text-brand-teal"
              }`}>
                {settings.business_name}
              </span>
            </Link>

            {/* Desktop nav */}
            <ul className="hidden lg:flex items-center gap-0">
              {navItems.map((item, idx) => (
                <li key={item.label} className="relative">
                  {idx > 0 && (
                    <span className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full transition-colors duration-500 ${
                      isGlass ? "bg-brand-gold-light/40" : "bg-brand-gold/40"
                    }`} />
                  )}
                  <Link
                    href={item.href}
                    className={`relative block px-4 py-4 font-[family-name:var(--font-heading)] text-[14px] font-semibold hover:text-brand-gold transition-colors uppercase tracking-[0.12em] group/item ${
                      isGlass ? "text-white/90" : "text-brand-charcoal/80"
                    }`}
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-brand-gold scale-x-0 group-hover/item:scale-x-100 transition-transform origin-left" />
                  </Link>
                </li>
              ))}
              <li className="ml-3">
                <Link
                  href="/contact"
                  className={`px-5 py-2 rounded font-[family-name:var(--font-heading)] text-[13px] font-bold uppercase tracking-[0.12em] transition-all ${
                    isGlass
                      ? "bg-brand-gold/90 text-white hover:bg-brand-gold"
                      : "bg-brand-gold text-white hover:bg-brand-gold-light"
                  }`}
                >
                  Request Info
                </Link>
              </li>
            </ul>

            {/* Mobile hamburger */}
            <button
              className={`lg:hidden p-2 transition-colors ${isGlass ? "text-white/80 hover:text-white" : "text-brand-charcoal/70 hover:text-brand-gold"}`}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <ul className="max-w-7xl mx-auto px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="block py-2 font-[family-name:var(--font-heading)] text-[15px] font-semibold text-brand-charcoal/70 hover:text-brand-gold uppercase tracking-[0.15em] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 mt-3 border-t border-gray-100">
              <Link
                href="/contact"
                className="block text-center bg-brand-gold text-white py-3 rounded-md font-[family-name:var(--font-heading)] text-[15px] font-bold uppercase tracking-[0.15em] hover:bg-brand-gold-light transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                Request Tour Info
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
