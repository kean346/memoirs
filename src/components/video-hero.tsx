"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ArrowDown, Pause, Play } from "lucide-react";
const scenes = [
  {
    title: "Romance in motion",
    mood: "For the moments that mean everything.",
    src: "/videos/ivory-venue-4k.mp4",
    mobile: "/videos/ivory-venue-mobile-hd.mp4",
    poster: "/videos/ivory-venue-4k.jpg",
    mobilePoster: "/videos/ivory-venue-mobile.webp",
  },
  {
    title: "Beautifully considered",
    mood: "Every detail tells your story.",
    src: "/videos/roses-raindrops-4k.mp4",
    mobile: "/videos/roses-raindrops-mobile-hd.mp4",
    poster: "/videos/roses-raindrops-4k.jpg",
    mobilePoster: "/videos/roses-raindrops-mobile.webp",
  },
  {
    title: "Extraordinary moments",
    mood: "A feeling. A setting. Unforgettably yours.",
    src: "/videos/celebration-table-4k.mp4",
    mobile: "/videos/celebration-table-mobile-hd.mp4",
    poster: "/videos/celebration-table-4k.jpg",
    mobilePoster: "/videos/celebration-table-mobile.webp",
  },
];
const DURATION = 8000;
export default function VideoHero() {
  const root = useRef<HTMLElement>(null),
    videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [active, setActive] = useState(0),
    [paused, setPaused] = useState(false),
    [visible, setVisible] = useState(true),
    [inView, setInView] = useState(true),
    [playing, setPlaying] = useState(false),
    [failed, setFailed] = useState<number[]>([]),
    [motionReady, setMotionReady] = useState(false);
  const running =
    motionReady && !paused && visible && inView;
  useEffect(() => {
    setMotionReady(true);
    const visibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const video = videos.current[active];
    if (running && video) {
      void video
        .play()
        .then(() => {
          if (!cancelled) setPlaying(true);
        })
        .catch(() => {
          if (!cancelled) setPlaying(false);
        });
    } else {
      videos.current.forEach((v) => v?.pause());
    }
    const pauseOthers = setTimeout(
      () =>
        videos.current.forEach((v, i) => {
          if (i !== active) v?.pause();
        }),
      1250,
    );
    return () => {
      cancelled = true;
      clearTimeout(pauseOthers);
    };
  }, [active, running]);
  useEffect(() => {
    if (!running) return;
    let cancelled = false,
      pending = false;
    const timer = setInterval(async () => {
      if (pending) return;
      const next = [1, 2, 3]
        .map((offset) => (active + offset) % 3)
        .find((i) => !failed.includes(i) && i !== active);
      if (next === undefined) return;
      const video = videos.current[next];
      if (!video) return;
      pending = true;
      try {
        if (video.readyState >= 1) video.currentTime = 0;
        await video.play();
        if (!cancelled) {
          setActive(next);
          setPlaying(true);
        } else video.pause();
      } catch {
        if (!cancelled)
          setFailed((prev) => (prev.includes(next) ? prev : [...prev, next]));
      } finally {
        pending = false;
      }
    }, DURATION);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [active, running, failed]);
  return (
    <section
      ref={root}
      className={"cinema-hero " + (running ? "is-running" : "is-paused")}
      aria-labelledby="cinema-title"
      style={{ "--scene-duration": DURATION + "ms" } as React.CSSProperties}
    >
      <div className="cinema-background" aria-hidden="true">
        {scenes.map((scene, i) => (
          <video
            key={scene.src}
            ref={(el) => {
              videos.current[i] = el;
            }}
            className={active === i ? "active" : ""}
            src={failed.includes(i) ? undefined : scene.src}
            poster={scene.poster}
            preload={i === active ? "auto" : i === (active + 1) % scenes.length && running ? "metadata" : "none"}
            autoPlay={i === active}
            muted
            playsInline
            loop
            onCanPlay={(e) => {
              if (i === active && running) {
                e.currentTarget.muted = true;
                void e.currentTarget.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
              }
            }}
            tabIndex={-1}
            onError={() =>
              setFailed((prev) => (prev.includes(i) ? prev : [...prev, i]))
            }
          />
        ))}
      </div>
      <div className="cinema-overlay" />
      <div className="cinema-content">
        <div className="cinema-topline">
          <p className="eyebrow">
            BRIDAL BOUTIQUE & PERSONALISED GIFTS
            <br />
            <span>PRECIOUS MEMOIRS / GABORONE</span>
          </p>
          <div className="cinema-status">
            <i />
            <span>YOUR MOMENT STARTS HERE</span>
          </div>
        </div>
        <div
          className="cinema-scenes"
          aria-label="Automatically rotating visual scenes"
        >
          {scenes.map((scene, i) => (
            <div
              className={active === i ? "cinema-scene active" : "cinema-scene"}
              key={scene.title}
              aria-current={active === i ? "true" : undefined}
            >
              <span className="scene-index">0{i + 1} /</span>
              <span>{scene.title}</span>
              <i>
                <b key={active + "-" + i + "-" + running} />
              </i>
            </div>
          ))}
        </div>
        <div className="cinema-bottom">
          <h1
            id="cinema-title"
            aria-label="Every Detail. A Precious Memory."
          >
            <span>Precious</span>
            <span>
              Memoirs<em>.</em>
            </span>
            <span className="sr-only">Every Detail. A Precious Memory.</span>
          </h1>
          <div className="cinema-intro">
            <p className="eyebrow">EVERY DETAIL. A PRECIOUS MEMORY.</p>
            <p>
              Timeless bridal elegance and personalised details for life’s most unforgettable moments.
            </p>
            <Link className="cinema-cta" href="/collections">
              Explore Collection <ArrowUpRight size={20} />
            </Link>
            <Link className="text-link" href="/studio?request=gift">Personalise a Gift <ArrowUpRight size={16} /></Link>
          </div>
        </div>
        <div className="cinema-foot">
          <a href="#bridal-edit">
            DISCOVER THE POSSIBILITIES <ArrowDown size={14} />
          </a>
          <span key={active}>{scenes[active].mood}</span>
          <button
            className="cinema-pause"
            aria-label={
              paused
                ? "Play background videos"
                : "Pause background videos"
            }
            aria-pressed={paused}
            onClick={() => setPaused(!paused)}
          >
            {paused ? (
              <Play size={13} />
            ) : (
              <Pause size={13} />
            )}
            <span>
              {paused ? "RESUME FILM" : "PAUSE FILM"}
            </span>
          </button>
        </div>
        {failed.length === 3 && (
          <span className="cinema-fallback-note">
            Visual inspiration · Explore your experience below
          </span>
        )}
        {!playing && !paused && (
          <span className="sr-only">
            The film is loading. You can explore the studio while it loads.
          </span>
        )}
      </div>
    </section>
  );
}
