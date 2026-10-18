# soil-website

Science Olympiad at Illinois (SOIL): a single-page Astro + Tailwind website. The original repository title is preserved above.

## Local setup and checks

Use Node.js 24 LTS, matching GitHub Actions.

```sh
npm ci
npm run dev -- --port 4322
npm run build
npm test
```

Open http://127.0.0.1:4322/soil-website/ (or the exact port printed by Astro if occupied). `npm run preview` serves the production build. Output is one HTML page with five sections in order: Home, About, Team, Join, Contact. No Events, Network, or Legal & Credits routes exist.

`npm test` checks one page, section order, anchor targets and asset paths, unique IDs, naming, mission text twice, metadata, notices, hero content order, no floating labels/forms, and the three Join destinations with accessible names and safe new-tab attributes. Browser interaction and Lighthouse audits are separate; 90+ is a target, not an asserted measured score.

## Edit content and links

Edit `src/data/site.json`. All external link destinations used on the page are centralized here:

- `joinLinks`: the three cards and footer icon links, in order. Fields: `id`, `icon` (local SVG filename without extension), `title`, `description`, `button`, `url`, and `primary`. The supplied OneIllinois link is primary, followed by Discord and Instagram. Keep the Instagram handle exact. All three destinations open in a new tab with `noopener noreferrer` and descriptive accessible names.
- `links`: National Science Olympiad and Illinois Science Olympiad resource labels and URLs, shared by About and footer.
- `email`: public club email. Leave empty until confirmed; the site displays `[TODO: public club email]`. A nonempty value creates a real `mailto:` link. Do not invent an email or create an invalid placeholder mailto link.
- `officers`: `{ "name": "...", "role": "...", "photo": "/officers/name.webp", "email": "" }`. Put approved images under `public/officers/`; local paths receive the deployment base automatically. Photo and email are optional. Obtain consent before publication.
- `mission`: approved mission, rendered verbatim in Hero and About.
- `about`: Science Olympiad explanation, independent RSO identity, story, and history TODO.
- `activities`: four card titles and descriptions. No labels, numbering, tags, or slogans are displayed.
- `stats`: retained for future verified figures but not rendered. An impact strip is optional; do not publish unsupported totals.

Section components live in `src/components/sections/`, assembled by `src/pages/index.astro`. Navigation, metadata, footer, and scroll behavior are in `src/layouts/Layout.astro`; styles are in `src/styles/global.css`.

## Design and assets

The hero order is logo, club name, mission, and two buttons. Background orbit art contains no text. There are no eyebrows, kickers, badges, chips, overlines, taglines, or decorative labels. White/off-white, light tint, and navy establish section rhythm. OneIllinois has a warm accent and stronger border. No meeting times, dues, deadlines, or extra volunteer arrangements are stated. No forms are implemented.

`public/logo.png` is the supplied source logo. Regenerate `public/logo.webp` (640px hero derivative) and `public/favicon.png` (64px navbar/footer/favicon derivative) when replacing it. Preserve proportions and confirm image rights. Colors sampled from the logo are navy `#022954` and orange `#FD5612`; accessible orange-toned text uses `#AE3707`. Change the CSS theme/variables together when swapping colors and recheck contrast. The system sans-serif stack avoids font downloads.

Discord and Instagram glyphs come from Simple Icons (CC0), with the license saved under `public/icons/`. OneIllinois uses an original generic user-plus SVG, never a university mark. See `CREDITS.md` for sources and rights. No stock photos or reference-site text, code, graphics, or layouts are copied.

## Navigation and accessibility

Sticky links use native hashes (`#home`, `#about`, `#team`, `#join`, `#contact`) and `scroll-margin-top`. Scroll spy updates `aria-current="location"`; manual scrolling does not clutter browser history. The mobile menu closes after a navigation link or Escape; Escape returns focus to its button. Desktop resizing clears mobile state.

There is one H1, a logical heading order, named sections, image alt text, visible keyboard focus, a skip link, and a back-to-top link. Reveal transitions apply only to initially off-screen content. Reduced motion disables smooth scrolling and reveals, including preference changes during a visit. Without JavaScript all content remains visible. No analytics, cookies, backend, or submission storage are implemented.

## GitHub Pages

The workflow in `.github/workflows/deploy.yml` installs with `npm ci`, builds, tests, and deploys `dist` on pushes to `main` or manual dispatch. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**. Enable Actions and allow the `github-pages` environment. After enabling Pages, rerun a failed workflow or push a commit.

Target: https://duhdubnub.github.io/soil-website/

Astro configuration uses `site: 'https://duhdubnub.github.io'`, `base: '/soil-website'`, and trailing slashes. For a custom domain:

1. Configure the domain and DNS through GitHub Pages settings; enable HTTPS when available.
2. Set Astro `site` to the custom origin and `base` to `/`.
3. Add `public/CNAME` with just the domain if required by your Pages setup.
4. Update the asset-base expectation in `scripts/check-site.mjs` and README URLs.
5. Rebuild and verify the five hashes, images, canonical/OG URLs, and HTTPS deployment.

## Full TODO list and open legal items

- [ ] Confirm ownership and usage rights for the supplied SOIL logo.
- [ ] Supply verified founding history and milestones (`about.historyTodo`).
- [ ] Replace officer-name and officer-role placeholders and complete the roster.
- [ ] Obtain consent for officer photos; replace the labeled photo placeholder and confirm permission for optional published emails.
- [ ] Supply a confirmed public club email (`email`, Contact).
- [ ] Confirm Science Olympiad membership and logo permission before filling the reserved footer slot. Obtain the approved asset from soinc.org; keep it unaltered and undistorted, with clear space, alongside the SOIL logo.
- [ ] Confirm the exact Science Olympiad trademark notice wording (footer).
- [ ] Confirm sanctioned hosting or chapter status before making such claims. Current copy only describes helping run/supporting competitions.
- [ ] Record any future third-party asset and license in `CREDITS.md`; no credits or legal page is published.
- [ ] Verify impact totals before adding any optional stats display.
- [ ] Enable Pages with GitHub Actions and verify deployment.
- [ ] Complete production Lighthouse and keyboard/mobile review before claiming measured 90+ scores or full accessibility conformance.

The three supplied Join URLs are implemented, not placeholders. No meeting, fee, deadline, or form TODO appears on the site. Find remaining placeholders with `rg TODO src README.md CREDITS.md`.

## Legal

`LICENSE` covers source code under MIT and excludes logos, photos, and trademarks. Required independence and Science Olympiad trademark notices remain in the footer. No official university or national Science Olympiad logo is displayed. Rules manuals, event rules, and tests are not reproduced; the site links to official resources.
