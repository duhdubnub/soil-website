# soil-website

Science Olympiad at Illinois (SOIL): a responsive, single-page Astro + Tailwind website. The original repository title is retained above.

## Local setup

Install Node.js 24 LTS, matching the GitHub Actions workflow.

```sh
npm ci
npm run dev
```

Open the exact URL printed by Astro, normally http://127.0.0.1:4321/soil-website/ . If that port is occupied, Astro selects another port. To request port 4322, use `npm run dev -- --port 4322`.

```sh
npm run build
npm test
npm run preview
```

The build emits **one** HTML page. There are no Events, standalone About/What We Do, or Legal & Credits routes. The six sections appear in order: `#home`, `#about`, `#team`, `#network`, `#join`, `#contact`.

## Edit content

All recurring editable content lives in `src/data/site.json`:

- `mission`: exact approved text, displayed in both Hero and About.
- `about`: introductory Science Olympiad explanation, independent RSO identity, story, and founding-history TODO.
- `activities`: the four About cards, with `title`, `tag`, `icon` (display number), and `description`. Keep descriptions accurate; SOIL supports/helps run competitions.
- `officers`: array of `{ "name": "...", "role": "...", "photo": "/officers/name.webp", "email": "" }`. Put approved images in `public/officers/`. Local paths begin with `/` and automatically receive the deployment base path. Optional photo and email may remain empty. Obtain consent before publication.
- `meeting`: confirmed meeting time and location, displayed under Join.
- `signupUrl`: approved external HTTPS form URL. Empty means a clearly labeled pending notice, not a broken button.
- `email`: approved public club email. Empty means a pending notice.
- `socials`: array of `{ "label": "...", "url": "https://..." }`, shared by Contact and footer. Empty means a pending notice.
- `links`: official national and state Science Olympiad resources, displayed under Network.
- `network`: alumni and educator copy, plus connection-process TODO.
- `join`: volunteer overview, interest-based introduction, and onboarding TODO.
- `stats`: retained for future verified impact figures; not rendered. An impact strip is optional and currently omitted. Do not publish unsupported numbers.

Each section has a component in `src/components/sections/`; `src/pages/index.astro` assembles them. `src/layouts/Layout.astro` owns metadata, navigation, the footer, and scrolling behavior. Styling is in `src/styles/global.css`. There are no other page files or tab interfaces.

## Logo, colors, and design

`public/logo.png` is the original supplied club logo. `public/logo.webp` is a 640px optimized derivative for the hero; `public/favicon.png` is a 64px derivative used in the favicon, navbar, and footer. When replacing the source logo, regenerate both derivatives without changing proportions and confirm usage rights.

Colors sampled from the supplied logo are navy `#022954` and orange `#FD5612`. The CSS theme and variables define both. Orange is decorative; accessible orange-toned text uses `#AE3707`. Navy and white form the primary button contrast. Typography uses the visitor's system sans-serif fonts with bolder headings; no font files are downloaded.

The original orbital hero and clear section hierarchy take inspiration from Georgia Tech, while the composition and assets remain SOIL's own. White/off-white, light tint, and navy alternate through the six sections. No external reference photos, logos, code, or layouts are copied. The logo remains the visual focal point.

## Navigation and accessibility

- Sticky anchor navigation: Home, About, Team, Network, Join, Contact.
- Native anchor links update the URL hash, work without JavaScript, and use `scroll-margin-top` to clear the header.
- Scroll spy sets `aria-current="location"` as the active section changes without adding history entries on manual scroll.
- The mobile menu closes after selecting a link or pressing Escape; Escape returns focus to its toggle. Moving to a desktop viewport clears mobile state.
- One H1, named section landmarks, image alt text, visible keyboard focus, skip-to-content link, and a persistent back-to-top link.
- Subtle off-screen reveal transitions; initial content remains visible. Reduced motion disables smooth scrolling and reveals, including when the preference changes during a visit. All content remains visible without JavaScript.
- No analytics, cookies, backend, or contact submission storage.

`npm test` validates exactly one output page, six sections in the required order, working anchor targets and asset paths, duplicate IDs, mission text twice, naming restrictions, notices, metadata, and navigation markup. Browser interaction checks and Lighthouse are separate from these structural checks. Target Lighthouse scores are 90+; do not treat that target as a measured result.

## GitHub Pages deployment

The default branch is `main`. `.github/workflows/deploy.yml` runs `npm ci`, `npm run build`, and `npm test`, then uploads `dist` and deploys to Pages. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**. Actions and the `github-pages` environment must be allowed. After enabling Pages, rerun a failed workflow or push a new commit.

Target URL: https://duhdubnub.github.io/soil-website/

`astro.config.mjs` sets `site: 'https://duhdubnub.github.io'`, `base: '/soil-website'`, and trailing slashes. Navigation uses local hashes; static assets and metadata use the configured base.

### Switch to a custom domain

1. Set the domain in repository Settings → Pages and configure the DNS records GitHub specifies. Enable HTTPS once available.
2. Change Astro `site` to the custom-domain origin and `base` to `/`.
3. Add `public/CNAME` containing only the domain if required by the Pages setup.
4. Update the asset-base expectation in `scripts/check-site.mjs` and the URLs in this README.
5. Rebuild and check assets, all six hashes, canonical and Open Graph URLs, and the deployed HTTPS site.

## Full TODO and open legal items

No names, dates, emails, impact totals, awards, or testimonials have been invented.

- [ ] Confirm ownership and usage rights for the supplied club logo.
- [ ] Supply verified founding history and milestones (`about.historyTodo`).
- [ ] Replace officer name and role placeholders and complete the roster (`officers`).
- [ ] Obtain consent for photos and replace the labeled officer-photo placeholder; confirm permission before publishing optional officer emails (Team).
- [ ] Confirm the alumni and educator connection process (`network.todo`).
- [ ] Supply an approved external sign-up form (`signupUrl`, Join).
- [ ] Confirm meeting time and location (`meeting`, Join).
- [ ] Confirm joining requirements, volunteer onboarding, and any eligibility restrictions (`join.todo`).
- [ ] Supply the public club email (`email`, Contact).
- [ ] Supply verified social links (`socials`, Contact and footer).
- [ ] Confirm current Science Olympiad membership and logo permission before filling the reserved footer slot. Use an approved, unaltered, undistorted official asset with required clear space alongside the SOIL logo.
- [ ] Confirm the exact Science Olympiad trademark notice wording (footer).
- [ ] Confirm sanctioned hosting or chapter status before making such claims. Current wording only says supports/helps run competitions.
- [ ] Record every future third-party asset and its license in `CREDITS.md`; no legal or credits page is published.
- [ ] Verify impact figures before adding an optional stats strip; the retained stats data is not displayed.
- [ ] Enable Pages with GitHub Actions and verify deployment.
- [ ] Complete a production Lighthouse audit and keyboard/mobile review before claiming the 90+ target or full accessibility conformance.

Search all content placeholders with `rg TODO src README.md CREDITS.md`.

## Legal and credits

See `LICENSE` (MIT for code only) and `CREDITS.md`. The code license excludes logos, photographs, and trademarks. No official university or national Science Olympiad logos are currently displayed. Required independence and trademark notices remain in the footer. Official resources are linked instead of reproducing rules manuals, event rules, or tests.
