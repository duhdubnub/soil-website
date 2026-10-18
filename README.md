# soil-website

Science Olympiad at Illinois (SOIL): a static, responsive Astro + Tailwind website. The original repository README title is retained above.

## Local setup

Install Node.js 24 LTS. The GitHub Actions workflow uses Node.js 24 as well.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4321/soil-website/ . The server has a base path; use that full URL.

```sh
npm run build
npm test
npm run preview
```

The build emits nine static pages to `dist/`. `npm test` verifies built page links/assets, base paths, naming rules, exact mission text, notices, image alt attributes, H1s, and metadata. There is no backend, analytics, or contact submission storage.

## Edit content

Edit `src/data/site.json` without changing components:

- `mission`: exact approved mission, shared by Home and About.
- `events` / `pastEvents`: arrays of `{ "title": "...", "date": "human-readable confirmed date", "location": "...", "description": "...", "url": "https://..." }`. An empty array displays an honest pending state. Keep chronological ordering manually.
- `officers`: `{ "name": "...", "role": "...", "photo": "/officers/name.webp", "email": "" }`. Photos live under `public/officers/`; leave optional photo/email empty until approved. Add descriptive alt text if needed for a specific image.
- `stats`: verified `value` and `label` pairs. Replace dashes only with documented totals; remove the homepage TODO after verification.
- `email`, `signupUrl`, `socials` (`{ "label": "...", "url": "https://..." }`): empty values show pending labels instead of broken links or fake forms. Use trusted HTTPS links. Footer social TODO must also be removed when links are added.
- `meeting`: confirmed meeting schedule and location.
- `links`: official resource links. `activities`: shared activity card and detail copy.
- `pathways`: homepage audience cards with `audience`, `title`, `description`, `action`, and internal `page` slug. `faqs`: homepage disclosure items with `question` and `answer`; keep answers aligned with confirmed club information.

Editorial text lives in `src/pages/[page].astro`; the homepage is `src/pages/index.astro`. Navigation, metadata, footer, and disclaimers live in `src/layouts/Layout.astro`. All remaining placeholder text is searchable with `rg TODO src README.md CREDITS.md`.

## Logo, colors, and design

`public/logo.png` is the provided attachment, used because the original repository had no logo file. No placeholder logo was needed. Keep it square and preserve its proportions. `public/logo.webp` is a 640px optimized derivative for the hero; `public/favicon.png` is a 64px derivative. Regenerate both when replacing the source logo; update the metadata image if its filename changes. Confirm rights before replacing or publishing assets.

Colors were sampled from the supplied logo's most frequent saturated pixels: navy `#022954` and orange `#FD5612`. They are defined in `src/styles/global.css` along with `--dark-orange: #AE3707` for accessible orange-toned text. Bright logo orange is decorative; primary buttons use navy and white. Body and heading typography use system sans-serif fonts, avoiding font downloads. Original CSS orbital lines echo the logo without introducing prohibited imagery. There are no stock photos.

Sticky navigation includes an accessible mobile toggle, Escape dismissal, visible keyboard focus, and a skip link. Animation is limited to subtle hover feedback and respects reduced-motion preferences. Lighthouse target is 90+; it is a target, not an asserted measured score.

## GitHub Pages deployment

The default branch is `main`. `.github/workflows/deploy.yml` installs with `npm ci`, builds, runs content/link checks, uploads `dist`, and deploys through GitHub Pages. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. Ensure Actions and the `github-pages` environment are allowed. Each push to main deploys; the workflow can also run manually.

Target URL: https://duhdubnub.github.io/soil-website/

`astro.config.mjs` sets `site: 'https://duhdubnub.github.io'`, `base: '/soil-website'`, and trailing slashes. Internal links and assets share this base. The workflow uses the default branch without force pushes.

### Switch to a custom domain

1. Configure the custom domain in repository Settings → Pages and add the DNS records GitHub specifies; enable HTTPS once available.
2. Set Astro `site` to the full custom-domain origin and `base` to `/`.
3. Add `public/CNAME` containing only the domain, if required by your Pages setup.
4. Update the base-path expectation in `scripts/check-site.mjs`, and update this README's URLs.
5. Rebuild and verify links, canonical URLs, Open Graph image URLs, and the deployed HTTPS site.

## Complete TODO / publication checklist

No names, schedules, impact totals, emails, awards, or testimonials were invented.

- [ ] Confirm logo ownership/usage rights; source is the user-supplied attachment.
- [ ] Supply and verify upcoming event titles, dates, locations, descriptions, and optional registration links (`events`, Home and Events pending labels).
- [ ] Supply verified past events (`pastEvents`, Events archive placeholder).
- [ ] Confirm meeting time and location (`meeting`, Events and Get Involved).
- [ ] Add approved external sign-up form URL (`signupUrl`, Get Involved).
- [ ] Confirm joining requirements, volunteer onboarding, and eligibility restrictions (Get Involved).
- [ ] Replace officer name/role placeholders, complete roster, and optionally add approved email addresses (Team).
- [ ] Obtain photo consent before adding any officer or event images; replace consented-photo placeholder (Team).
- [ ] Supply public club email and verified social profiles (`email`, `socials`, Contact and footer).
- [ ] Verify impact totals for competitions supported, volunteer hours, and teams mentored (`stats`, Home). Remove the impact TODO once supported by evidence.
- [ ] Supply verified founding history and milestones (About).
- [ ] Confirm alumni and educator connection process (Alumni & Network).
- [ ] Confirm current Science Olympiad membership status and permission before adding its official logo. Slots are reserved alongside the SOIL logo in About and footer; do not add the logo prematurely. Use an unaltered, undistorted approved asset with required clear space.
- [ ] Confirm exact Science Olympiad trademark notice wording (footer, Legal).
- [ ] Confirm any sanctioned hosting or chapter status before adding such claims. Current wording only describes supporting/helping run competitions.
- [ ] Add any future assets and licenses to both `CREDITS.md` and Legal & Credits.
- [ ] Confirm Pages Actions setting and successful first deployment.
- [ ] Run a production Lighthouse audit and keyboard/mobile accessibility review before treating the 90+ performance/accessibility target as achieved.

## Legal and credits

See `LICENSE` (MIT for source code only), `CREDITS.md`, and `/legal/`. The code license excludes the club logo, photographs, and trademarks. No official university or national organization logos are included. The site carries the requested independence and trademark disclaimers. Rules manuals, event rules, and tests are linked through official organizations rather than reproduced.
