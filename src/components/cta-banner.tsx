"use client";

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";

/* ─── Contained Floating Embers ─────────────────────────────────────────── */
function ContainedEmbers() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const embers = containerRef.current?.querySelectorAll(".cta-ember");
    if (!embers) return;

    embers.forEach((ember) => {
      const size = 2 + Math.random() * 5;
      
      // Random starting positions across the entire box
      const startLeft = Math.random() * 100;
      const startTop = Math.random() * 100;
      
      const duration = 15 + Math.random() * 20;
      // Negative delay means the animation is already in progress when the page loads
      const delay = Math.random() * -20;

      gsap.fromTo(
        ember,
        {
          left: `${startLeft}%`,
          top: `${startTop}%`,
          x: 0,
          y: 0,
          opacity: 0,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: "var(--color-vcc-green)",
          boxShadow: `0 0 ${size * 3}px ${size}px rgba(0,255,136,0.3)`,
        },
        {
          // Drift upwards and slightly sideways in pixels
          x: `${(Math.random() - 0.5) * 100}px`,
          y: `-${100 + Math.random() * 150}px`,
          opacity: 0,
          duration: duration,
          ease: "sine.inOut",
          repeat: -1,
          delay: delay,
          keyframes: {
            "0%": { opacity: 0 },
            "20%": { opacity: 0.6 },
            "80%": { opacity: 0.6 },
            "100%": { opacity: 0 },
          },
        }
      );
    });
  }, [mounted]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-2xl sm:rounded-3xl">
      {mounted && Array.from({ length: 30 }).map((_, i) => (
        <div
          key={i}
          className="cta-ember absolute rounded-full"
        />
      ))}
    </div>
  );
}

/* ─── CTA Banner ────────────────────────────────────────────────────────── */
export function CtaBanner(): React.JSX.Element {
  return (
    <section className="relative py-24 px-6 md:px-12 lg:px-20">
      <div className="max-w-4xl mx-auto text-center rounded-2xl sm:rounded-3xl p-6 sm:p-12 md:p-16 glass-accent glow-green relative overflow-hidden noise">
        {/* Embers contained inside this box */}
        <ContainedEmbers />

        <h2 className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-bold font-[family-name:var(--font-heading)] mb-4">
          Start Building Your Portfolio
        </h2>
        <p className="relative z-10 text-sm sm:text-base md:text-lg text-[var(--color-text-secondary)] mb-6 sm:mb-8 max-w-xl mx-auto">
          Join Venture Chain Capital and gain access to institutional-grade
          portfolio management from as little as R62.50 per month.
        </p>
        <a
          href="#token-packages"
          className="relative z-10 inline-block px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[var(--color-vcc-green)] text-[var(--color-surface-0)] hover:shadow-[0_0_40px_rgba(0,255,136,0.25)] transition-all duration-200"
        >
          Get Started Today
        </a>
      </div>
    </section>
  );
}
