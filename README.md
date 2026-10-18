# soil-website

Science Olympiad at Illinois (SOIL): an Astro + Tailwind website with separate Home, About, Community, Tournaments, Join, and Contact pages plus an invitational details page. The original repository title is preserved above.

## Local setup and checks

Use Node.js 24 LTS, matching GitHub Actions.

```sh
npm ci
npm run dev -- --port 4322
npm run build
npm test
```

Open http://127.0.0.1:4322/soil-website/ (or the exact port printed by Astro if occupied). `npm run preview` serves the production build. The site has six pages, in navigation order: Home (`/soil-website/`), About (`/soil-website/about/`, which also holds the officer Team block at `#team`), Community (`/soil-website/community/`), Tournaments (`/soil-website/tournaments/`), Join (`/soil-website/join/`), and Contact (`/soil-website/contact/`). The dedicated event page is at `/soil-website/invitational/`.

`npm test` checks every page, one section and one H1 per page, navigation order and current-page marking, canonical URLs, anchor targets and asset paths, unique IDs, naming, Hero mission and About mission statement text, metadata, notices, hero content order, no floating labels/forms, and the three Join destinations with accessible names and safe new-tab attributes. Browser interaction and Lighthouse audits are separate; 90+ is a target, not an asserted measured score.

## Edit content and links

Edit `src/data/site.json`. General club links are centralized here; tournament-specific links are in `src/data/tournaments.json`:

- `joinLinks`: the three cards and footer icon links, in order. Fields: `id`, `icon` (local SVG filename without extension), `title`, `description`, `button`, `url`, and `primary`. The supplied OneIllinois link is primary, followed by Discord and Instagram. Keep the Instagram handle exact. All three destinations open in a new tab with `noopener noreferrer` and descriptive accessible names.
- `links`: National Science Olympiad and Illinois Science Olympiad resource labels and URLs, shared by About and footer.
- `email`: public club email. Leave empty until confirmed; the site displays `[TODO: public club email]`. A nonempty value creates a real `mailto:` link. Do not invent an email or create an invalid placeholder mailto link.
- `officers`: `{ "name": "...", "role": "...", "favoriteEvent": "...", "favoriteMemory": "...", "photo": "/officers/name.webp", "email": "" }`, in display order. The About page's Team block shows four officer cards per row on desktop (two on tablets, one on phones); keep the favorites short so cards stay compact. Put approved images under `public/officers/` (4:3 crop); local paths receive the deployment base automatically. Without a photo, the card shows the officer's initials. Favorites, photo, and email are optional. Obtain consent before publication. Write "Science Olympiad", never "SciOly".
- `mission`: short Hero summary, rendered verbatim in Hero.
- `missionStatement`: the club's official mission statement, rendered verbatim at the top of About. Keep the University naming rule: write "University of Illinois", not "UIUC".
- `communityImpact`: summary shown on the Home page's Community Impact card.
- `joinIntro`: description under the Get Involved heading on the Join page.
- `about`: Science Olympiad explanation, independent RSO identity, story, and history TODO. Only `about.science` is rendered: the About page shows the mission statement beside "What is Science Olympiad?", then the `links`, then the officer Team block from `officers`. The other fields are kept for possible reuse.
- `activities`: four card titles and descriptions, retained but not currently rendered.
- `stats`: retained for future verified figures but not rendered. An impact strip is optional; do not publish unsupported totals.

Section components live in `src/components/sections/`. Each page in `src/pages/` (`index.astro` for Home, then `about.astro`, `community.astro`, `tournaments.astro`, `join.astro`, `contact.astro`) renders one section inside the shared layout and passes its `page` name so navigation can mark it current. Home also renders `HomeHighlights.astro` below the hero: a Community Impact card (text from `communityImpact` in `src/data/site.json`) linking to the Community page, and a card for the featured tournament (name and description from `src/data/tournaments.json`) whose Info + Register button links to the Tournaments page. The Community page is a `[TODO]` placeholder until the club supplies approved wording. Each section's heading is that page's H1 with the `page-title` class, which keeps the original section heading size. Navigation, metadata, footer, and menu behavior are in `src/layouts/Layout.astro`; styles are in `src/styles/global.css`.

## Editing tournaments

