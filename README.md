# Garden Of Two Hearts

Build a luxury animated Islamic wedding invitation website called "The Sacred Garden" (single long scrolling page, mobile-first). Stack: React + Vite + TypeScript + Tailwind + shadcn/ui, with Supabase (Lovable Cloud) for database, storage and edge functions. Style: soft ivory/cream background, sage green + muted gold accents, delicate floral/rose decor, Cormorant Garamond for display and Jost for body.

CRITICAL ARCHITECTURE RULE: NO editable content may be hardcoded in .tsx files. Components contain only layout, styling and animation. Every name, date, time, text, label, address, URL and media link comes from the database. If a field is empty, hide that section gracefully.

DATABASE (Supabase):
- Table `invitations`: id, slug (unique), template (default 'sacred-garden'), `content` JSONB (groom/bride names, wedding date, intro texts, schedule array of {time,title}, venue name, address, map_url, gift_preference, dress_code, rsvp_deadline, all section titles and button labels, each in uz/ru/en), `media` JSONB (music_url, hero_video_url, cover_image, decor images, footer image), `settings` JSONB (colors, fonts, enabled sections, section order), created_at, updated_at.
- Table `rsvps`: id, invitation_slug, name, attending (boolean), guests_count, song, children_info, created_at.
- RLS: public can only SELECT on `invitations`; public can only INSERT on `rsvps`. No public UPDATE/DELETE anywhere. Only edge functions (service role) can write to `invitations` or read `rsvps`.
- Seed the first invitation row via SQL migration with slug `sacred-garden`: Zohan & Rose, date 27.09.26, schedule: Guest Arrival 5 PM, Nikkah Ceremony 6 PM, Mocktail Hour 7 PM, Dinner 8 PM, Dance 9 PM. Venue: Islamic Center of Melville, 118 Old East Neck Road, Melville, NY 11747. Gift preference: "Kindly, no boxed gifts please." Dress code: "We kindly ask guests to avoid deep red and maroon attire for the celebration." RSVP deadline: August 09. Texts: "Wedding Day", "Two Souls / One destiny / A Lifetime written by Allah", "Dear Friends and Family — Join us for an evening of love, laughter, duas, and unforgettable memories as we begin our forever.", "The Celebration Begins In", "Schedule of Events", "Location", "Hope to see you there!". Provide Uzbek (Latin) and Russian translations as well. Use placeholder media URLs that I will replace in the admin panel.

ROUTING: /:slug loads the invitation and passes it to components via context/props. Loading skeleton while fetching; "not found" page for unknown slugs.

PUBLIC PAGE SECTIONS (in order, order and visibility driven by settings):
1. Opening screen: full-screen cover with envelope/wax-seal image and "Tap to open". On tap, start background music (audio element, direct mp3 URL, loop, floating mute/unmute button) and fade into the hero.
2. Hero: looping muted autoplay playsInline background video, groom name, "&", bride name, "Wedding Day", date, then the poetic text and invitation text, plus a bouncing "Scroll down" hint.
3. Countdown: live Days : Hours : Minutes : Seconds to the wedding date, titled "The Celebration Begins In".
4. Schedule of Events: vertical timeline from the schedule array, items reveal on scroll.
5. Location: venue name, address, embedded Google Map iframe from map_url.
6. Detail cards: Gift Preference and Dress Code.
7. RSVP: wax-seal button opens a modal "Confirm Your Attendance — Please RSVP before [deadline]" with fields: Your name, Will you be attending? (Accepts with pleasure / Declines with regret), Number of guests, A song that gets you dancing, Children attending (names and ages), Submit. Inserts into `rsvps` with invitation_slug.
8. Footer: background photo, "Hope to see you there!" and the couple's names.
Animations: scroll-reveal (framer-motion) on every section, floating petals/rose particles, gentle parallax on decor images, smooth fade transitions, soft hover effects. Language switcher UZ / RU / EN at the top (default UZ).

ADMIN PANEL:
- A small key icon at the bottom of the page opens a password modal.
- The password is NOT stored in frontend code or in chat. Create a Supabase Edge Function `admin-auth` that compares the submitted password with a secret named ADMIN_PASSWORD and returns a short-lived signed token (2 hours) kept in sessionStorage. Rate-limit: after 5 wrong attempts block for 15 minutes. Ask me to enter the ADMIN_PASSWORD secret through the secure secrets form.
- Edit mode (valid token only) lets me edit EVERY field: names, date, schedule items (add/remove/reorder), venue, address, map URL, gift preference, dress code, RSVP deadline, all UZ/RU/EN translations, section toggles and order, colors, and media URLs plus image upload to Supabase Storage.
- All saves go through a second Edge Function `admin-save` that verifies the token before updating `invitations`.
- "RSVPs" tab listing all responses (name, attending, guests, song, children) with CSV export, served through an edge function that verifies the token.
- "Create new invitation" button duplicates an existing row with a new slug so new invitations need no code changes.
- Saved toast, Logout button, mobile-friendly UI.

Only environment variables allowed in code: Supabase URL and anon key. When finished, search the codebase and confirm no content strings remain hardcoded.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://garden-of-two-hearts.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8a321e77-9a4e-4b95-952c-207b7ca1c806).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
