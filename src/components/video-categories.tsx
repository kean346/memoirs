"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { useInView } from "./showcase-hooks";
const categories = [
  { name: "bridal", cta: "explore bridal", href: "/collections", src: "/videos/ivory-venue-mobile-hd.mp4", poster: "/videos/ivory-venue-4k.jpg" },
  { name: "keepsakes", cta: "personalise a gift", href: "/studio?request=gift", src: "/videos/roses-raindrops-mobile-hd.mp4", poster: "/videos/roses-raindrops-4k.jpg" },
  { name: "your moment", cta: "enter the studio", href: "/studio", src: "/videos/celebration-table-mobile-hd.mp4", poster: "/videos/celebration-table-4k.jpg" },
];
export default function VideoCategories() {
  const { ref, visible } = useInView<HTMLElement>(.1, true);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  useEffect(() => {
    const inView = new Set<HTMLVideoElement>();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting) inView.add(video); else inView.delete(video);
      if (entry.isIntersecting && !document.hidden) void video.play().catch(() => {}); else video.pause();
    }), { threshold: .05 });
    videos.current.forEach(video => { if (video) observer.observe(video); });
    const visibility = () => videos.current.forEach(video => { if (!video) return; if (document.hidden) video.pause(); else if (inView.has(video)) void video.play().catch(() => {}); });
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <section ref={ref} className="video-categories" aria-label="Explore Precious Memoirs categories"><div className={"video-category-grid" + (visible ? " is-visible" : "")}>{categories.map((category, i) => <article className="video-category" style={{ transitionDelay: i * 150 + "ms" }} key={category.name}>
    <video ref={el => { videos.current[i] = el; }} src={visible ? category.src : undefined} poster={category.poster} autoPlay loop muted playsInline preload="none" aria-hidden="true" onPlay={e => { const bounds = e.currentTarget.getBoundingClientRect(); if (document.hidden || bounds.bottom <= 0 || bounds.top >= innerHeight) e.currentTarget.pause(); }} /><div className="video-category-shade" /><span className="video-category-index">0{i + 1} / THE PRECIOUS EDIT</span><h2>{category.name}</h2><Link className="category-btn-primary" href={category.href}>{category.cta} <span aria-hidden="true">↗</span></Link>
  </article>)}</div></section>;
}
