"use client";

import { useEffect, useState } from "react";

/**
 * Crossfading background carousel for the landing hero.
 * Images are layered absolutely; the active one fades in. A gradient overlay
 * (rendered by the parent) sits above these for text contrast.
 */
export function HeroCarousel({
  images,
  intervalMs = 5000,
}: {
  images: string[];
  intervalMs?: number;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(
      () => setActive((i) => (i + 1) % images.length),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [images.length, intervalMs]);

  return (
    <div aria-hidden className="absolute inset-0">
      {images.map((src, i) => (
        <div
          key={src}
          className={`hero-slide absolute inset-0 bg-cover bg-center ${
            i === active ? "is-active" : ""
          }`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
    </div>
  );
}
