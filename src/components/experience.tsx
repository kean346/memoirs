"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Menu,
  X,
  Plus,
  Download,
  Flower2,
  CalendarDays,
  LayoutDashboard,
  Inbox,
  FileText,
  Users,
  SlidersHorizontal,
  BarChart3,
  Settings,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Config,
  Data,
  Quote,
  Item,
  initial,
  example,
  occasions,
  styles,
  estimate,
  totals,
  money,
  seed,
  submit,
  uid,
  createQuote,
  confirmBooking,
  configSchema,
} from "@/lib/model";
import { exportPDF } from "@/lib/pdf";
import VideoHero from "./video-hero";
import RunwayLookbook from "./runway-lookbook";
import GiftCylinder from "./gift-cylinder";
import VideoCategories from "./video-categories";
import StyleReference, { styleBackgroundPosition } from "./style-reference";
import { useInView } from "./showcase-hooks";
import GiftPreview, { giftImages } from "./gift-preview";
import {
  gowns,
  gifts,
} from "@/lib/catalogue";
const KEY = "precious-memoirs-v1";
const image = (i: number) => i >= 6 ? ["/images/inspiration-accessories.webp", "/images/inspiration-party.webp", "/images/inspiration-stationery.webp"][i - 6] : i % 6 === 5 ? "/images/bridal-robe.webp" : "/images/gown-" + (i % 5) + ".webp";
const categories = gowns;
const slugs = ["seraphina", "aurelia", "celeste", "vivienne", "elara"];
const descriptions = [
  "Classic satin. A sculptural silhouette for a timeless entrance.",
  "Romantic lace. Delicate details for your unforgettable day.",
  "Modern minimalism. Quiet confidence, beautifully expressed.",
  "Statement bridal. A celebration of presence and individuality.",
  "Soft elegance. Effortless movement and considered detail.",
];
const occasionDescriptions = ["Explore a fictional gown and request a bridal consultation.", "Create a personalised bridal gift and request a quotation."];
const collectionImage = (i: number) => "/images/gown-" + i + ".webp";
// Extend the demo catalogue without rewriting historical enquiries or quotations.
function currentGiftCatalogue(data: Data): Data {
  gifts.forEach(name => { if (!data.packages.some(p => p.name === name)) data.packages.push({ name, price: 0, enabled: true }); });
  return data;
}
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}
function Modal({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => prev?.focus();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      aria-label={title}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button onClick={close} aria-label="Close dialog">
          <X size={20} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function Experience() {
  const path = usePathname(),
    searchParams = useSearchParams(),
    router = useRouter();
  const [data, setData] = useState<Data | null>(null),
    [config, setConfig] = useState<Config>(initial),
    [notice, setNotice] = useState(""),
    [menu, setMenu] = useState(false),
    [tour, setTour] = useState(false),
    [reset, setReset] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      setData(currentGiftCatalogue(raw ? JSON.parse(raw) : seed()));
      const draft = localStorage.getItem(KEY + "-draft");
      const saved = draft ? { ...initial, ...JSON.parse(draft) } : { ...initial };
      if (new URLSearchParams(window.location.search).get("request") === "gift") saved.occasion = "Personalised Gift";
      if (saved.product === "Monogrammed satin robe") { saved.product = "Satin bridal robe"; saved.message = ""; saved.motif = "None"; }
      if (!gifts.includes(saved.product)) saved.product = initial.product;
      setConfig(saved);
    } catch {
      setData(seed());
      setNotice(
        "Stored demo could not be read. A fresh sample has been loaded.",
      );
    }
    const sync = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setData(currentGiftCatalogue(JSON.parse(e.newValue)));
        } catch {
          setNotice("Unable to read another tab's changes.");
        }
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (path === "/studio" && searchParams.get("request") === "bridal") setConfig(current => ({ ...current, occasion: "Bridal Consultation" }));
    if (path === "/studio" && searchParams.get("request") === "gift") {
      const product = searchParams.get("product");
      setConfig(current => ({ ...current, occasion: "Personalised Gift", ...(product && gifts.includes(product) ? { product } : {}) }));
    }
  }, [path, searchParams]);
  const updateConfig = (patch: Partial<Config>) => {
    const next = { ...config, ...patch };
    if (next.occasion === "Personalised Gift" && next.product === "Satin bridal robe") { next.message = ""; next.motif = "None"; }
    setConfig(next);
    try {
      localStorage.setItem(KEY + "-draft", JSON.stringify(next));
    } catch {
      setNotice("Draft could not be saved. Browser storage is unavailable.");
    }
  };
  const mutate = (fn: (d: Data) => void, message: string) => {
    if (!data) return false;
    try {
      const stored = localStorage.getItem(KEY);
      const next: Data = currentGiftCatalogue(structuredClone(stored ? JSON.parse(stored) : data));
      fn(next);
      next.revision++;
      next.activity.unshift({
        id: uid("ACT"),
        text: message,
        at: new Date().toISOString(),
      });
      localStorage.setItem(KEY, JSON.stringify(next));
      setData(next);
      setNotice(message);
      return true;
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : "Could not save. Please retry.",
      );
      return false;
    }
  };
  const load = () => {
    updateConfig(example);
    setNotice("Fictional example loaded. Your draft is saved in this browser.");
    router.push("/studio");
  };
  const admin = path.startsWith("/admin");
  useEffect(() => {
    setMenu(false);
  }, [path]);
  if (!data)
    return (
      <main className="loading">
        <Flower2 />
        <p>Opening the studio…</p>
      </main>
    );
  const nav = (
    <>
      <Link href="/collections">Collections</Link>
      <Link href="/gallery">Our inspiration</Link>
      <Link href="/studio">The Bridal Studio</Link>
    </>
  );
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      {admin ? (
        <div className="manager">
          <aside className="sidebar">
            <Link className="brand" href="/">
              Precious<span>MEMOIRS</span>
            </Link>
            <p className="eyebrow">STUDIO MANAGER</p>
            {[
              ["", "Overview", LayoutDashboard],
              ["enquiries", "Bridal Enquiries", Inbox],
              ["quotations", "Gift Quotations", FileText],
              ["bookings", "Orders", Flower2],
              ["calendar", "Calendar", CalendarDays],
              ["clients", "Customers", Users],
              ["packages", "Products", SlidersHorizontal],
              ["analytics", "Analytics", BarChart3],
              ["settings", "Settings", Settings],
            ].map(([url, label, Icon]) => {
              const I = Icon as typeof Menu;
              return (
                <Link
                  key={String(url)}
                  className={
                    path === "/admin" + (url ? "/" + url : "") ? "active" : ""
                  }
                  href={"/admin" + (url ? "/" + url : "")}
                >
                  <I size={17} />
                  {String(label)}
                </Link>
              );
            })}
            <div className="sidebar-bottom">
              <Link href="/">← Public experience</Link>
              <small>
                Sample-only workspace
                <br />
                Stored in this browser
              </small>
            </div>
          </aside>
          <div className="manager-main">
            <header className="manager-top">
              <span>
                THE BRIDAL STUDIO <span className="muted">/ Management</span>
              </span>
              <span className="badge">DEMO WORKSPACE</span>
            </header>
            <main id="main">
              <Admin
                path={path}
                data={data}
                mutate={mutate}
                reset={() => setReset(true)}
              />
            </main>
          </div>
        </div>
      ) : (
        <>
          <header className={"site-nav" + (path === "/" ? " cinema-nav" : "")}>
            <Link className="brand" href="/">
              Precious<span>MEMOIRS</span>
            </Link>
            <nav aria-label="Main navigation">{nav}</nav>
            <Link className="nav-cta" href="/studio">
              Request a consultation <ArrowUpRight size={16} />
            </Link>
            <button
              className="mobile-toggle"
              aria-label="Toggle navigation"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </header>
          {menu && (
            <nav
              className={
                "mobile-nav" + (path === "/" ? " cinema-mobile-nav" : "")
              }
            >
              {nav}
              <Link href="/admin">Studio Manager</Link>
            </nav>
          )}
          <main id="main">
            {path === "/" ? (
              <Home configure={updateConfig} />
            ) : path === "/privacy" ? (
              <PrivacyInformation />
            ) : path.startsWith("/collections") ? (
              <Collections path={path} data={data} configure={updateConfig} />
            ) : path === "/gallery" ? (
              <Gallery />
            ) : path.startsWith("/studio") ? (
              <Studio
                config={config}
                update={updateConfig}
                data={data}
                load={load}
                mutate={mutate}
              />
            ) : path.startsWith("/enquiry/success/") ? (
              <Success id={path.split("/").pop()!} data={data} />
            ) : (
              <section className="page-title">
                <h1>A little off the beaten path.</h1>
                <Link className="button" href="/">
                  Return home
                </Link>
              </section>
            )}
          </main>
          <footer className="professional-footer">
            <div className="footer-main"><div className="footer-brand-block"><Link className="brand" href="/">Precious<span>MEMOIRS</span></Link><p>Bridal elegance.<br />A more personal kind of gifting.</p><span>BLOCK 8 · GABORONE · BOTSWANA</span></div><nav aria-label="Footer collections"><h2>Discover</h2><Link href="/collections">The bridal edit</Link><Link href="/gallery">Inspiration gallery</Link><Link href="/#questions">Thoughtful answers</Link></nav><nav aria-label="Footer personalisation"><h2>Make it personal</h2><Link href="/studio?request=gift">Personalise a keepsake</Link><Link href="/studio?request=bridal">Bridal consultation</Link><Link href="/studio/review">Review your saved brief</Link></nav><div className="footer-enquiry"><h2>Your next precious moment.</h2><p>Tell us what you have in mind.<br />Final details and availability are confirmed on enquiry.</p><Link href="/studio">Start your brief <ArrowUpRight size={16} /></Link></div></div>
            <div className="footer-bottom"><span>© 2026 Precious Memoirs</span><Link href="/privacy">Privacy & data</Link><button onClick={() => setTour(true)}>Demo walkthrough</button><Link href="/admin">Demo workspace</Link><span>Concept: <a href="https://paceit.co.za">paceIT</a> · Design inspiration: <a href="https://8b.com">8B</a></span></div><p className="footer-demo-note">Concept demonstration · Generated product imagery · Requests currently stay in this browser</p>
          </footer>
        </>
      )}
      {!tour ? (
        <button className={"tour-launch" + (!admin ? " tour-launch-marketing" : "")} onClick={() => setTour(true)}>
          Explore the Experience <ArrowUpRight size={16} />
        </button>
      ) : (
        <div className="tour">
          <span className="eyebrow">
            A MEMORY, FROM IDEA TO CONFIRMED ORDER
          </span>
          <p>Design → Enquire → Quote → Accept → Book → Calendar</p>
          <div>
            <button onClick={load}>Load Example</button>
            <button
              onClick={() =>
                router.push(
                  path === "/"
                    ? "/studio"
                    : path.startsWith("/studio")
                      ? "/admin/enquiries"
                      : path.startsWith("/admin/enquiries")
                        ? "/admin/quotations"
                        : "/admin/calendar",
                )
              }
            >
              Next Demo Step <ArrowRight size={14} />
            </button>
            <button onClick={() => setReset(true)}>Reset Demo</button>
            <button onClick={() => setTour(false)}>Exit Walkthrough</button>
          </div>
          <small>
            Submit the example, then open its enquiry to create your quotation.
          </small>
        </div>
      )}
      <div role="status" aria-live="polite" className={notice ? "toast" : ""}>
        {notice && (
          <>
            <span>{notice}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
      {reset && (
        <Modal title="Reset this demo?" close={() => setReset(false)}>
          <p>
            This removes this browser’s enquiries, quotations, bookings and
            saved draft, and restores fictional sample data.
          </p>
          <div className="actions">
            <button onClick={() => setReset(false)}>Keep my progress</button>
            <button
              className="button"
              onClick={() => {
                try {
                  const fresh = seed();
                  localStorage.setItem(KEY, JSON.stringify(fresh));
                  localStorage.removeItem(KEY + "-draft");
                  setData(fresh);
                  setConfig(initial);
                  setReset(false);
                  setNotice("Demo reset to fictional sample data.");
                  router.push("/");
                } catch {
                  setNotice("Storage unavailable. Reset could not be saved.");
                }
              }}
            >
              Reset Demo
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
function PrivacyInformation() {
  return <section className="privacy-information"><p className="eyebrow">PRECIOUS MEMOIRS / CONCEPT DEMONSTRATION</p><h1>Privacy & data.</h1><p>This concept stores your draft, sample requests, quotations and settings in localStorage in this browser. It does not currently send enquiries to Precious Memoirs or save them in a business database.</p><h2>Your saved information</h2><p>Use fictional details while exploring. Data is specific to this browser and website address. You can export or reset demo records in Studio Manager settings, or clear this website’s storage in your browser.</p><h2>Images and product availability</h2><p>The collection uses generated demonstration imagery and licensed inspiration footage. Products, prices, appointments and availability require business confirmation.</p><h2>Before a real launch</h2><p>A business-approved privacy notice, secure staff access, server-backed request handling and working enquiry delivery are still required. This page explains the current demonstration; it is not the final business privacy policy.</p><Link className="text-link" href="/">Return to the collection <ArrowUpRight size={16} /></Link></section>;
}
function Home({ configure }: { configure: (c: Partial<Config>) => void }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) =>
          gsap.from(el, {
            y: 35,
            opacity: 0,
            duration: 0.9,
            scrollTrigger: { trigger: el, start: "top 90%" },
          }),
        );
        gsap.utils.toArray<HTMLElement>(".frame-reveal").forEach((el, i) => {
          gsap.from(el, { y: 60, opacity: 0, duration: 1, delay: (i % 5) * 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 94%", toggleActions: "play none none reverse" } });
        });
        gsap.utils.toArray<HTMLElement>(".fluid-gallery-item").forEach((el, i) => {
          gsap.from(el, { y: 90, opacity: 0, rotation: (i - 1) * 5, scale: .92, duration: 1.35, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 94%", toggleActions: "play none none reverse" } });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={root}>
      <VideoHero />
      <RunwayLookbook select={gown => configure({ occasion: "Bridal Consultation", gown, officialPackage: gown })} />
      <VideoCategories />
      <section className="section inspiration-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE INSPIRATION EDIT</p>
            <h2>
              A feeling, <em>in frames.</em>
            </h2>
          </div>
          <Link className="text-link" href="/gallery">
            Explore the gallery ↗
          </Link>
        </div>
        <Gallery compact />
      </section>
      <GiftCylinder />
      <section className="section bridal-faq" id="questions">
        <div><p className="eyebrow">BEFORE YOUR NEXT CHAPTER</p><h2 className="reveal">A few<br /><em>thoughtful answers.</em></h2></div>
        <div>{[
          ["Can I personalise a gift?", "Yes. Explore a bridal morning set, bridesmaid proposal box, champagne duo, pearl jewellery keepsake or satin bridal robe. Your lettering, product colour and decorative details appear in the studio preview."],
          ["Are these gowns available to buy?", "The gowns and product imagery are generated demonstration concepts. Confirm real stock, sizing and materials with Precious Memoirs before making plans."],
          ["How do I request a consultation?", "Select a gown and share your wedding date and preferences in the studio. This demonstration saves the request in this browser; it does not send an email or reserve a fitting."],
          ["Can I save my design?", "Your draft saves in this browser as you make changes. Completed demo requests appear in Studio Manager, with their personalisation details retained."],
          ["Where is Precious Memoirs?", "The business location supplied for this concept is Block 8, Gaborone, Botswana. Appointment times and directions require business confirmation."],
        ].map(([question, answer]) => <details key={question}><summary>{question}<Plus size={17} /></summary><p>{answer}</p></details>)}</div>
      </section>
    </div>
  );
}
function Collections({
  path,
  data,
  configure,
}: {
  path: string;
  data: Data;
  configure: (c: Partial<Config>) => void;
}) {
  const slug = path.split("/")[2];
  const legacy = ["romantic-proposals", "room-setups", "floral-arrangements", "balloon-styling", "heart-boxes", "bespoke-celebrations"];
  const index = slugs.includes(slug) ? slugs.indexOf(slug) : legacy.indexOf(slug) >= 0 ? Math.min(4, legacy.indexOf(slug)) : -1;
  if (!slug) return <RunwayLookbook page select={gown => configure({ occasion: "Bridal Consultation", gown, officialPackage: gown })} />;
  if (slug && index < 0)
    return (
      <section className="page-title">
        <h1>Collection not found.</h1>
        <Link href="/collections">Explore collections</Link>
      </section>
    );
  return (
    <>
      <section className="page-title">
        <p className="eyebrow">
          THE BRIDAL COLLECTION / FICTIONAL DEMONSTRATION GOWNS
        </p>
        <h1>
          {index >= 0 ? (
            categories[index]
          ) : (
            <>
              Every detail.
              <br />
              <em>Beautiful possibilities.</em>
            </>
          )}
        </h1>
        <p>
          {index >= 0
            ? descriptions[index]
            : "Find your starting point. We’ll make the details yours."}
        </p>
      </section>
      {(index >= 0 ? [index] : [0, 1, 2, 3, 4]).map((i) => (
        <section className="collection-detail section" key={i}>
          <img
            src={collectionImage(i)}
            alt={categories[i] + " inspiration"}
            loading="lazy"
          />
          <div>
            <p className="eyebrow">0{i + 1} / CURATED POSSIBILITIES</p>
            <h2>{categories[i]}</h2>
            <p>{descriptions[i]}</p>
            <p className="note">Fictional demonstration gown. AI-generated bridal imagery; not confirmed inventory.</p>
            <p className="price">Price on request</p>
            <small>Request a consultation to discuss availability, sizing and your wedding day.</small>
            <Link
              className="button"
              href="/studio"
              onClick={() =>
                configure({
                  occasion: "Bridal Consultation",
                  gown: gowns[i],
                  officialPackage: gowns[i],
                })
              }
            >
              Request a Consultation <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>
      ))}
    </>
  );
}
function Gallery({ compact = false }: { compact?: boolean }) {
  const { ref: fluidRef, visible: fluidVisible } = useInView<HTMLDivElement>(.05);
  const [filter, setFilter] = useState("All"),
    [open, setOpen] = useState<number | null>(null);
  const titles = [
    "Satin, sculpted in light",
    "The romance of lace",
    "Quiet modern elegance",
    "A statement to remember",
    "Softness in every fold",
    "A keepsake, made yours",
    "The finishing touches",
    "For your bridal party",
    "An invitation to remember",
  ];
  const indices = (compact ? [6, 7, 8] : [0, 1, 2, 3, 4, 5, 6, 7, 8]).filter(
    (i) =>
      filter === "All" || (filter === "Gowns" ? i < 5 : i >= 5),
  );
  return (
    <>
      {!compact && (
        <section className="page-title">
          <p className="eyebrow">
            ILLUSTRATIVE INSPIRATION / NOT BUSINESS PRODUCT PHOTOGRAPHY
          </p>
          <h1>
            A feeling,
            <br />
            <em>in frames.</em>
          </h1>
          <div className="filters">
            {["All", "Gowns", "Gifts"].map((f) => (
              <button
                aria-pressed={filter === f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
                key={f}
              >
                {f}
              </button>
            ))}
          </div>
        </section>
      )}
      <div ref={fluidRef} className={compact ? "fluid-gallery" + (fluidVisible ? " is-in-view" : "") : "gallery-grid section"}>
        {indices.map((i) => {
          const card = <button className={compact ? "gallery-card fluid-gallery-card" : "gallery-card"} key={i} onClick={() => setOpen(i)} onPointerMove={e => { if (!compact || e.pointerType === "touch") return; const bounds = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty("--magnetic-x", ((e.clientX - bounds.left) / bounds.width - .5) * 16 + "px"); e.currentTarget.style.setProperty("--magnetic-y", ((e.clientY - bounds.top) / bounds.height - .5) * 12 + "px"); }} onPointerLeave={e => { e.currentTarget.style.setProperty("--magnetic-x", "0px"); e.currentTarget.style.setProperty("--magnetic-y", "0px"); }}>
            <div className={compact ? "fluid-gallery-frame" : "gallery-photo"}><img src={image(i)} alt={titles[i]} loading="lazy" /></div><span><span className="eyebrow">INSPIRATION / 0{i + 1}</span><strong>{titles[i]}</strong><Plus size={18} /></span>
          </button>;
          return compact ? <div className="fluid-gallery-item" key={i}>{card}</div> : card;
        })}
      </div>
      {open !== null && (
        <Modal title={titles[open]} close={() => setOpen(null)}>
          <img className="modal-photo" src={image(open)} alt={titles[open]} />
          <p>
            AI-generated editorial inspiration. This fictional design is not confirmed Precious Memoirs inventory.
          </p>
          <div className="actions">
            <button onClick={() => setOpen((open + 8) % 9)}>← Previous</button>
            <button onClick={() => setOpen((open + 1) % 9)}>Next →</button>
            <Link
              className="button"
              href="/studio"
              onClick={() => setOpen(null)}
            >
              Create your experience
            </Link>
          </div>
        </Modal>
      )}
    </>
  );
}
type Mutate = (fn: (d: Data) => void, message: string) => boolean;
function Studio({
  config: c,
  update,
  data,
  load,
  mutate,
}: {
  config: Config;
  update: (c: Partial<Config>) => void;
  data: Data;
  load: () => void;
  mutate: Mutate;
}) {
  const router = useRouter(),
    path = usePathname();
  const [step, setStep] = useState(path.endsWith("/review") ? 5 : 0),
    [errors, setErrors] = useState<Record<string, string>>({}),
    [busy, setBusy] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const names = [
    "Request",
    "Style",
    "Personalisation",
    "Your date",
    "About you",
    "Review",
  ];
  const items = estimate(c, data.packages);
  const field = (key: keyof Config, label: string, type = "text") => (
    <Field label={label}>
      <input
        id={key}
        type={type}
        value={String(c[key])}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? key + "-error" : undefined}
        onChange={(e) =>
          update({
            [key]: key === "guests" ? Number(e.target.value) : e.target.value,
          })
        }
      />
      {errors[key] && (
        <small id={key + "-error"} className="error">
          {errors[key]}
        </small>
      )}
    </Field>
  );
  const validate = (all = false) => {
    const e: Record<string, string> = {};
    if (step === 3 || all) {
      if (!c.date || c.date < new Date().toISOString().slice(0, 10))
        e.date = "Choose today or a future date.";
      if (!c.time) e.time = "Choose a preferred time.";
      if (c.location.trim().length < 2)
        e.location = "Enter your venue or city.";
      if (!Number.isInteger(c.guests) || c.guests < 1)
        e.guests = "Enter at least one guest.";
    }
    if (step === 2 || all) {
      if (!Number.isInteger(c.quantity) || c.quantity < 1 || c.quantity > 500) e.quantity = "Enter a quantity from 1 to 500.";
    }
    if (step === 4 || all) {
      const parsed = configSchema.safeParse(c);
      if (!parsed.success)
        parsed.error.issues.forEach((i) => {
          if (["name", "email", "phone", "consent"].includes(String(i.path[0])))
            e[String(i.path[0])] =
              "Please enter a valid " + String(i.path[0]) + ".";
        });
    }
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() =>
        document.getElementById(Object.keys(e)[0])?.focus(),
      );
      return false;
    }
    return true;
  };
  const go = (next: number) => {
    setStep(next);
    if (next === 5) router.replace("/studio/review", { scroll: false });
    else if (path.endsWith("/review"))
      router.replace("/studio", { scroll: false });
    requestAnimationFrame(() => heading.current?.focus());
  };
  const send = () => {
    if (busy || !validate(true)) return;
    setBusy(true);
    let id = "";
    const ok = mutate((d) => {
      id = submit(d, c);
    }, "Enquiry saved. Your personalised brief is ready.");
    if (ok) router.push("/enquiry/success/" + id);
    else setBusy(false);
  };
  return (
    <section className="studio-page">
      <div className="studio-heading">
        <div>
          <p className="eyebrow">
            THE BRIDAL STUDIO / YOUR OWN PRECIOUS MEMORY
          </p>
          <h1>
            Let’s make it <em>yours.</em>
          </h1>
        </div>
        <button onClick={load}>
          Load Example <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="stepper" aria-label="Configuration progress">
        {names.map((n, i) => (
          <button
            key={n}
            className={step === i ? "active" : ""}
            onClick={() => {
              if (i < step || validate()) go(i);
            }}
          >
            <span>
              {i < step ? <Check size={14} /> : String(i + 1).padStart(2, "0")}
            </span>
            {n}
          </button>
        ))}
      </div>
      <div className="builder">
        <aside className="moodboard">
          {c.occasion === "Personalised Gift" ? <GiftPreview config={c} /> : <div className="bridal-preview-pair"><div className="moodboard-main"><img src={collectionImage(Math.max(0, gowns.indexOf(c.gown)))} alt={c.gown + " AI-generated demonstration image"} /><div><span className="eyebrow">YOUR BRIDAL CONSULTATION</span><h2>{c.gown}</h2></div></div><StyleReference style={c.style} /></div>}
          <div className="palette"><i style={{ background: c.productColour }} /><i style={{ background: c.textColour }} /><span>{c.style}</span></div>
          <div className="preview-request-details" aria-live="polite"><span>{c.occasion}</span>{c.date && <span>{c.date}{c.time ? " · " + c.time : ""}</span>}{c.name && <span>{c.name}</span>}{c.location && <span>{c.location}</span>}</div>
          {c.occasion === "Bridal Consultation" && c.message && <p className="preview-request-note"><b>Preferences</b>{c.message}</p>}
          {c.notes && <p className="preview-request-note"><b>Your note</b>{c.notes}</p>}
          <small>Fictional demonstration products. AI-generated imagery; final materials and availability require confirmation.</small>
        </aside>
        <div className="builder-controls">
          <p className="eyebrow">STEP 0{step + 1} / 06</p>
          <h2 ref={heading} tabIndex={-1}>
            {
              [
                "What can we make precious?",
                "Find your feeling.",
                "The details make it yours.",
                "Save your date.",
                "A little about you.",
                "Your moment, considered.",
              ][step]
            }
          </h2>
          <div className="step-content" key={step}>
            {step === 0 && (
              <>
                <div className="option-list">
                  {occasions
                    .filter(
                      (o) => data.packages.find((p) => p.name === o)?.enabled,
                    )
                    .map((o, i) => (
                      <button
                        key={o}
                        aria-pressed={c.occasion === o}
                        className={
                          c.occasion === o ? "option selected" : "option"
                        }
                        onClick={() =>
                          update({
                            occasion: o,
                            officialPackage: "",
                            extras: [],
                          })
                        }
                      >
                        <span>
                          <strong>{o}</strong>
                          <small>{occasionDescriptions[i]}</small>
                        </span>
                        {c.occasion === o ? (
                          <Check size={19} />
                        ) : (
                          <ArrowUpRight size={19} />
                        )}
                      </button>
                    ))}
                </div>
                <Field label={c.occasion === "Personalised Gift" ? "Gift product" : "Selected gown"}>
                  <select value={c.occasion === "Personalised Gift" ? c.product : c.gown} onChange={e => update(c.occasion === "Personalised Gift" ? { product: e.target.value } : { gown: e.target.value })}>
                    {(c.occasion === "Personalised Gift" ? gifts.filter(g => data.packages.find(p => p.name === g)?.enabled) : gowns).map(name => <option key={name}>{name}</option>)}
                  </select>
                </Field>
                <p className="note">Demonstration collection. No confirmed inventory or advertised prices. All requests stay in this browser.</p>
              </>
            )}
            {step === 1 && (
              <div className="style-options">
                {styles.map((s) => (
                  <button
                    key={s}
                    aria-pressed={c.style === s}
                    className={
                      "style-option " + (c.style === s ? "selected" : "")
                    }
                    onClick={() => update({ style: s })}
                  >
                    <div className="style-option-reference" role="img" aria-label={s + " styling reference"} style={{ backgroundPosition: styleBackgroundPosition(s) }} />
                    <span>
                      {s}
                      {c.style === s && <Check size={15} />}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              c.occasion === "Personalised Gift" ? <>
                {c.product !== "Satin bridal robe" && <>
                <Field label="Personalised name or text"><input maxLength={40} value={c.message} onChange={e => update({ message: e.target.value })} /></Field>
                <Field label="Font style"><select value={c.lettering} onChange={e => update({ lettering: e.target.value })}>{["Playfair Display", "Montserrat", "Cursive"].map(font => <option key={font}>{font}</option>)}</select></Field>
                  <Field label="Text colour"><input type="color" value={c.textColour} onChange={e => update({ textColour: e.target.value })} /></Field>
                <Field label="Decorative motif"><select value={c.motif} onChange={e => update({ motif: e.target.value })}>{["None", "Heart", "Botanical"].map(m => <option key={m}>{m}</option>)}</select></Field>
                </>}
                  <Field label="Product colour"><input type="color" value={c.productColour} onChange={e => update({ productColour: e.target.value })} /></Field>

                <Field label="Quantity"><input id="quantity" aria-invalid={!!errors.quantity} aria-describedby={errors.quantity ? "quantity-error" : undefined} type="number" min={1} max={500} value={c.quantity} onChange={e => update({ quantity: Number(e.target.value) })} /></Field>
                {errors.quantity && <p id="quantity-error" className="error">{errors.quantity}</p>}
                <p className="note">Colour and selected details update in the preview. Finish and materials require confirmation.</p>
              </> : <>
                <p>Your selected gown: <strong>{c.gown}</strong>. Share sizing, fitting or accessory preferences with your bridal consultant.</p>
                <Field label="Bridal consultation preferences"><textarea value={c.message} maxLength={40} onChange={e => update({ message: e.target.value })} /></Field>
                <p className="note">Fictional gown names; no stock or fitting availability is implied.</p>
              </>
            )}
            {step === 3 && (
              <>
                <div className="form-grid">
                  {field("date", c.occasion === "Personalised Gift" ? "Required by date" : "Wedding date", "date")}
                  {field("time", "Preferred time", "time")}
                  {field("location", "Location / venue")}
                  {c.occasion === "Bridal Consultation" && <>
                  {field("guests", "Bridal party size", "number")}
                  <Field label="Venue type">
                    <select
                      value={c.venue}
                      onChange={(e) => update({ venue: e.target.value })}
                    >
                      <option>Indoor</option>
                      <option>Outdoor</option>
                      <option>To be confirmed</option>
                    </select>
                  </Field>
                  <Field label="Budget range">
                    <select
                      value={c.budget}
                      onChange={(e) => update({ budget: e.target.value })}
                    >
                      {[
                        "Let’s discuss",
                        "Please provide a quotation",
                      ].map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </Field>
                  </>}
                </div>
                <Field label="Additional notes">
                  <textarea
                    className="resize-none"
                    value={c.notes}
                    onChange={(e) => update({ notes: e.target.value })}
                  />
                </Field>
                <p className="note">
                  Your requested date is not confirmed availability. Consultations, fulfilment and delivery require business confirmation.
                </p>
              </>
            )}
            {step === 4 && (
              <>
                <p className="note">
                  This is a browser-only product demonstration. Use fictional
                  details only; nothing is emailed or sent to Precious Memoirs.
                </p>
                <div className="form-grid">
                  {field("name", "Full name")}
                  {field("email", "Email address", "email")}
                  {field("phone", "Phone / demo contact")}
                  <Field label="Preferred contact method">
                    <select
                      value={c.contact}
                      onChange={(e) => update({ contact: e.target.value })}
                    >
                      <option>Email</option>
                      <option>Phone</option>
                      <option>WhatsApp</option>
                    </select>
                  </Field>
                </div>
                {field(
                  "reference",
                  "Inspiration reference (optional text; no upload)",
                )}
                <label className="consent">
                  <input
                    id="consent"
                    type="checkbox"
                    checked={c.consent}
                    aria-invalid={!!errors.consent}
                    aria-describedby={
                      errors.consent ? "consent-error" : undefined
                    }
                    onChange={(e) => update({ consent: e.target.checked })}
                  />
                  I am using fictional details and understand this request stays
                  in this browser.
                </label>
                {errors.consent && (
                  <p className="error" id="consent-error">
                    Confirm sample-only use to continue.
                  </p>
                )}
              </>
            )}
            {step === 5 && (
              <>
                <Summary c={c} />
                <div className="review-total">
                  {items.map((i) => (
                    <p key={i.name}>
                      <span>{i.name}</span>
                      <span>{money(i.price * i.qty)}</span>
                    </p>
                  ))}
                  <p>
                    <span>Delivery / custom details</span>
                    <span>To be confirmed</span>
                  </p>
                </div>
                <button className="text-link" onClick={() => go(0)}>
                  Edit your experience ↗
                </button>
                {Object.keys(errors).length > 0 && (
                  <div className="error">
                    Your brief needs attention.{" "}
                    <button
                      onClick={() => go(errors.date || errors.location ? 3 : 4)}
                    >
                      Review missing details →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="estimate">
            <span>YOUR PERSONALISED REQUEST</span>
            <strong>Price on request</strong>
            <small>
              No prices are advertised in this demo. Precious Memoirs will confirm pricing and availability.
            </small>
          </div>
          <div className="actions builder-actions">
            <button disabled={step === 0} onClick={() => go(step - 1)}>
              ← Back
            </button>
            {step < 5 ? (
              <button
                className="button"
                onClick={() => {
                  if (validate()) go(step + 1);
                }}
              >
                Continue <ArrowRight size={17} />
              </button>
            ) : (
              <button className="button" disabled={busy} onClick={send}>
                {busy ? "Saving…" : c.occasion === "Personalised Gift" ? "Request a Quote" : "Request a Consultation"}{" "}
                <ArrowUpRight size={16} />
              </button>
            )}
          </div>
          <small className="draft-note">
            Draft automatically saved in this browser.
          </small>
        </div>
      </div>
    </section>
  );
}
function Summary({ c }: { c: Config }) {
  return (
    <dl className="summary">
      {[
        ["Request type", c.occasion],
        ...(c.occasion === "Bridal Consultation" ? [["Selected gown", c.gown]] : [["Gift product", c.product], ["Quantity", String(c.quantity)]]),
        ["Style", c.style],
        ...(c.occasion === "Personalised Gift" ? [["Product colour", c.productColour], ...(c.product === "Satin bridal robe" ? [] : [["Font", c.lettering], ["Text colour", c.textColour], ["Decorative motif", c.motif]])] : []),
        [c.occasion === "Bridal Consultation" ? "Wedding date & time" : "Required date & time", c.date + " · " + c.time],
        ["Location", c.location],
        ...(c.occasion === "Bridal Consultation" ? [["Bridal party / venue", c.guests + " / " + c.venue], ["Budget", c.budget]] : []),
        ["Customer", c.name],
        ["Contact", c.email + " / " + c.phone + " / " + c.contact],
        [c.occasion === "Personalised Gift" ? "Personalisation" : "Consultation preferences", c.message || "None"],
        ["Requirements", c.notes || "None"],
        ...(c.reference ? [["Inspiration", c.reference]] : []),
      ].map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
function Success({ id, data }: { id: string; data: Data }) {
  const e = data.enquiries.find((e) => e.id === id);
  return (
    <section className="success page-title">
      {e ? (
        <>
          <span className="success-mark">
            <Check />
          </span>
          <p className="eyebrow">A BEAUTIFUL BEGINNING</p>
          <h1>
            Your moment.
            <br />
            <em>One step closer.</em>
          </h1>
          <p>Your fictional enquiry has been saved in this browser.</p>
          <p className="reference">{id}</p>
          <p>Enquiry → Review → Quotation → Confirmation</p>
          <small>
            No email has been sent. This demo does not track private staff
            activity.
          </small>
          <Link className="button" href={"/admin/enquiries/" + id}>
            View in Studio Manager <ArrowUpRight size={17} />
          </Link>
        </>
      ) : (
        <>
          <h1>Enquiry not found.</h1>
          <p>This enquiry may belong to a different browser session.</p>
          <Link href="/studio">Return to the studio</Link>
        </>
      )}
    </section>
  );
}
function Admin({
  path,
  data: d,
  mutate,
  reset,
}: {
  path: string;
  data: Data;
  mutate: Mutate;
  reset: () => void;
}) {
  const router = useRouter();
  const section = path.split("/")[2] || "overview",
    id = path.split("/")[3];
  const [search, setSearch] = useState(""),
    [status, setStatus] = useState("All"),
    [requestType, setRequestType] = useState("All"),
    [page, setPage] = useState(0),
    [month, setMonth] = useState("2026-11"),
    [day, setDay] = useState(""),
    [edit, setEdit] = useState<Quote | null>(null),
    [note, setNote] = useState(""),
    [pkg, setPkg] = useState(d.packages),
    [selected, setSelected] = useState("");
  const enquiry = d.enquiries.find((e) => e.id === id);
  const quote = d.quotes.find((q) => q.id === id);
  useEffect(() => {
    setNote(enquiry?.notes ?? "");
  }, [id, enquiry?.notes]);
  const total = d.bookings.reduce((n, b) => n + b.total, 0),
    accepted = d.quotes.filter((q) => q.status === "Accepted").length;
  const heading = (
    <div className="admin-heading">
      <div>
        <p className="eyebrow">PRECIOUS MEMOIRS / STUDIO MANAGER</p>
        <h1>
          {enquiry
            ? enquiry.config.name
            : quote
              ? "Your tailored quotation"
              : section === "overview"
                ? "A beautiful day to create."
                : section[0].toUpperCase() + section.slice(1)}
        </h1>
        <p className="muted">
          {section === "overview"
            ? "A considered view of every moment in the making."
            : "Fictional records. One connected studio."}
        </p>
      </div>
      <Link className="button" href="/studio">
        New experience <Plus size={16} />
      </Link>
    </div>
  );
  const list = d.enquiries.filter(
    (e) =>
      (status === "All" || e.status === status) &&
      (requestType === "All" || e.config.occasion === requestType) &&
      (e.config.name + " " + e.id + " " + e.config.occasion)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const enquiriesTable = (
    <div className="panel">
      <div className="panel-heading">
        <h2>{section === "overview" ? "Recent enquiries" : "Bridal & gift enquiries"}</h2>
        <span>{list.length} records</span>
      </div>
      <div className="table-controls">
        <Field label="Request type"><select value={requestType} onChange={e => { setRequestType(e.target.value); setPage(0); }}><option>All</option>{occasions.map(o => <option key={o}>{o}</option>)}</select></Field>
        <label>
          <span className="sr-only">Search enquiries</span>
          <input
            placeholder="Search name, reference or occasion"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
          />
        </label>
        {search && (
          <button
            onClick={() => {
              setSearch("");
              setPage(0);
            }}
          >
            Clear search
          </button>
        )}
        <label>
          <span className="sr-only">Filter status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            {["All", "New", "In review", "Quoted", "Booked", "Closed"].map(
              (s) => (
                <option key={s}>{s}</option>
              ),
            )}
          </select>
        </label>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>CLIENT / REFERENCE</th>
              <th>EXPERIENCE</th>
              <th>REQUIRED DATE</th>
              <th>ESTIMATE</th>
              <th>STATUS</th>
              <th>DETAILS</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(page * 8, page * 8 + 8).map((e) => (
              <tr key={e.id}>
                <td>
                  <strong>{e.config.name}</strong>
                  <small>{e.id}</small>
                </td>
                <td>
                  {e.config.occasion}
                  <small>{e.config.style}</small>
                </td>
                <td>{e.config.date}</td>
                <td>{money(e.estimate)}</td>
                <td>
                  <span className="badge">{e.status}</span>
                  {e.followup && <small>Follow-up needed</small>}
                </td>
                <td>
                  <Link className="text-link" href={"/admin/enquiries/" + e.id}>
                    Open ↗
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && (
          <p className="empty">
            No enquiries match.{" "}
            <button
              onClick={() => {
                setSearch("");
                setStatus("All");
              }}
            >
              Clear filters
            </button>{" "}
            or start an experience.
          </p>
        )}
      </div>
      <div className="pagination">
        <span>
          {list.length ? Math.min(page * 8 + 1, list.length) : 0}–
          {Math.min(page * 8 + 8, list.length)} of {list.length}
        </span>
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>
          Previous
        </button>
        <button
          disabled={(page + 1) * 8 >= list.length}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
  const metrics = (
    <div className="metrics">
      {[
        ["Requests", d.enquiries.length, "All saved briefs"],
        [
          "Open quotations",
          d.quotes.filter((q) => q.status === "Draft").length,
          "Awaiting acceptance",
        ],
        ["Confirmed orders", d.bookings.length, "Accepted & confirmed"],
        ["Booked value", money(total), "Illustrative, not collected revenue"],
      ].map(([label, n, sub]) => (
        <div className="metric" key={label}>
          <span>{label}</span>
          <strong>{n}</strong>
          <small>{sub}</small>
        </div>
      ))}
    </div>
  );
  const chart = (
    <div className="panel">
      <div className="panel-heading">
        <h2>The studio, at a glance</h2>
        <span>Live from saved records</span>
      </div>
      <div className="chart">
        {occasions.map((o) => {
          const n = d.enquiries.filter((e) => e.config.occasion === o).length;
          return (
            <div key={o}>
              <span>{o}</span>
              <div>
                <i
                  style={{
                    width:
                      Math.max(1, (n / Math.max(1, d.enquiries.length)) * 100) +
                      "%",
                  }}
                />
              </div>
              <strong>{n}</strong>
            </div>
          );
        })}
      </div>
      <p className="muted">
        Quote acceptance{" "}
        {d.quotes.length ? Math.round((accepted / d.quotes.length) * 100) : 0}%
        · {accepted} of {d.quotes.length} quotations
      </p>
    </div>
  );
  function saveQuote() {
    if (!edit) return;
    mutate((next) => {
      const q = next.quotes.find((q) => q.id === edit.id)!;
      if (q.status === "Accepted")
        throw Error("Accepted quotations are locked.");
      Object.assign(q, edit, { version: q.version + 1 });
    }, "Quotation saved.");
    setEdit(null);
  }
  return (
    <>
      {heading}
      {section === "overview" && (
        <>
          {metrics}
          <div className="admin-grid">
            {chart}
            <div className="panel">
              <p className="eyebrow">NEEDS YOUR ATTENTION</p>
              <h2>A little follow-through.</h2>
              {d.enquiries
                .filter((e) => e.followup)
                .slice(0, 5)
                .map((e) => (
                  <Link
                    className="list-row"
                    key={e.id}
                    href={"/admin/enquiries/" + e.id}
                  >
                    <span>
                      {e.config.name}
                      <small>{e.config.date}</small>
                    </span>
                    <ArrowUpRight size={17} />
                  </Link>
                ))}
              {!d.enquiries.some((e) => e.followup) && (
                <p>No follow-ups. You’re all caught up.</p>
              )}
            </div>
          </div>
          {enquiriesTable}
          <ActivityList d={d} />
        </>
      )}
      {section === "enquiries" && !id && enquiriesTable}
      {section === "enquiries" &&
        id &&
        (enquiry ? (
          <>
            <div className="admin-grid">
              <div className="panel">
                <p className="eyebrow">{enquiry.id}</p>
                <h2>{enquiry.config.occasion}</h2>
                <Summary c={enquiry.config} />
                <div className="review-total">
                  {enquiry.items.map((i) => (
                    <p key={i.name}>
                      <span>{i.name}</span>
                      <span>{money(i.price * i.qty)}</span>
                    </p>
                  ))}
                  <p>
                    <strong>Saved estimate</strong>
                    <strong>{money(enquiry.estimate)}</strong>
                  </p>
                </div>
              </div>
              <div>
                <div className="panel">
                  <h2>Move the moment forward.</h2>
                  <Field label="Enquiry status">
                    <select
                      value={enquiry.status}
                      disabled={
                        enquiry.status === "Booked" ||
                        enquiry.status === "Quoted"
                      }
                      onChange={(e) =>
                        mutate((n) => {
                          n.enquiries.find((x) => x.id === id)!.status =
                            e.target.value;
                        }, "Enquiry status updated.")
                      }
                    >
                      {["New", "In review", "Quoted", "Booked", "Closed"].map(
                        (s) => (
                          <option
                            disabled={s === "Quoted" || s === "Booked"}
                            key={s}
                          >
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                  <label className="consent">
                    <input
                      type="checkbox"
                      checked={enquiry.followup}
                      onChange={(e) =>
                        mutate((n) => {
                          n.enquiries.find((x) => x.id === id)!.followup =
                            e.target.checked;
                        }, "Follow-up updated.")
                      }
                    />
                    Requires follow-up
                  </label>
                  <Field label="Internal notes">
                    <textarea
                      className="resize-none"
                      key={id}
                      defaultValue={enquiry.notes}
                      onChange={(e) => setNote(e.target.value)}
                      onBlur={(e) => {
                        if (e.target.value !== enquiry.notes)
                          mutate((n) => {
                            n.enquiries.find((x) => x.id === id)!.notes =
                              e.target.value;
                          }, "Internal note saved.");
                      }}
                    />
                  </Field>
                  <button
                    onClick={() =>
                      mutate((n) => {
                        n.enquiries.find((x) => x.id === id)!.notes = note;
                      }, "Internal note saved.")
                    }
                  >
                    Save notes
                  </button>
                  <button
                    className="button full"
                    onClick={() => {
                      let qid = "";
                      if (
                        mutate((n) => {
                          qid = createQuote(n, id);
                        }, "Quotation opened.")
                      )
                        router.push("/admin/quotations/" + qid);
                    }}
                  >
                    Create / open quotation <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="panel">
                  <p className="eyebrow">LINKED CLIENT</p>
                  <Link href={"/admin/clients/" + enquiry.clientId}>
                    {enquiry.config.name} ↗
                  </Link>
                </div>
              </div>
            </div>
          </>
        ) : (
          <Empty />
        ))}
      {section === "quotations" && !id && (
        <div className="panel">
          <h2>Considered down to the last detail.</h2>
          {d.enquiries.filter(e => e.config.occasion === "Personalised Gift" && !d.quotes.some(q => q.enquiryId === e.id)).map(e => <Link className="list-row" href={"/admin/enquiries/" + e.id} key={e.id}><span><strong>{e.config.name}</strong><small>{e.config.product} × {e.config.quantity} · {e.config.message || "No lettering"}</small></span><span>Awaiting a quotation ↗</span></Link>)}
          {d.quotes.map((q) => {
            const e = d.enquiries.find((e) => e.id === q.enquiryId)!;
            return (
              <Link
                className="list-row"
                key={q.id}
                href={"/admin/quotations/" + q.id}
              >
                <span>
                  <strong>{e.config.name}</strong>
                  <small>
                    {q.id} · Version {q.version} · {q.status}
                  </small>
                </span>
                <span>
                  {money(totals(q.items, q.charge, q.discount, q.tax))} ↗
                </span>
              </Link>
            );
          })}
          {!d.quotes.length && (
            <p className="empty">
              No quotations yet.{" "}
              <Link href="/admin/enquiries">
                Open an enquiry to create one →
              </Link>
            </p>
          )}
        </div>
      )}
      {section === "quotations" &&
        id &&
        (quote ? (
          <>
            <div className="quote-toolbar">
              <span className="badge">
                {quote.status} · v{quote.version}
              </span>
              <button onClick={() => exportPDF(d, quote)}>
                <Download size={16} /> Download PDF
              </button>
              <button onClick={() => exportPDF(d, quote, true)}>
                Request brief PDF
              </button>
              {quote.status === "Draft" && (
                <>
                  <button onClick={() => setEdit(structuredClone(quote))}>
                    Edit quotation
                  </button>
                  <button
                    className="button"
                    onClick={() =>
                      mutate((n) => {
                        n.quotes.find((q) => q.id === id)!.status = "Accepted";
                      }, "Quotation accepted.")
                    }
                  >
                    Mark accepted <Check size={16} />
                  </button>
                </>
              )}
              {quote.status === "Accepted" && (
                <button
                  className="button"
                  onClick={() => {
                    if (
                      mutate((n) => {
                        confirmBooking(n, id);
                      }, "Booking confirmed. Calendar and client updated.")
                    )
                      router.push("/admin/calendar");
                  }}
                >
                  Confirm booking <CalendarDays size={16} />
                </button>
              )}
            </div>
            <div className="quote-paper">
              <div className="quote-brand">
                Precious <span>MEMOIRS</span>
              </div>
              <p className="eyebrow">A MOMENT, BEAUTIFULLY CONSIDERED</p>
              <h2>Personalised quotation</h2>
              <p>
                {quote.id} · Valid until {quote.validUntil}
              </p>
              <Summary
                c={d.enquiries.find((e) => e.id === quote.enquiryId)!.config}
              />
              <div className="review-total">
                {quote.items.map((i, j) => (
                  <p key={j}>
                    <span>
                      {i.name} × {i.qty}
                    </span>
                    <span>{money(i.price * i.qty)}</span>
                  </p>
                ))}
                <p>
                  <span>Additional charges</span>
                  <span>{money(quote.charge)}</span>
                </p>
                <p>
                  <span>Discount</span>
                  <span>−{money(quote.discount)}</span>
                </p>
                <p>
                  <span>Tax</span>
                  <span>{quote.tax}%</span>
                </p>
                <p className="total">
                  <strong>Total</strong>
                  <strong>
                    {money(
                      totals(
                        quote.items,
                        quote.charge,
                        quote.discount,
                        quote.tax,
                      ),
                    )}
                  </strong>
                </p>
                <p>
                  <span>Deposit · {quote.deposit}%</span>
                  <span>
                    {money(
                      Math.round(
                        (totals(
                          quote.items,
                          quote.charge,
                          quote.discount,
                          quote.tax,
                        ) *
                          quote.deposit) /
                          100,
                      ),
                    )}
                  </span>
                </p>
              </div>
              <p>{quote.terms}</p>
              <small>
                Illustrative prices. No payment or email is processed. Concept
                by paceIT.
              </small>
            </div>
          </>
        ) : (
          <Empty />
        ))}
      {edit && (
        <Modal title="Refine the quotation" close={() => setEdit(null)}>
          <p className="note">
            Amounts in rand. Changes save a new version. Accepted quotations are
            locked.
          </p>
          {edit.items.map((item, i) => (
            <div className="quote-edit-row" key={i}>
              <Field label="Line item">
                <input
                  value={item.name}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      items: edit.items.map((x, j) =>
                        j === i ? { ...x, name: e.target.value } : x,
                      ),
                    })
                  }
                />
              </Field>
              <Field label="Quantity">
                <input
                  type="number"
                  min="1"
                  value={item.qty}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      items: edit.items.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              qty: Math.max(
                                1,
                                Math.floor(Number(e.target.value)),
                              ),
                            }
                          : x,
                      ),
                    })
                  }
                />
              </Field>
              <Field label="Unit price (BWP)">
                <input
                  type="number"
                  min="0"
                  value={item.price / 100}
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      items: edit.items.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              price: Math.max(
                                0,
                                Math.round(Number(e.target.value) * 100),
                              ),
                            }
                          : x,
                      ),
                    })
                  }
                />
              </Field>
              <button
                aria-label={"Remove " + item.name}
                onClick={() =>
                  setEdit({
                    ...edit,
                    items: edit.items.filter((_, j) => j !== i),
                  })
                }
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <button
            onClick={() =>
              setEdit({
                ...edit,
                items: [
                  ...edit.items,
                  { name: "Custom styling", qty: 1, price: 0 },
                ],
              })
            }
          >
            Add line item +
          </button>
          <div className="form-grid">
            {(["charge", "discount", "tax", "deposit"] as const).map((k) => (
              <Field
                label={
                  {
                    charge: "Additional charges (R)",
                    discount: "Discount (R)",
                    tax: "Tax (%)",
                    deposit: "Deposit (%)",
                  }[k]
                }
                key={k}
              >
                <input
                  type="number"
                  min="0"
                  max={k === "tax" || k === "deposit" ? 100 : undefined}
                  value={
                    edit[k] / (k === "charge" || k === "discount" ? 100 : 1)
                  }
                  onChange={(e) =>
                    setEdit({
                      ...edit,
                      [k]: Math.min(
                        k === "tax" || k === "deposit" ? 100 : Infinity,
                        Math.max(
                          0,
                          Math.round(
                            Number(e.target.value) *
                              (k === "charge" || k === "discount" ? 100 : 1),
                          ),
                        ),
                      ),
                    })
                  }
                />
              </Field>
            ))}
            <Field label="Valid until">
              <input
                type="date"
                value={edit.validUntil}
                onChange={(e) =>
                  setEdit({ ...edit, validUntil: e.target.value })
                }
              />
            </Field>
          </div>
          <Field label="Terms">
            <textarea
              className="resize-none"
              value={edit.terms}
              onChange={(e) => setEdit({ ...edit, terms: e.target.value })}
            />
          </Field>
          <div className="actions">
            <strong aria-live="polite">
              {money(totals(edit.items, edit.charge, edit.discount, edit.tax))}
            </strong>
            <button onClick={() => setEdit(null)}>Cancel</button>
            <button className="button" onClick={saveQuote}>
              Save quotation
            </button>
          </div>
        </Modal>
      )}
      {section === "bookings" && (
        <div className="panel">
          <h2>Moments on the horizon.</h2>
          {d.bookings.map((b) => {
            const e = d.enquiries.find((e) => e.id === b.enquiryId)!;
            return (
              <article className="booking" key={b.id}>
                <p className="eyebrow">{b.id} / CONFIRMED</p>
                <h3>
                  {e.config.name} · {e.config.occasion}
                </h3>
                <p>
                  {e.config.date} at {e.config.time} · {e.config.location} ·{" "}
                  {money(b.total)}
                </p>
                <Field label="Booking internal notes">
                  <textarea
                    className="resize-none"
                    defaultValue={b.notes}
                    onBlur={(ev) =>
                      mutate((n) => {
                        n.bookings.find((x) => x.id === b.id)!.notes =
                          ev.target.value;
                      }, "Booking notes saved.")
                    }
                  />
                </Field>
                <Link href={"/admin/quotations/" + b.quoteId}>
                  Open linked quotation ↗
                </Link>
              </article>
            );
          })}
          {!d.bookings.length && (
            <p className="empty">
              No bookings yet. Accept a quotation, then confirm the booking.
            </p>
          )}
        </div>
      )}
      {section === "calendar" && (
        <div className="panel">
          <div className="panel-heading">
            <h2>Space for something wonderful.</h2>
            <Field label="Calendar month">
              <input
                type="month"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value || "2026-11");
                  setDay("");
                }}
              />
            </Field>
          </div>
          <Calendar month={month} data={d} day={day} choose={setDay} />
          <div className="calendar-detail">
            <h3>{day || month} / Confirmed orders</h3>
            {d.bookings
              .filter((b) =>
                d.enquiries
                  .find((e) => e.id === b.enquiryId)!
                  .config.date.startsWith(day || month),
              )
              .map((b) => {
                const e = d.enquiries.find((e) => e.id === b.enquiryId)!;
                return (
                  <Link
                    className="list-row"
                    key={b.id}
                    href={"/admin/quotations/" + b.quoteId}
                  >
                    <span>
                      {e.config.name} · {e.config.occasion}
                      <small>
                        {e.config.date} · {e.config.time} · {e.config.location}
                      </small>
                    </span>
                    <ArrowUpRight size={17} />
                  </Link>
                );
              })}
            {!d.bookings.some((b) =>
              d.enquiries
                .find((e) => e.id === b.enquiryId)!
                .config.date.startsWith(day || month),
            ) && (
              <p className="empty">
                No confirmed orders for this {day ? "day" : "month"}. Enquiries
                do not reserve a date.
              </p>
            )}
          </div>
        </div>
      )}
      {section === "clients" && (
        <div className="panel">
          <h2>
            {id
              ? d.clients.find((c) => c.id === id)?.name || "Client not found"
              : "People behind the moments."}
          </h2>
          {d.clients
            .filter((c) => !id || c.id === id)
            .map((c) => (
              <div key={c.id} className="client-record">
                <Link href={"/admin/clients/" + c.id}>
                  <h3>{c.name} ↗</h3>
                </Link>
                <p>
                  {c.email} · {c.phone}
                </p>
                {d.enquiries
                  .filter((e) => e.clientId === c.id)
                  .map((e) => (
                    <div className="linked-record" key={e.id}>
                      <Link href={"/admin/enquiries/" + e.id}>
                        {e.id} · {e.config.occasion} · {e.status} ↗
                      </Link>
                      {d.quotes
                        .filter((q) => q.enquiryId === e.id)
                        .map((q) => (
                          <Link key={q.id} href={"/admin/quotations/" + q.id}>
                            {q.id} · {q.status} ↗
                          </Link>
                        ))}
                      {d.bookings
                        .filter((b) => b.enquiryId === e.id)
                        .map((b) => (
                          <Link key={b.id} href="/admin/calendar">
                            {b.id} · Confirmed · {e.config.date} ↗
                          </Link>
                        ))}
                    </div>
                  ))}
              </div>
            ))}
        </div>
      )}
      {section === "packages" && (
        <div className="panel">
          <h2>The building blocks.</h2>
          <p>
            No prices are prefilled. Enter business-approved quotations in BWP. Changes apply to new requests; existing
            enquiry snapshots and quotations stay intact.
          </p>
          {pkg.map((p, i) => (
            <div className="package-row" key={p.name}>
              <strong>{p.name}</strong>
              <Field label="Business-entered price (BWP)">
                <input
                  type="number"
                  min="0"
                  value={p.price / 100}
                  onChange={(e) =>
                    setPkg(
                      pkg.map((x, j) =>
                        j === i
                          ? {
                              ...x,
                              price: Math.max(
                                0,
                                Math.round(Number(e.target.value) * 100),
                              ),
                            }
                          : x,
                      ),
                    )
                  }
                />
              </Field>
              <label className="consent">
                <input
                  type="checkbox"
                  checked={p.enabled}
                  onChange={(e) =>
                    setPkg(
                      pkg.map((x, j) =>
                        j === i ? { ...x, enabled: e.target.checked } : x,
                      ),
                    )
                  }
                />
                Enabled
              </label>
            </div>
          ))}
          <button
            className="button"
            onClick={() =>
              mutate((n) => {
                n.packages = pkg;
              }, "Catalogue saved. New requests use updated prices.")
            }
          >
            Save catalogue
          </button>
        </div>
      )}
      {section === "analytics" && (
        <>
          {metrics}
          {chart}
          <div className="panel">
            <h2>Enquiry pipeline</h2>
            {["New", "In review", "Quoted", "Booked", "Closed"].map((s) => (
              <div className="list-row" key={s}>
                <span>{s}</span>
                <strong>
                  {d.enquiries.filter((e) => e.status === s).length}
                </strong>
              </div>
            ))}
            <p>No external traffic or payment analytics are connected.</p>
          </div>
        </>
      )}
      {section === "settings" && (
        <div className="panel">
          <h2>Your demonstration workspace.</h2>
          <p>Mode: isolated browser demo. Fictional records only.</p>
          <p>
            Data persists here across refreshes and synchronises between tabs in
            this browser. Devices are not synchronised. No login, email
            delivery, payment or production database is connected.
          </p>
          <p>Currency: ZAR · Locale: en-ZA · Timezone: Africa/Johannesburg</p>
          <div className="actions">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(d, null, 2)], {
                  type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "precious-memoirs-backup.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export demo backup
            </button>
            <button onClick={reset}>Reset Demo</button>
          </div>
        </div>
      )}
      {selected && (
        <span>
          {selected}
          <button onClick={() => setSelected("")}>Dismiss</button>
        </span>
      )}
    </>
  );
}
function Empty() {
  return (
    <div className="panel">
      <h2>Record not found.</h2>
      <Link href="/admin">Back to overview</Link>
    </div>
  );
}
function ActivityList({ d }: { d: Data }) {
  return (
    <div className="panel">
      <h2>In the studio</h2>
      {d.activity.slice(0, 8).map((a) => (
        <div className="list-row" key={a.id}>
          <span>{a.text}</span>
          <small>
            {new Date(a.at).toLocaleString("en-ZA", {
              timeZone: "Africa/Johannesburg",
            })}{" "}
            SAST
          </small>
        </div>
      ))}
    </div>
  );
}
function Calendar({
  month,
  data,
  day,
  choose,
}: {
  month: string;
  data: Data;
  day: string;
  choose: (s: string) => void;
}) {
  const [year, m] = month.split("-").map(Number);
  const count = new Date(year, m, 0).getDate(),
    offset = (new Date(year, m - 1, 1).getDay() + 6) % 7;
  return (
    <>
      <div className="calendar-week">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((n) => (
          <span key={n}>{n}</span>
        ))}
      </div>
      <div className="calendar-grid">
        {Array.from({ length: offset }, (_, i) => (
          <span key={"empty" + i} />
        ))}
        {Array.from({ length: count }, (_, i) => {
          const date = month + "-" + String(i + 1).padStart(2, "0");
          const bs = data.bookings.filter(
            (b) =>
              data.enquiries.find((e) => e.id === b.enquiryId)!.config.date ===
              date,
          );
          return (
            <button
              key={date}
              className={day === date ? "selected" : ""}
              aria-label={date + ", " + bs.length + " confirmed events"}
              onClick={() => choose(date)}
            >
              <span>{i + 1}</span>
              {bs.map((b) => (
                <small key={b.id}>
                  {
                    data.enquiries.find((e) => e.id === b.enquiryId)!.config
                      .name
                  }
                </small>
              ))}
            </button>
          );
        })}
      </div>
    </>
  );
}