`src/data/tournaments.json` contains a `tournaments` array. The first entry is the featured 2027 SOIL Satellite Invitational. It appears on the Tournaments page (`/soil-website/tournaments/`) and in the Home highlight card. Tournaments sits between Community and Join in navigation, the mobile menu, and footer quick links. The invitational details page marks Tournaments as the current page and links back to it.

| Field | What to supply / empty behavior |
| --- | --- |
| `id` | Stable unique identifier. Keep `2027-soil-invitational` for the supplied entry. |
| `name` | Tournament name; empty displays “To be announced.” |
| `featured` | `true` renders a full-width card; `false` renders a smaller card below featured entries. Do not add placeholder tournaments. |
| `description` | Body copy. Null/empty uses the approved default description for the 2027 SOIL Satellite Invitational; other tournaments show “To be announced.” |
| `date` | ISO `YYYY-MM-DD`, or ISO datetime with explicit offset, e.g. `YYYY-MM-DDTHH:mm:ss-06:00`. Null, blank, or invalid dates display “To be announced.” Valid dates use `<time>`; the displayed day retains the supplied local calendar date. |
| `divisions` | Text or array of division names, joined by commas. Empty displays “To be announced.” |
| `teamCap` | Confirmed number or descriptive text; empty displays “To be announced.” Zero is preserved. |
| `fee` | Confirmed display text including currency and basis; e.g. a fee per team. Empty displays “To be announced.” No payment collection is implemented. |
| `registration.url` | External HTTPS registration link. Empty or invalid means a genuinely disabled button with `aria-disabled`, labeled “Registration opens soon.” |
| `volunteerUrl` | External HTTPS link. Empty/invalid hides the Volunteer section and sub-nav entry on the details page. |
| `contactEmail` | Confirmed email for a mailto link; empty links to the Contact page. |
| `events` | Array of event-name strings only. Empty shows “Event list to be announced.” Do not paste rules or tests. |
| `schedule` | Array of `{ "time": "HH:mm", "title": "Activity name" }`, in day-of order and local venue time. Empty shows “Schedule to be announced.” Missing/invalid time or empty title shows “To be announced.” Valid times use `<time>`. |

Run `node scripts/check-tournaments.mjs` for date/null/URL checks and `npm test` for built markup checks. All tournament data is rendered statically, with no new dependencies. Event structured data is no longer emitted.

Still needed for the tournament: description overrides if desired, date, divisions, team cap, fee, registration HTTPS URL, optional volunteer URL, tournament contact email, event names, and day-of schedule. All currently remain null/empty. Confirm national invitational hosting guidelines, a Tournament Director form if required, and state chapter director permission before finalizing the tournament.

## Design and assets

The hero order is logo, club name, mission, and two buttons. Background orbit art contains no text. There are no eyebrows, kickers, badges, chips, overlines, taglines, or decorative labels. White/off-white, light tint, and navy establish section rhythm. OneIllinois has a warm accent and stronger border. No meeting times, dues, deadlines, or extra volunteer arrangements are stated. No forms are implemented.

`public/logo.png` is the supplied source logo. Regenerate `public/logo.webp` (640px hero derivative) and `public/favicon.png` (64px navbar/footer/favicon derivative) when replacing it. Preserve proportions. The SOIL artwork is club-owned, all rights reserved. Colors sampled from the logo are navy `#022954` and orange `#FD5612`; accessible orange-toned text uses `#AE3707`. Change the CSS theme/variables together when swapping colors and recheck contrast. All text uses self-hosted Geist Sans variable WOFF2 from official `geist@1.8.1`, preloaded with `font-display: swap` and system fallbacks. Files and OFL license: `public/fonts/`.

Discord and Instagram glyphs come from Simple Icons (CC0), with the license saved under `public/icons/`. OneIllinois uses an original generic user-plus SVG, never a university mark. See `CREDITS.md` for sources and rights. No stock photos or reference-site text, code, graphics, or layouts are copied.

## Navigation and accessibility

The sticky header links to each page (`/soil-website/`, `/soil-website/about/`, `/soil-website/community/`, `/soil-website/tournaments/`, `/soil-website/join/`, `/soil-website/contact/`) and marks the current one with `aria-current="page"`. Only the invitational page keeps an in-page sub-navigation, whose scroll spy updates `aria-current="location"`. The mobile menu closes after a navigation link or Escape; Escape returns focus to its button. Desktop resizing clears mobile state.

