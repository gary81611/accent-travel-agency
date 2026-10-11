-- Travel Insurance page (Accent Travel Agency)
-- Seeds the editable content for /travel-insurance.
-- The client edits it in Admin → Pages → "Travel Insurance" (Markdown: blank lines between
-- paragraphs, "- " for bullet list items). Already applied to production on 2026-10-11.
INSERT INTO pages (site_id, slug, title, meta_title, meta_description, template_type, content, status, published_at)
VALUES ('accent', 'travel-insurance', 'Travel Insurance', 'Travel Insurance',
  'Allianz Annual Travel Insurance plans covering all domestic and international travel for 365 days.',
  'service', to_jsonb($ti$We offer Allianz Annual Travel Insurance plans to protect you and your trips for a full 365 days. Coverage applies to all domestic and international travel. Allianz is a global provider, and policy pricing is not based on age—the price is the same for everyone. We can issue your plan today and have it take effect tomorrow.

Our most popular option is the Annual Executive Plan. Each traveler requires an individual policy, which includes the following coverage for 365 days from the purchase date:

- Change Fee Coverage: $500
- Loyalty Program Redeposit Fee: $500
- Travel Delay: $1,600
- Baggage Coverage: $1,000
- Baggage Delay: $1,000
- Emergency Medical: $50,000
- Emergency Transportation: $250,000 (if you become ill while traveling and require medical evacuation)
- Travel Accident: $50,000

Annual plans can be purchased to cover losses for trip cancellation and trip interruption at the following rates:

- $5,000 coverage per person: $485.00/year
- $7,500 coverage per person: $615.00/year
- $10,000 coverage per person: $785.00/year
- $15,000 coverage per person: $1,460.00/year

Please call, email, or text us today to set up your coverage.$ti$::text), 'published', now())
ON CONFLICT (site_id, slug) DO NOTHING;
