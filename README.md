# Precious Memoirs

A controlled rebrand of the existing Next.js Event Studio into a bridal boutique and personalised gifting demo for **Precious Memoirs, Block 8, Gaborone, Botswana**. Existing page structures, GSAP reveals, collection-card motion, six-step studio, management workspace, quotation editor, PDF exports, calendar and localStorage persistence are retained.

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

Explore Collection opens five fictional gowns: Seraphina, Aurelia, Celeste, Vivienne and Elara. Choose a gown and request a consultation. Personalise a Gift opens the existing studio for robes, champagne flutes, slippers, gift boxes and bridal hangers. Names, lettering, text/product colours, motifs and quantity update a live original 2D preview.

Use **Load Example** for fictional contact details. Submit a request, open it in Studio Manager, review its details or change status, create a quotation, enter a business-approved price in BWP, export a PDF, mark accepted and confirm the order in the retained calendar. Dashboard counters and linked customers update. No advertised product prices are prefilled. `On request` means pricing is unconfirmed, never a free product.

Routes remain `/collections`, `/collections/seraphina` (and the other four names), `/gallery`, `/studio`, `/studio/review`, `/enquiry/success/[id]` and `/admin` with enquiries, quotations, bookings, calendar, clients, packages, analytics and settings. Original collection URLs remain compatibility aliases. Existing management URLs are retained with rebranded labels.

## Assets and remaining work

The homepage uses three original free Pexels 3840×2160 wedding videos already included in the repository, with credited sources in `public/videos/manifest.json` and CREDITS.md. Mobile retains smaller video variants. Rotation, crossfades, pause/resume, offscreen suspension and reduced-motion posters are preserved. These are stock inspiration, not business footage.

Playfair Display and Montserrat are hosted locally with their SIL OFL licences. The wordmark is text because the referenced WhatsApp logo screenshot was not supplied. Five distinct gowns now use AI-generated editorial images, and the robe preview uses an AI-generated satin product cutout with live name, colour and motif overlays. All five gifts now have AI-generated product bases, with live colour, name and decorative overlays. These are fictional demonstration products, not actual inventory. The gallery, collection cards, style references and studio are populated with the new bridal assets instead of the original floral imagery. WebP assets are approximately 93–198 KB each; generated originals remain outside the checkout. The original GSAP setup remains, extended with frame reveals and additional editorial sections. The hero now requests native muted looping 4K autoplay on all viewport sizes, including when data-saving or reduced-motion preferences are present; CSS movement still respects reduced motion. Video files are progressive fast-start MP4 containers with identical original 4K video packets. No pages were removed. Added sections include the generated gift collection, boutique editorial, bridal process and FAQ. Selected style themes visibly change the customiser composition.

Products and names are fictional, with no confirmed inventory, advertised prices or appointment availability. The request demo stores data only in this browser/origin, using a separate Precious Memoirs storage key without deleting old application data. No email, WhatsApp messaging, payment, authentication or cross-device database integration is connected. Use fictional information. Backup/reset controls remain available. The server-only MongoDB adapter is an unused integration foundation, not a live backend.

Original template HTML, LICENSE and historical credits are retained for provenance. See CREDITS.md for asset attribution. The social card and icon now use the Precious Memoirs text identity. Deployment settings and application architecture remain unchanged.
