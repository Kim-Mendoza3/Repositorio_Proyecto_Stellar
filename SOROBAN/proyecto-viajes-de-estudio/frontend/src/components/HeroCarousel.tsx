"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";

const slides = [
  {
    src: "/images/slide-1.jpg",
    alt: "Estudiantes en viaje educativo - playas",
    title: "Estudiantes en viaje educativo",
    subtitle: "Playas y experiencias al aire libre",
  },
  {
    src: "/images/slide-2.jpg",
    alt: "Grupo estudiantil visitando ciudad",
    title: "Exploración urbana",
    subtitle: "Ciudades, museos y rutas culturales",
  },
  {
    src: "/images/slide-3.jpg",
    alt: "Excursión escolar - monumentos",
    title: "Rutas culturales",
    subtitle: "Visitas guiadas a monumentos y patrimonio",
  },
  {
    src: "/images/slide-4.jpg",
    alt: "Viaje escolar en grupo - naturaleza",
    title: "Naturaleza y aventura",
    subtitle: "Excursiones, senderismo y experiencias locales",
  },
  {
    src: "/images/slide-5.jpg",
    alt: "Jóvenes explorando ciudad",
    title: "Aprendizaje en el extranjero",
    subtitle: "Intercambios y experiencias académicas",
  },
  {
    src: "/images/slide-6.jpg",
    alt: "Estudiantes en visita cultural",
    title: "Cultura en vivo",
    subtitle: "Festivales, gastronomía y encuentros culturales",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [erroredImages, setErroredImages] = useState<Set<string>>(new Set());
  const [pointerStart, setPointerStart] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4500);
    return () => clearInterval(t);
  }, [paused]);

  function prev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }

  function next() {
    setIndex((i) => (i + 1) % slides.length);
  }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  }

  function onPointerDown(e: React.PointerEvent) {
    setPointerStart({ x: e.clientX, y: e.clientY });
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!pointerStart) return;
    const dx = e.clientX - pointerStart.x;
    const dy = Math.abs(e.clientY - pointerStart.y);
    
    // Swipe horizontal si el movimiento es principalmente horizontal (dy < 25% de dx)
    if (Math.abs(dx) > 50 && dy < Math.abs(dx) * 0.25) {
      if (dx > 0) prev(); // Swipe derecha = slide anterior
      else next();        // Swipe izquierda = slide siguiente
    }
    setPointerStart(null);
  }

  function handleImageError(src: string) {
    setErroredImages((prev) => new Set(prev).add(src));
  }

  const currentSlide = slides[index];
  const isImageErrored = erroredImages.has(currentSlide.src);

  return (
    <div
      ref={containerRef}
      className="carousel relative rounded-3xl overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={onKey}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Galería de viajes a México"
    >
      <div className="slides relative w-full h-full">
        {slides.map((s, i) => (
          <div
            key={s.src}
            className={`slide absolute inset-0 transition-opacity duration-1000 ${
              i === index ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            aria-hidden={i !== index}
          >
            {i === index && !isImageErrored ? (
              <Image
                src={s.src}
                alt={s.alt}
                fill
                className="object-cover"
                priority={i === 0}
                quality={90}
                onError={() => handleImageError(s.src)}
              />
            ) : i === index && isImageErrored ? (
              // Fallback SVG cuando hay error
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-white opacity-70"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* Caption Card */}
      {!isImageErrored && (
        <div className="absolute left-6 bottom-6 text-white max-w-md caption-card glass p-4">
          <div className="text-xs uppercase tracking-widest text-amber-200/90 font-semibold">
            Operamos en
          </div>
          <div className="text-xl md:text-2xl font-extrabold leading-tight mt-1">
            México — Experiencias estudiantiles
          </div>
          <div className="mt-1 text-sm text-sky-100/80">
            Rutas y convenios con instituciones mexicanas
          </div>
          <div className="mt-3">
            <div className="font-semibold">{currentSlide.title}</div>
            <div className="text-sm text-sky-100/80">{currentSlide.subtitle}</div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <button
        aria-label="Anterior"
        onClick={prev}
        className="carousel-btn left-3"
      >
        ‹
      </button>
      <button
        aria-label="Siguiente"
        onClick={next}
        className="carousel-btn right-3"
      >
        ›
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === index ? "bg-white" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