Each page has one H1, a logical heading order, named sections, image alt text, visible keyboard focus, a skip link, and a back-to-top link. Content appears immediately with no scroll-triggered reveal animations. Reduced motion disables smooth scrolling and other transitions. Without JavaScript all content remains visible. No analytics, cookies, backend, or submission storage are implemented.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` installs with `npm ci`, builds, tests, and deploys `dist` on pushes to `main` or manual dispatch. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**. Enable Actions and allow the `github-pages` environment. After enabling Pages, rerun a failed workflow or push a commit.

Target: https://duhdubnub.github.io/soil-website/

Astro configuration uses `site: 'https://duhdubnub.github.io'`, `base: '/soil-website'`, and trailing slashes. For a custom domain:

1. Configure the domain and DNS through GitHub Pages settings; enable HTTPS when available.
2. Set Astro `site` to the custom origin and `base` to `/`.
3. Add `public/CNAME` with just the domain if required by your Pages setup.
4. Update the asset-base expectation in `scripts/check-site.mjs` and README URLs.
5. Rebuild and verify the six hashes, images, canonical/OG URLs, and HTTPS deployment.

## Full TODO list and open legal items

- [ ] Supply verified founding history and milestones (`about.historyTodo`).
- [ ] Replace officer-name and officer-role placeholders and complete the roster.
- [ ] Obtain consent for officer photos; replace the labeled photo placeholder and confirm permission for optional published emails.
- [ ] Supply a confirmed public club email (`email`, Contact).
- [ ] Confirm the exact chapter-status and trademark notice wording with Science Olympiad, Inc. (footer).
- [ ] Confirm the Science Olympiad, Inc. guidelines for hosting invitationals, a Tournament Director form on file if required, and state chapter director permission. Do not imply sanctioned status or endorsement.
- [ ] Record any future third-party asset and license in `CREDITS.md`; no credits or legal page is published.
- [ ] Verify impact totals before adding any optional stats display.
- [ ] Enable Pages with GitHub Actions and verify deployment.
- [ ] Complete production Lighthouse and keyboard/mobile review before claiming measured 90+ scores or full accessibility conformance.

The three supplied Join URLs are implemented, not placeholders. Unknown tournament details render human-readable pending states, never raw TODOs. No forms or payments are collected. Find remaining placeholders with `rg TODO src README.md CREDITS.md`.

## Legal

`LICENSE` covers source code under MIT and excludes logos, photos, and trademarks. Required independence and Science Olympiad trademark notices remain in the footer. No official university logo is displayed. The official Science Olympiad mark is displayed unaltered in the footer. Rules manuals, event rules, and tests are not reproduced; the site links to official resources.

## Invitational details and shared assets

`src/pages/invitational.astro` uses the shared layout, with home-section navigation and Tournaments active. Its sticky secondary navigation tracks only rendered sections. Home cards link here and omit Events, Schedule, and Volunteer. Unknown data is never invented.

Additional optional fields in `src/data/tournaments.json`:

| Field | Behavior |
| --- | --- |
| `format` | Plain text; empty displays “To be announced.” |
| `aboutParagraphs` | Array of additional approved paragraphs, following the description. |
| `platformUrl` | External HTTPS tournament platform link; null/invalid hides it. |
| `updates` | Array of `{ "date": "YYYY-MM-DD", "title": "...", "body": "..." }`, sorted newest first. Empty hides section/navigation. |
| `team` | Array of `{ "name": "...", "role": "..." }`. Empty hides section/navigation. |

The official black Science Olympiad PDF was downloaded successfully and converted with PyMuPDF to `public/logos/science-olympiad.svg` and `.png`. Only outer blank page margins were removed; all artwork, original colors, proportions, tagline and TM remain intact. The asset includes more than an S-height clear space, with additional white-panel padding in CSS. To replace it, use the official source, retain all artwork and recheck the brand guidelines. Source and permission links are recorded in CREDITS.md.

### Tournament card and facts

The home card is one navy column: title, date (or “Date to be announced”), description, Divisions, and two actions. The orange accent uses `#FD7B42` with navy text on the filled button. Text stays within 60ch; actions stack on mobile. `TournamentInfo.astro` supplies the reusable left-border lines. On the details page these show Date, Divisions, Teams (`teamCap`), and Fee; the headline banner shows Date and Format only.

Registration data now has the shape `"registration": { "url": null }`. It contains only the external HTTPS URL; previous timing fields have been removed. The Registration section contains the button and optional platform link. Old venue data and the former facts panel have been removed.
