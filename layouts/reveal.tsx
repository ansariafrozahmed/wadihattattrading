"use client";

import React, { useEffect, useRef, type ReactNode } from "react";

export type RevealVariant = "up" | "down" | "left" | "right" | "fade" | "scale";

export interface RevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  variant?: RevealVariant;
  className?: string;
  as?: React.ElementType;
}

export function Reveal({
  children,
  delay = 0,
  duration,
  variant = "up",
  className = "",
  as: Component = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let doneTimer: ReturnType<typeof setTimeout> | undefined;

    // Once the reveal transition has played, release the `will-change` hint so
    // the element stops holding its own compositor layer for the rest of the
    // page's life (see `.reveal-done` in globals.css).
    const reveal = () => {
      el.classList.add("is-visible");
      const revealDuration = duration ?? 850;
      doneTimer = setTimeout(
        () => el.classList.add("reveal-done"),
        delay + revealDuration + 80,
      );
    };

    // Check if element is already within viewport on initial mount
    const rect = el.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (inViewport) {
      const timer = setTimeout(reveal, Math.min(delay, 250));
      return () => {
        clearTimeout(timer);
        clearTimeout(doneTimer);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: "0px 0px -30px 0px" },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(doneTimer);
    };
  }, [delay, duration]);

  const style: React.CSSProperties = {
    "--reveal-delay": `${delay}ms`,
    ...(duration ? { "--reveal-duration": `${duration}ms` } : {}),
  } as React.CSSProperties;

  return (
    <Component
      ref={ref}
      className={`reveal ${className}`}
      data-reveal-variant={variant}
      style={style}
    >
      {children}
    </Component>
  );
}

export function RevealGroup({
  children,
  baseDelay = 0,
  stagger = 90,
  variant = "up",
  className = "",
}: {
  children: ReactNode;
  baseDelay?: number;
  stagger?: number;
  variant?: RevealVariant;
  className?: string;
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, idx) => {
        if (!React.isValidElement(child)) return child;
        return (
          <Reveal delay={baseDelay + idx * stagger} variant={variant}>
            {child}
          </Reveal>
        );
      })}
    </div>
  );
}
