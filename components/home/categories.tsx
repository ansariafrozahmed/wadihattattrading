"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { Reveal } from "@/layouts/reveal";
import { fabrics } from "@/data/fabrics";
import FabricSwatchCard from "@/components/fabrics/fabric-swatch-card";

type EmblaOptions = NonNullable<Parameters<typeof useEmblaCarousel>[0]>;

// Hoisted so the options object identity never changes between renders
// (a fresh object makes Embla tear down and re-init the whole carousel).
const EMBLA_OPTIONS: EmblaOptions = {
  align: "start",
  loop: false,
  dragFree: false,
  skipSnaps: false,
  containScroll: "trimSnaps",
  duration: 22,
};

const NOISE_TEXTURE_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='roughNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23roughNoise)'/%3E%3C/svg%3E")`,
  backgroundRepeat: "repeat",
  backgroundSize: "160px 160px",
};

// Pre-blurred radial gradient instead of a 64px blur() pass over a 750x360 box.
const WARM_GLOW_STYLE: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(221,175,77,0.10), rgba(221,175,77,0.04) 55%, transparent 75%)",
};

export default function CategoriesSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel(EMBLA_OPTIONS);

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(
    (api: { canScrollPrev: () => boolean; canScrollNext: () => boolean }) => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    },
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const container = emblaApi.containerNode();

    // Promote the track to its own compositor layer only while it is actually
    // moving. Leaving will-change on permanently pins a very wide texture in
    // GPU memory, which is what makes long carousels crawl on mobile.
    const engage = () => {
      container.style.willChange = "transform";
    };
    const release = () => {
      container.style.willChange = "auto";
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("pointerDown", engage);
    emblaApi.on("scroll", engage);
    emblaApi.on("settle", release);

    const raf = requestAnimationFrame(() => onSelect(emblaApi));

    return () => {
      cancelAnimationFrame(raf);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("pointerDown", engage);
      emblaApi.off("scroll", engage);
      emblaApi.off("settle", release);
      release();
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  // Slides never change, so build them once and keep the element identities
  // stable - React.memo on the card then skips re-rendering 16 clipped swatches
  // on every arrow click / state update.
  const slides = useMemo(
    () =>
      fabrics.map((fabric, idx) => (
        <div
          key={fabric.id}
          className="embla-slide min-w-0 shrink-0 pl-4 sm:pl-5 lg:pl-6 basis-[75%] sm:basis-[52%] md:basis-[36%] lg:basis-[28%] xl:basis-[25%]"
        >
          <FabricSwatchCard fabric={fabric} idx={idx} actionType="link" />
        </div>
      )),
    [],
  );

  return (
    <section
      id="categories"
      className="relative w-full bg-[#0f1329] text-white py-16 sm:py-20 lg:py-26 px-4 md:px-8 lg:px-16 overflow-hidden"
    >
      {/* 1. Atmospheric Radial Gradient Glow */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-15%,rgba(32,39,72,0.55),rgba(7,9,19,1))] pointer-events-none"
        aria-hidden="true"
      />

      {/* 2. Rough Woven Textile Noise Texture Overlay.
          Plain opacity - mix-blend-mode here forced the whole section,
          carousel included, to re-composite on every frame of a drag. */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={NOISE_TEXTURE_STYLE}
        aria-hidden="true"
      />

      {/* 3. Subtle Warm Ambient Accent Glow */}
      <div
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[750px] h-[360px] pointer-events-none"
        style={WARM_GLOW_STYLE}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-[1400px] mx-auto">
        {/* Header Row: Title, Narrative & Action */}
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-[#ddaf4d] mb-2 sm:mb-3">
                OUR SIGNATURE TEXTILES
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[2.6rem] text-white font-light tracking-tight leading-[1.15]">
                Fabric Lines
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 font-light max-w-xl leading-relaxed">
                Discover authentic NIDA, Crepe, Sheila, Chiffon, luxury silks,
                satins, couture embellishments, and pristine Kandura fabrics
                sourced for bespoke modest wear and wholesale distribution.
              </p>
            </div>

            <div className="shrink-0 pt-2 md:pt-0">
              <Link
                href="/fabrics"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] font-medium px-5 py-2.5 rounded-full border border-white/20 hover:border-white text-white hover:bg-white hover:text-neutral-950 transition-colors duration-300 cursor-pointer"
              >
                <span>View All Fabrics</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Embla Categories Slider Container with Navigation Arrows */}
        <Reveal
          delay={120}
          variant="up"
          className="relative group/slider mt-8 lg:mt-12"
        >
          {/* Center-Left Arrow Button (Aligned with Swatch Cards).
              No backdrop-blur: a backdrop-filter sitting on top of the moving
              track re-reads and re-blurs its backdrop on every single frame. */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label="Previous fabric swatch"
            className="absolute -left-2 sm:-left-5 top-[38%] -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#070913] hover:bg-white text-white hover:text-black shadow-2xl border border-white/20 hover:border-white flex items-center justify-center transition-colors duration-300 disabled:opacity-0 disabled:pointer-events-none cursor-pointer active:scale-95"
          >
            <span className="text-base select-none">←</span>
          </button>

          {/* Embla Viewport */}
          <div className="embla-viewport overflow-hidden py-3" ref={emblaRef}>
            {/* Embla Track */}
            <div className="embla-track flex -ml-4 sm:-ml-5 lg:-ml-6 select-none touch-pan-y">
              {slides}
            </div>
          </div>

          {/* Center-Right Arrow Button (Aligned with Swatch Cards) */}
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label="Next fabric swatch"
            className="absolute -right-2 sm:-right-5 top-[38%] -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-[#070913] hover:bg-white text-white hover:text-black shadow-2xl border border-white/20 hover:border-white flex items-center justify-center transition-colors duration-300 disabled:opacity-0 disabled:pointer-events-none cursor-pointer active:scale-95"
          >
            <span className="text-base select-none">→</span>
          </button>
        </Reveal>
      </div>
    </section>
  );
}
