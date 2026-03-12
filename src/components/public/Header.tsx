"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { getImageUrl } from "@/lib/supabase/storage";

const navItems = [
  { label: "Home", href: "/" },
  {
    label: "Group Tours",
    href: "#",
    children: [
      { label: "2025 Tours", href: "/trips?year=2025" },
      { label: "2026 Tours", href: "/trips?year=2026" },
      { label: "2027 Tours", href: "/trips?year=2027" },
      { label: "View All", href: "/trips" },
    ],
  },
  { label: "Gallery", href: "/gallery" },
  { label: "Travel Info", href: "/travel-info" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="w-full sticky top-0 z-50">
      {/* ── Slim utility bar ─────────────────────────── */}
      <div className="bg-brand-teal text-white/80 text-xs tracking-wider">
        <div className="max-w-7xl mx-auto px-6 py-1.5 flex justify-between items-center">
          <a href="tel:8065706640" className="hover:text-white transition-colors flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            (806) 570-6640
          </a>
          <span className="hidden md:inline text-white/50">
            Amarillo, TX &nbsp;&middot;&nbsp; Since 1981 &nbsp;&middot;&nbsp; Group Travel Specialists
          </span>
          <a
            href="mailto:accenttravelgroups@gmail.com"
            className="hover:text-white transition-colors hidden sm:flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            accenttravelgroups@gmail.com
          </a>
        </div>
      </div>

      {/* ── Brand bar — centered logo ────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-center">
          <Link href="/" className="group flex flex-col items-center text-center">
            {/* Ornamental frame with text inside */}
            <div className="relative w-[200px] h-[70px] sm:w-[260px] sm:h-[88px]">
              <Image
                src={getImageUrl("branding/logo-new-1920w.png")}
                alt=""
                fill
                className="object-contain opacity-60 group-hover:opacity-80 transition-opacity duration-500"
                priority
              />
              {/* Business name inside the frame */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-[family-name:var(--font-heading)] text-brand-teal text-[22px] sm:text-[28px] font-bold uppercase tracking-[0.2em] leading-none">
                  Accent Travel
                </span>
                <span className="font-[family-name:var(--font-heading-alt)] text-brand-gold text-[10px] sm:text-[11px] uppercase tracking-[0.35em] mt-0.5">
                  Agency
                </span>
              </div>
            </div>
            {/* Tagline below frame */}
            <span className="text-[11px] sm:text-xs text-brand-charcoal/50 italic tracking-wide mt-1 font-[family-name:var(--font-body)]">
              Ask Us. We&apos;ve Been There.
            </span>
          </Link>
        </div>
      </div>

      {/* ── Navigation bar ───────────────────────────── */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          {/* Desktop nav — centered */}
          <ul className="hidden lg:flex items-center justify-center gap-0">
            {navItems.map((item, idx) => (
              <li
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {/* Gold dot separator between items */}
                {idx > 0 && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-brand-gold/40" />
                )}

                {item.children ? (
                  <>
                    <button className="relative px-5 py-3 font-[family-name:var(--font-heading)] text-[15px] font-semibold text-brand-charcoal/80 hover:text-brand-gold transition-colors uppercase tracking-[0.15em] group/item">
                      {item.label}
                      <svg className="inline ml-1 w-2.5 h-2.5 opacity-40 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-brand-gold scale-x-0 group-hover/item:scale-x-100 transition-transform origin-left" />
                    </button>
                    {openDropdown === item.label && (
                      <ul className="absolute top-full left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-md py-2 min-w-[180px] z-50 border border-gray-100 mt-0">
                        {item.children.map((child) => (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              className="block px-5 py-2.5 text-brand-charcoal/80 hover:text-brand-gold hover:bg-brand-gold-pale/50 font-[family-name:var(--font-heading)] text-[14px] tracking-[0.1em] uppercase transition-colors"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="relative block px-5 py-3 font-[family-name:var(--font-heading)] text-[15px] font-semibold text-brand-charcoal/80 hover:text-brand-gold transition-colors uppercase tracking-[0.15em] group/item"
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-5 right-5 h-[2px] bg-brand-gold scale-x-0 group-hover/item:scale-x-100 transition-transform origin-left" />
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Mobile — hamburger row */}
          <div className="lg:hidden flex items-center justify-between py-2">
            <span className="font-[family-name:var(--font-heading)] text-sm text-brand-charcoal/50 uppercase tracking-[0.15em]">
              Menu
            </span>
            <button
              className="p-2 text-brand-charcoal/70 hover:text-brand-gold transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ──────────────────────────────── */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
          <ul className="max-w-7xl mx-auto px-6 py-4 space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.children ? (
                  <div>
                    <span className="block py-2 font-[family-name:var(--font-heading)] text-[15px] font-semibold text-brand-charcoal/60 uppercase tracking-[0.15em]">
                      {item.label}
                    </span>
                    <ul className="pl-4 border-l-2 border-brand-gold/20 ml-2 space-y-0.5">
                      {item.children.map((child) => (
                        <li key={child.label}>
                          <Link
                            href={child.href}
                            className="block py-1.5 text-brand-charcoal/70 hover:text-brand-gold font-[family-name:var(--font-heading)] text-[14px] tracking-[0.1em] uppercase transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-2 font-[family-name:var(--font-heading)] text-[15px] font-semibold text-brand-charcoal/70 hover:text-brand-gold uppercase tracking-[0.15em] transition-colors"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            {/* Mobile CTA */}
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
