import { createClient } from "@/lib/supabase/server";
import { getImageUrl } from "@/lib/supabase/storage";
import { getSiteImages } from "@/lib/supabase/site-images";
import { getSiteSettings } from "@/lib/supabase/site-settings";
import Image from "next/image";
import type { Metadata } from "next";

// Content is managed in Admin → Pages → "Travel Insurance" (pages table, slug "travel-insurance").
// Re-render on each request so admin edits show up immediately.
export const dynamic = "force-dynamic";

async function getPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pages")
    .select("*")
    .eq("slug", "travel-insurance")
    .eq("site_id", "accent")
    .single();
  return data as { title?: string; content?: unknown; meta_title?: string | null; meta_description?: string | null } | null;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage();
  return {
    title: page?.meta_title || page?.title || "Travel Insurance",
    description:
      page?.meta_description ||
      "Allianz Annual Travel Insurance plans covering all domestic and international travel for 365 days.",
  };
}

type Block =
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "paragraph"; text: string };

// Minimal markdown: "## " headings, "- " bullet lists, blank-line separated paragraphs.
function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of content.replace(/\r\n/g, "\n").split(/\n\s*\n/)) {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    let para: string[] = [];
    let list: string[] = [];
    const flushPara = () => {
      if (para.length) blocks.push({ type: "paragraph", text: para.join(" ") });
      para = [];
    };
    const flushList = () => {
      if (list.length) blocks.push({ type: "list", items: list });
      list = [];
    };
    for (const line of lines) {
      if (/^#{1,6}\s+/.test(line)) {
        flushPara();
        flushList();
        blocks.push({ type: "heading", text: line.replace(/^#{1,6}\s+/, "") });
      } else if (/^[-*•]\s+/.test(line)) {
        flushPara();
        list.push(line.replace(/^[-*•]\s+/, ""));
      } else {
        flushList();
        para.push(line);
      }
    }
    flushPara();
    flushList();
  }
  return blocks;
}

// Inline formatting: [text](url) links and **bold**.
function renderInline(text: string) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const external = /^https?:\/\//.test(link[2]);
      return (
        <a
          key={i}
          href={link[2]}
          className="text-brand-gold font-bold hover:underline"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link[1]}
        </a>
      );
    }
    const bold = part.match(/^\*\*([^*]+)\*\*$/);
    if (bold) return <strong key={i}>{bold[1]}</strong>;
    return <span key={i}>{part}</span>;
  });
}

export default async function TravelInsurancePage() {
  const [page, img, settings] = await Promise.all([getPage(), getSiteImages(), getSiteSettings()]);
  const phoneRaw = settings.phone.replace(/\D/g, "");
  const title = page?.title || "Travel Insurance";
  const content = typeof page?.content === "string" ? page.content : "";
  const blocks = parseBlocks(content);

  return (
    <>
      {/* Hero */}
      <section className="relative h-80 flex items-center justify-center overflow-hidden pt-20">
        <Image
          src={getImageUrl(
            img.hero_travel_insurance || img.hero_travel_info || "heroes/general-hero-2880w.jpg"
          )}
          alt={title}
          fill
          className="object-cover"
          style={{
            objectPosition:
              (img.hero_travel_insurance ? img.hero_travel_insurance_pos : img.hero_travel_info_pos) ||
              "center center",
          }}
          priority
        />
        <div className="absolute inset-0 bg-brand-teal/60" />
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-6xl font-bold uppercase tracking-wider">
            {title}
          </h1>
          <p className="mt-2 text-brand-gold-light text-lg">Allianz Annual Travel Insurance</p>
        </div>
      </section>

      <section id="travel-insurance" className="max-w-4xl mx-auto px-4 py-16">
        {blocks.map((block, i) => {
          if (block.type === "heading") {
            return (
              <div key={i} className="mt-10 mb-4">
                <h3 className="font-[family-name:var(--font-heading)] text-2xl text-brand-teal uppercase mb-2">
                  {renderInline(block.text)}
                </h3>
                <div className="w-12 h-[2px] bg-brand-gold" />
              </div>
            );
          }
          if (block.type === "list") {
            return (
              <ul
                key={i}
                className="bg-brand-offwhite border border-gray-200 rounded-xl p-6 md:p-8 mb-8 space-y-3"
              >
                {block.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-3 text-lg text-brand-charcoal leading-relaxed">
                    <span className="mt-[0.55em] w-2 h-2 rounded-full bg-brand-gold shrink-0" aria-hidden="true" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <p key={i} className="text-lg text-brand-charcoal leading-relaxed mb-6">
              {renderInline(block.text)}
            </p>
          );
        })}

        {/* Existing site contact details (Admin → Settings) */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <a
            href={`tel:${phoneRaw}`}
            className="text-center bg-brand-gold text-white px-4 sm:px-8 py-3 rounded font-[family-name:var(--font-heading)] text-lg font-bold uppercase tracking-[0.1em] hover:bg-brand-gold-light transition-colors"
          >
            Call or Text {settings.phone}
          </a>
          <a
            href={`mailto:${settings.email}`}
            className="text-center border border-brand-gold text-brand-gold px-4 sm:px-8 py-3 rounded font-[family-name:var(--font-heading)] text-base sm:text-lg font-bold uppercase tracking-[0.06em] sm:tracking-[0.1em] hover:bg-brand-gold hover:text-white transition-colors"
          >
            {settings.email}
          </a>
        </div>
      </section>
    </>
  );
}
