# Precious Memoirs

An interactive gift-customisation and bridal-enquiry concept for **Precious Memoirs, Block 8, Gaborone, Botswana**, built on the existing Next.js Event Studio. The six-step studio, browser persistence, quotation editor, PDF export and demonstration manager remain connected. See [CONCEPT-READINESS.md](CONCEPT-READINESS.md) for the scope and real-launch prerequisites.

## Development

Requires Node 20.9+ and npm. The cloud machine currently uses Node 24.

```sh
cd /workspace/memoirs
npm ci --cache /workspace/.npm-cache
npm run dev
```

No credentials, database or paid infrastructure are required. Each cloud task is already isolated; use this existing checkout without creating a worktree. Live servers must restart in new tasks.

```sh
npm run typecheck
npm run lint
npm test
npm run build
# With the development server running and installed system Chromium:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

On another machine, `npx playwright install chromium` installs the default Playwright browser. Production startup is `npm run build` followed by `npm start`.

## Demo workflow

Explore Collection opens five fictional gowns: Seraphina, Aurelia, Celeste, Vivienne and Elara. Choose a gown and request a consultation. Personalise a Gift opens the existing studio for robes, champagne flutes, slippers, gift boxes and bridal hangers. Names, lettering, text/product colours, motifs and quantity update the generated-product preview. Bridal consultations show the selected gown beside a separate material-and-colour style reference.

Use **Load Example** for fictional contact details. Submit a request, open it in Studio Manager, review its details or change status, create a quotation, enter a business-approved price in BWP, export a PDF, mark accepted and confirm the order in the retained calendar. Dashboard counters and linked customers update. No advertised product prices are prefilled. `On request` means pricing is unconfirmed, never a free product.

Routes remain `/collections`, `/collections/seraphina` (and the other four names), `/gallery`, `/studio`, `/studio/review`, `/enquiry/success/[id]` `/privacy` and `/admin` with enquiries, quotations, bookings, calendar, clients, packages, analytics and settings. Original collection URLs remain compatibility aliases. Existing management URLs are retained with rebranded labels.

## Assets and remaining work

The separate hero uses the three credited Pexels 3840×2160 wedding videos in `public/videos/manifest.json`. It requests muted, looping 4K playback on all viewport sizes, pauses offscreen, and has pause/resume controls. CSS movement respects reduced motion. The original video packets were preserved in progressive fast-start MP4 containers.

The three category panels use new AI-image-based editorial motion clips: bridal detail, gifting and a getting-ready scene. They are 12-second 720×1280 camera-motion loops, not newly filmed stock footage. Their details are recorded in `public/videos/category-manifest.json`. Generated WebP product images, runway cutouts and a six-panel styling moodboard are hosted locally.

Playfair Display and Montserrat are hosted locally with SIL OFL licences. The text wordmark is provisional because no official logo asset was supplied. All gown names, product images and styling references are demonstrative rather than confirmed inventory. See CREDITS.md for provenance.

Products and names are fictional, with no confirmed inventory, advertised prices or appointment availability. The request demo stores data only in this browser/origin, using a separate Precious Memoirs storage key without deleting old application data. No email, WhatsApp messaging, payment, authentication or cross-device database integration is connected. Use fictional information. Backup/reset controls remain available. The server-only MongoDB adapter is an unused integration foundation, not a live backend.

Original template HTML, LICENSE and historical credits are retained for provenance. See CREDITS.md for asset attribution. The social card and icon now use the Precious Memoirs text identity. Deployment settings and application architecture remain unchanged.

## Current presentation

- The collection index and homepage bridal edit use a depth runway adapted from the supplied Maison Vell reference. Drag, arrow controls, keyboard navigation or focused scrolling move a single progress value that drives the depth, numbering and paired-product rail. Ordinary page scrolling remains available; the rail moves below the runway on phones.
- Three full-height video categories use vertical titles, staggered reveals and hover zoom, with playback suspended offscreen.
- A simple homepage keepsake preview carries the entered name and selected gift into the studio.
- The compact gallery uses layered reveals, gentle organic frame movement and magnetic hover. Motion pauses offscreen.
- The gift cylinder is a slow decorative autoplay display with layered front/back cards. It has no drag, step or pause controls. Its slow automatic rotation continues under reduced-motion preferences as expressly requested; it pauses when offscreen or the tab is hidden.
- The FAQ remains. The invitation, boutique chapter, bridal process and closing slogan were removed from the homepage.
- The footer links to collections, inspiration, the studio, saved briefs, current privacy/data information and the demonstration workspace. The privacy page explains this browser-only concept; it is not a final business privacy policy.

The supplied examples were adapted as scoped React components and CSS, without adding Tailwind, WebGL or new runtime dependencies. Gift requests omit unrelated bridal-party fields. Bridal preferences and notes update beside the two-image preview. Existing detail routes, quotations and manager functionality are retained.

The current proposed gift collection comprises a bridal morning set, bridesmaid proposal box, engraved champagne duo, pearl jewellery keepsake and monogrammed satin robe. New generated transparent product images support live lettering previews. The homepage inspiration edit uses distinct accessory, bridal-party and stationery scenes. These are proposed concepts, not business-confirmed stock. Category camera movement is halved from the previous loops.
