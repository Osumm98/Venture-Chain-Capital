"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const TIERS = [
  { name: "Starter", amount: 500, yield: 8 },
  { name: "Silver", amount: 1500, yield: 10 },
  { name: "Gold", amount: 5000, yield: 12 },
  { name: "Platinum", amount: 15000, yield: 15 },
];

export function HowItWorks(): React.JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [tierIndex, setTierIndex] = useState(0);
  
  const selectedTier = TIERS[tierIndex];
  const annualInvestment = selectedTier.amount * 12;
  const projectedReturn = annualInvestment * (1 + selectedTier.yield / 100);

  const STEPS = [
    {
      number: "01",
      title: "Select Your Tier",
      description: "Choose your monthly investment tier. Each tier unlocks higher access to premium asset classes and enhanced proportional returns.",
      interactive: true,
    },
    {
      number: "02",
      title: "Monthly Contributions",
      description: `Your R${selectedTier.amount.toLocaleString()} is automatically distributed across our top-performing portfolios (Crypto, Stocks, Hedge) based on algorithmic balancing.`,
    },
    {
      number: "03",
      title: "Token Valuation",
      description: `Your capital is minted into secured digital tokens. With the ${selectedTier.name} tier, your tokens unlock an estimated ${selectedTier.yield}% annual yield.`,
    },
    {
      number: "04",
      title: "Annual Payout",
      description: `At year-end, your R${annualInvestment.toLocaleString()} investment has a projected growth to R${projectedReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}. Choose to cash out or compound for the following year.`,
    },
  ];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(el.querySelectorAll("[data-step]"), { opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set(lineRef.current, { scaleY: 1 });
      return;
    }

    // The Energy Conduit Line
    if (lineRef.current) {
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top center",
            end: "bottom center",
            scrub: true,
          },
        }
      );
    }

    // Reveal steps as the scroll reaches them (Detonation Effect)
    const steps = el.querySelectorAll("[data-step]");
    steps.forEach((step, index) => {
      const isEven = index % 2 === 0;
      const xOffset = isEven ? -80 : 80;

      gsap.fromTo(
        step,
        { opacity: 0.1, x: xOffset, filter: "blur(10px)", scale: 0.95 },
        {
          opacity: 1,
          x: 0,
          filter: "blur(0px)",
          scale: 1,
          duration: 1,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: step,
            start: "top 65%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate the pulsing dot (Node Burst)
      const dot = step.querySelector("[data-dot]");
      if (dot) {
        gsap.fromTo(
          dot,
          { scale: 0, opacity: 0, backgroundColor: "rgba(255,255,255,0.2)" },
          {
            scale: 1,
            opacity: 1,
            backgroundColor: "var(--color-vcc-green)",
            boxShadow: "0 0 30px var(--color-vcc-green), 0 0 60px var(--color-vcc-green)",
            duration: 0.6,
            scrollTrigger: {
              trigger: step,
              start: "top 60%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    });
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-16 sm:py-32 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto overflow-hidden"
    >
      <div className="text-center mb-12 sm:mb-24">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-vcc-green)] font-medium mb-4">
          Your Journey
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-4">
          How It Works
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          From selection to payout, experience an interactive, transparent process powered by immutable financial logic. Adjust the slider below to simulate your journey.
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Central track line background */}
        <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[2px] bg-[var(--color-border-subtle)]" />
        
        {/* Animated immaculate glowing line drawn on scroll (The Energy Conduit) */}
        <div 
          ref={lineRef}
          className="absolute left-6 md:left-1/2 md:-translate-x-1/2 top-0 bottom-0 w-[4px] bg-gradient-to-b from-[var(--color-vcc-green)] via-[var(--color-vcc-green)] to-transparent origin-top z-10 transition-all duration-300"
          style={{ 
            boxShadow: `0 0 ${20 + tierIndex * 10}px var(--color-vcc-green), 0 0 ${40 + tierIndex * 20}px var(--color-vcc-green)`,
            filter: `brightness(${1 + tierIndex * 0.2})` 
          }}
        />

        <div className="space-y-24">
          {STEPS.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={step.number}
                data-step
                className={`relative flex items-center md:justify-between w-full ${
                  isEven ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                {/* Desktop Spacer */}
                <div className="hidden md:block w-5/12" />

                {/* Central Dot */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 flex items-center justify-center w-8 h-8 z-20">
                  <div
                    data-dot
                    className="w-4 h-4 rounded-full bg-[rgba(255,255,255,0.2)] relative z-10"
                  />
                  {/* Pulsing ring around dot */}
                  <div className="absolute inset-0 rounded-full border-2 border-[var(--color-vcc-green)] animate-ping opacity-50" />
                </div>

                {/* Card Content */}
                <div className="w-full md:w-5/12 pl-14 sm:pl-16 md:pl-0">
                  <div className={`relative rounded-3xl p-6 sm:p-8 bg-[var(--color-surface-1)]/80 backdrop-blur-2xl border border-[var(--color-border-dim)] hover:border-[var(--color-vcc-green)]/60 transition-all duration-500 hover:shadow-[0_0_40px_rgba(0,255,136,0.15)] group ${
                    isEven ? "md:text-right" : "text-left"
                  }`}>
                    {/* Glowing corner accent */}
                    <div className={`absolute top-0 w-24 h-[2px] bg-gradient-to-r from-[var(--color-vcc-green)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                      isEven ? "right-6 rotate-180" : "left-6"
                    }`} />

                    <div className={`text-5xl sm:text-7xl font-bold font-[family-name:var(--font-heading)] dark:text-[var(--color-vcc-green)] text-[#004d26] dark:opacity-10 opacity-20 mb-3 sm:mb-4 tracking-tighter transition-all duration-300 group-hover:scale-110 group-hover:opacity-30 ${
                      isEven ? "md:ml-auto md:origin-right" : "origin-left"
                    }`}>
                      {step.number}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)] mb-3 sm:mb-4 group-hover:text-[var(--color-vcc-green)] transition-colors duration-300">
                      {step.title}
                    </h3>
                    
                    <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed group-hover:text-[var(--color-text-primary)] transition-colors duration-300">
                      {step.description}
                    </p>

                    {/* Interactive Slider ONLY for Step 01 */}
                    {step.interactive && (
                      <div className="mt-8 pt-6 border-t border-[var(--color-border-subtle)]">
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold block mb-1">Simulated Tier</span>
                            <span className="text-lg font-bold text-[var(--color-vcc-green)]">{selectedTier.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs uppercase tracking-wider text-[var(--color-text-tertiary)] font-bold block mb-1">Monthly</span>
                            <span className="text-xl font-bold text-[var(--color-text-primary)]">R {selectedTier.amount.toLocaleString()}</span>
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max={TIERS.length - 1}
                          step="1"
                          value={tierIndex}
                          onChange={(e) => setTierIndex(parseInt(e.target.value))}
                          className="w-full h-2 bg-[var(--color-surface-2)] rounded-lg appearance-none cursor-pointer accent-[var(--color-vcc-green)] hover:accent-green-400 transition-all"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-[var(--color-text-tertiary)] font-medium uppercase tracking-wider">
                          <span>Starter</span>
                          <span>Platinum</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
