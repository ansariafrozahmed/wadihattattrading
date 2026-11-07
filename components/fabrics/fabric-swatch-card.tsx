"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Fabric } from "@/data/fabrics";

// Helper to format fabric titles elegantly in cursive script (Initial capital, lowercase rest)
export function formatSwatchTitle(name: string): string {
  if (name.toUpperCase() === "NIDA") return "Nida";
  return name;
}

// Pinking-shear sawtooth teeth on left and right vertical edges.
// Kept intentionally low (18 teeth => ~76 vertices) because every extra tooth
// multiplies the mask rasterisation cost across all mounted swatch cards.
export function buildPinkedClipPath(n = 18, indent = 2.6): string {
  const points: string[] = [];
  // Top edge (hidden cleanly under folded header band)
  points.push("0% 0%", "100% 0%");

  // Right edge (sawtooth teeth going from top to bottom)
  for (let i = 0; i < n; i++) {
    const yMid = (((i + 0.5) / n) * 100).toFixed(2);
    const yEnd = (((i + 1) / n) * 100).toFixed(2);
    points.push(`${(100 - indent).toFixed(1)}% ${yMid}%`);
    points.push(`100% ${yEnd}%`);
  }

  // Bottom edge (straight horizontal cut)
  points.push("0% 100%");

  // Left edge (sawtooth teeth going from bottom to top)
  for (let i = n - 1; i >= 0; i--) {
    const yMid = (((i + 0.5) / n) * 100).toFixed(2);
    const yStart = ((i / n) * 100).toFixed(2);
    points.push(`${indent.toFixed(1)}% ${yMid}%`);
    points.push(`0% ${yStart}%`);
  }

  return `polygon(${points.join(", ")})`;
}

export const PINKED_SWATCH_CLIP_PATH = buildPinkedClipPath(18, 2.6);

// Hoisted so the style object identity stays stable across renders.
const SWATCH_CLIP_STYLE: React.CSSProperties = {
  clipPath: PINKED_SWATCH_CLIP_PATH,
  WebkitClipPath: PINKED_SWATCH_CLIP_PATH,
};

const SWATCH_TITLE_STYLE: React.CSSProperties = {
  fontFamily: "'Alex Brush', 'Brush Script MT', 'Caveat', cursive",
};

export interface FabricSwatchCardProps {
  fabric: Fabric;
  idx?: number;
  actionType?: "whatsapp" | "link";
  priority?: boolean;
}

function FabricSwatchCard({
  fabric,
  idx = 0,
  actionType = "whatsapp",
  priority,
}: FabricSwatchCardProps) {
  const isPriority = priority ?? idx < 2;

  return (
    <div className="flex flex-col group h-full">
      {/* 1. Physical Swatch Specimen Card */}
      <Link
        href="/fabrics"
        className="relative w-full bg-[#fbfbf9] rounded-xs shadow-[0_20px_45px_-12px_rgba(0,0,0,0.7),0_2px_8px_rgba(255,255,255,0.06)] border border-neutral-200/50 overflow-hidden flex flex-col transition-transform duration-500 ease-out will-change-auto [@media(hover:hover)]:group-hover:-translate-y-2 cursor-pointer"
      >
        {/* Top Folded Header Strip (Clamping the fabric beneath) */}
        <div className="relative z-20 w-full bg-[#fbfbf9] px-4 sm:px-5 pt-3.5 pb-3 flex items-center justify-between border-b border-neutral-200/90 shadow-[0_4px_10px_-2px_rgba(0,0,0,0.12)]">
          {/* Cursive script fabric title matching the reference image */}
          <span
            className="text-neutral-900 text-lg sm:text-2xl font-normal leading-none tracking-wide select-none truncate pr-2"
            style={SWATCH_TITLE_STYLE}
          >
            {formatSwatchTitle(fabric.name)}
          </span>
        </div>

        {/* Backing Board Stage with Mounted Fabric Swatch */}
        <div className="relative w-full px-2.5 sm:px-4 pt-0 pb-3 sm:pb-5 bg-[#fbfbf9]">
          <div className="relative aspect-[4/4.55] w-full">
            {/* Static cast shadow onto the white cardboard. A solid blurred block
                is painted once, unlike a drop-shadow() filter which re-blurs the
                clipped swatch subtree on every repaint. */}
            <div
              aria-hidden="true"
              className="absolute inset-x-[2.5%] top-[1.5%] -bottom-[1%] translate-x-[2px] translate-y-[4px] bg-black/25 blur-[9px]"
            />

            {/* Real Cloth Swatch with Pinked Zigzag Edges on Left and Right */}
            <div
              className="relative w-full h-full overflow-hidden bg-neutral-200"
              style={SWATCH_CLIP_STYLE}
            >
              <Image
                src={fabric.image}
                alt={`${fabric.name} luxury fabric swatch - Wadi Hattat Trading Dubai`}
                fill
                sizes="(max-width: 640px) 70vw, (max-width: 768px) 46vw, (max-width: 1024px) 32vw, 24vw"
                priority={isPriority}
                draggable={false}
                className="object-cover object-center transform-gpu transition-transform duration-700 ease-out [@media(hover:hover)]:group-hover:scale-105"
              />

              {/* Natural Textile Ambient Shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/10 pointer-events-none" />
            </div>
          </div>
        </div>
      </Link>

      {/* 2. Fabric Information & Wholesale Details (Below Card) */}
      <div className="mt-4 pl-1 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-lg sm:text-xl font-light text-white tracking-wide">
              {fabric.name}
            </h3>
          </div>

          <p className="mt-2 text-xs sm:text-[13px] text-neutral-300 font-light leading-relaxed line-clamp-2">
            {fabric.description}
          </p>
        </div>

        {/* Action Link / WhatsApp Pill */}
        <div className="mt-3.5 pt-2.5  flex items-center justify-between">
          {actionType === "whatsapp" ? (
            <a
              href={`https://wa.me/97143536515?text=Hi%20Wadi%20Hattat%2C%20I%20am%20interested%20in%20swatches%20and%20wholesale%20rolls%20of%20${encodeURIComponent(
                fabric.name,
              )}.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#ddaf4d] hover:text-[#f3d489] transition-colors font-medium group/link"
            >
              <span>Enquire</span>
              <span className="transition-transform group-hover/link:translate-x-1">
                →
              </span>
            </a>
          ) : (
            <Link
              href="/fabrics"
              className="inline-flex items-center gap-1.5 text-xs text-[#ddaf4d] hover:text-[#f3d489] transition-colors font-medium group/link"
            >
              <span>Explore Collection</span>
              <span className="transition-transform group-hover/link:translate-x-1">
                →
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(FabricSwatchCard);
