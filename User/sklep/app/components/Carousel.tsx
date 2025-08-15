// app/components/Carousel.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta?: { label: string; href: string };
};

const slides: Slide[] = [
  {
    id: "drop",
    title: "Nowy drop — streetwear",
    subtitle: "Oversize, basic, denim. Zachowaj styl przez cały sezon.",
    image: "/images/placeholder.png", // <-- lepiej pełne tło niż małe SVG
    cta: { label: "Zobacz kolekcję", href: "/" },
  },
  {
    id: "sale",
    title: "Mid-season sale -30%",
    subtitle: "Wybrane modele taniej. Do wyczerpania zapasów.",
    image: "/images/placeholder.png",
    cta: { label: "Kup teraz", href: "/" },
  },
  {
    id: "eco",
    title: "Eco line",
    subtitle: "Bawełna organiczna i recykling — dobra dla Ciebie i planety.",
    image: "/images/placeholder.png",
    cta: { label: "Sprawdź", href: "/" },
  },
];

export default function Carousel() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const go = (i: number) =>
    setIndex(Math.max(0, Math.min(slides.length - 1, i)));

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="carousel"
      aria-roledescription="carousel"
    >
      <div
        className="carouselTrack"
        ref={trackRef}
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div
            className="carouselItem"
            key={s.id}
          >
            <div className="carouselCopy">
              <h2>{s.title}</h2>
              <p>{s.subtitle}</p>
              <div className="carouselActions">
                {s.cta && (
                  <Link
                    href={s.cta.href}
                    className="btn btnPrimary"
                  >
                    {s.cta.label}
                  </Link>
                )}
                <button
                  className="btn"
                  onClick={() => alert("Dodaj do ulubionych (placeholder)")}
                >
                  ♥ Ulubione
                </button>
              </div>
            </div>

            {/* WAŻNE: kontener wizualny wypełnia wysokość, a Image ma fill+cover */}
            <div
              className="carouselVisual"
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              <Image
                src={s.image}
                alt={s.title}
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pointerEvents: "none",
        }}
      >
        <button
          className="btn"
          style={{ marginLeft: 10, pointerEvents: "all" }}
          onClick={() => go(index - 1)}
          aria-label="Poprzedni"
        >
          ←
        </button>
        <button
          className="btn"
          style={{ marginRight: 10, pointerEvents: "all" }}
          onClick={() => go(index + 1)}
          aria-label="Następny"
        >
          →
        </button>
      </div>

      <div
        className="carouselDots"
        aria-hidden
      >
        {slides.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
