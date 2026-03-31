import Link from "next/link";
import type { SiteSettings } from "@/lib/supabase/site-settings";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const phoneRaw = settings.phone.replace(/\D/g, "");

  return (
    <footer className="bg-brand-charcoal text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-[family-name:var(--font-heading)] font-bold text-brand-gold-light mb-3">
              {settings.business_name}
            </h3>
            <p className="text-gray-300 text-sm italic mb-2">
              &ldquo;{settings.tagline}&rdquo;
            </p>
            <p className="text-gray-400 text-sm">
              Specializing in Group Travel and Tours for 10 or More &middot; Since {settings.year_established}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] text-xl font-semibold mb-3 text-brand-gold-light uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Group Tours", href: "/trips" },
                { label: "Gallery", href: "/gallery" },
                { label: "Travel Information", href: "/travel-info" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-gray-300 hover:text-brand-gold-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h4 className="font-[family-name:var(--font-heading)] text-xl font-semibold mb-3 text-brand-gold-light uppercase">
              Contact Us
            </h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <a href={`tel:${phoneRaw}`} className="hover:text-brand-gold-light transition-colors">
                  {settings.phone}
                </a>
                <span className="text-gray-500 ml-1">— Call or Text</span>
              </p>
              <p>
                <a href={`mailto:${settings.email}`} className="hover:text-brand-gold-light transition-colors">
                  {settings.email}
                </a>
              </p>
              <p>{settings.address}<br />{settings.city}, {settings.state} {settings.zip}</p>
              {settings.facebook && (
                <div className="flex gap-3 pt-2">
                  <a
                    href={settings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {settings.business_name}. All rights reserved.</p>
          <p className="mt-1">Serving {settings.city}, {settings.state} and surrounding areas.</p>
        </div>
      </div>
    </footer>
  );
}
