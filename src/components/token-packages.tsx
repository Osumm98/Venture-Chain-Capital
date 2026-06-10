"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Crown, Gem, Award, Shield, Star, Users, Building2, Briefcase } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ---------------------------------------------------------------------------
// Tier Configuration — each tier has its own luxe identity
// ---------------------------------------------------------------------------

interface TierTheme {
  readonly color: string;
  readonly glow: string;
  readonly gradientFrom: string;
  readonly gradientTo: string;
  readonly icon: React.ReactNode;
}

const TIER_THEMES: Record<string, TierTheme> = {
  ENTRY: {
    color: "#7C8A98",
    glow: "rgba(124, 138, 152, 0.12)",
    gradientFrom: "rgba(124, 138, 152, 0.06)",
    gradientTo: "transparent",
    icon: <Shield className="w-5 h-5" />,
  },
  SILVER: {
    color: "#A8B8C8",
    glow: "rgba(168, 184, 200, 0.15)",
    gradientFrom: "rgba(168, 184, 200, 0.06)",
    gradientTo: "transparent",
    icon: <Star className="w-5 h-5" />,
  },
  GOLD: {
    color: "#D4A853",
    glow: "rgba(212, 168, 83, 0.2)",
    gradientFrom: "rgba(212, 168, 83, 0.08)",
    gradientTo: "transparent",
    icon: <Crown className="w-5 h-5" />,
  },
  PLATINUM: {
    color: "#B8C4D0",
    glow: "rgba(184, 196, 208, 0.15)",
    gradientFrom: "rgba(184, 196, 208, 0.06)",
    gradientTo: "transparent",
    icon: <Award className="w-5 h-5" />,
  },
  DIAMOND: {
    color: "#7EB8E0",
    glow: "rgba(126, 184, 224, 0.2)",
    gradientFrom: "rgba(126, 184, 224, 0.08)",
    gradientTo: "transparent",
    icon: <Gem className="w-5 h-5" />,
  },
  GROUP_1: {
    color: "#00CC6A",
    glow: "rgba(0, 204, 106, 0.15)",
    gradientFrom: "rgba(0, 204, 106, 0.06)",
    gradientTo: "transparent",
    icon: <Users className="w-5 h-5" />,
  },
  GROUP_2: {
    color: "#00FF88",
    glow: "rgba(0, 255, 136, 0.2)",
    gradientFrom: "rgba(0, 255, 136, 0.08)",
    gradientTo: "transparent",
    icon: <Building2 className="w-5 h-5" />,
  },
  GROUP_3: {
    color: "#00CC6A",
    glow: "rgba(0, 204, 106, 0.15)",
    gradientFrom: "rgba(0, 204, 106, 0.06)",
    gradientTo: "transparent",
    icon: <Briefcase className="w-5 h-5" />,
  },
};

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

interface TokenPackage {
  readonly tier: string;
  readonly label: string;
  readonly monthlyZar: string;
  readonly adminFee: string;
  readonly profitFee: string;
  readonly type: "individual" | "organisational";
  readonly accent: boolean;
}

const INDIVIDUAL_PACKAGES: ReadonlyArray<TokenPackage> = [
  { tier: "ENTRY", label: "Entry", monthlyZar: "62.50", adminFee: "9.75%", profitFee: "9.15%", type: "individual", accent: false },
  { tier: "SILVER", label: "Silver", monthlyZar: "125.00", adminFee: "9.50%", profitFee: "9.00%", type: "individual", accent: false },
  { tier: "GOLD", label: "Gold", monthlyZar: "250.00", adminFee: "8.85%", profitFee: "8.75%", type: "individual", accent: true },
  { tier: "PLATINUM", label: "Platinum", monthlyZar: "1,000.00", adminFee: "8.50%", profitFee: "8.50%", type: "individual", accent: false },
  { tier: "DIAMOND", label: "Diamond", monthlyZar: "2,500.00", adminFee: "8.15%", profitFee: "8.15%", type: "individual", accent: false },
];

const ORG_PACKAGES: ReadonlyArray<TokenPackage> = [
  { tier: "GROUP_1", label: "Group 1", monthlyZar: "750.00", adminFee: "8.60%", profitFee: "8.75%", type: "organisational", accent: false },
  { tier: "GROUP_2", label: "Group 2", monthlyZar: "2,250.00", adminFee: "8.25%", profitFee: "8.25%", type: "organisational", accent: true },
  { tier: "GROUP_3", label: "Group 3", monthlyZar: "5,000.00", adminFee: "8.00%", profitFee: "8.00%", type: "organisational", accent: false },
];

// ---------------------------------------------------------------------------
// Package Card — Premium
// ---------------------------------------------------------------------------

function PackageCard({
  pkg,
  index,
}: {
  readonly pkg: TokenPackage;
  readonly index: number;
}): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const theme = TIER_THEMES[pkg.tier];

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 60, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        delay: index * 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, [index]);

  const cardClass = pkg.accent
    ? "card-featured shimmer-effect"
    : "card-premium shimmer-effect";

  return (
    <div
      ref={cardRef}
      id={`package-${pkg.tier.toLowerCase()}`}
      className={`group relative rounded-2xl p-6 ${cardClass} cursor-pointer opacity-0 overflow-hidden`}
      style={{
        willChange: "transform, opacity",
        ["--tier-color" as string]: theme.color,
        ["--tier-glow" as string]: theme.glow,
      }}
    >
      {/* Top ambient glow — tier-specific */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl"
        style={{ background: theme.color }}
      />

      {/* Accent badge */}
      {pkg.accent && (
        <div
          className="absolute -top-px left-6 right-6 h-[2px] rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.color}, transparent)` }}
        />
      )}

      {/* Tier badge + label */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`,
              color: theme.color,
              boxShadow: `0 0 0 1px ${theme.color}20`,
            }}
          >
            {theme.icon}
          </div>
          <div>
            <h3 className="text-base font-semibold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)] leading-tight">
              {pkg.label}
            </h3>
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[var(--color-text-tertiary)]">
              {pkg.type === "individual" ? "Individual" : "Organisation"}
            </span>
          </div>
        </div>

        {pkg.accent && (
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
            style={{
              background: `${theme.color}15`,
              color: theme.color,
              border: `1px solid ${theme.color}30`,
            }}
          >
            Popular
          </span>
        )}
      </div>

      {/* Price — heroic typography */}
      <div className="mb-6 relative z-10">
        <div className="flex items-baseline gap-0.5">
          <span className="text-sm font-medium text-[var(--color-text-tertiary)]">R</span>
          <span className="text-4xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)] tracking-tight leading-none">
            {pkg.monthlyZar}
          </span>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-1.5 tracking-wide">per month</p>
      </div>

      {/* Fee breakdown — refined data rows */}
      <div className="space-y-0 mb-6 relative z-10">
        <div className="flex justify-between items-center py-2.5 border-t border-[var(--color-border-dim)]">
          <span className="text-xs text-[var(--color-text-secondary)] tracking-wide">Admin Fee</span>
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 group-hover:opacity-100 opacity-60"
                style={{
                  width: `${parseFloat(pkg.adminFee) * 10}%`,
                  background: theme.color,
                }}
              />
            </div>
            <span className="text-xs font-semibold font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] w-12 text-right">
              {pkg.adminFee}
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center py-2.5 border-t border-[var(--color-border-dim)]">
          <span className="text-xs text-[var(--color-text-secondary)] tracking-wide">Profit Fee</span>
          <div className="flex items-center gap-2">
            <div className="w-12 h-1 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 group-hover:opacity-100 opacity-60"
                style={{
                  width: `${parseFloat(pkg.profitFee) * 10}%`,
                  background: theme.color,
                }}
              />
            </div>
            <span className="text-xs font-semibold font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] w-12 text-right">
              {pkg.profitFee}
            </span>
          </div>
        </div>
      </div>

      {/* CTA — tier-colored */}
      <button
        type="button"
        className="group/btn relative w-full py-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center gap-2"
        style={{
          background: pkg.accent ? theme.color : "transparent",
          color: pkg.accent ? "var(--color-surface-0)" : theme.color,
          border: pkg.accent ? "none" : `1px solid ${theme.color}30`,
          boxShadow: pkg.accent ? `0 0 24px ${theme.glow}` : "none",
        }}
      >
        <span className="transition-transform duration-300 group-hover/btn:-translate-x-1">Select Plan</span>
        <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-4 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:translate-x-0" />
      </button>

      {/* Bottom tier-glow line on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${theme.color}, transparent)` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------

export function TokenPackages(): React.JSX.Element {
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = headingRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <section
      id="token-packages"
      className="relative py-24 px-4 sm:px-6 md:px-12 lg:px-20 max-w-7xl mx-auto"
    >
      {/* Section heading */}
      <div ref={headingRef} className="text-center mb-16 opacity-0 relative z-10">
        <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[var(--color-vcc-green)] font-medium mb-4">
          Investment Tiers
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-4">
          Token Packages
        </h2>
        <p className="text-sm sm:text-base md:text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Choose your entry point into the Venture Chain Capital ecosystem.
          Each tier unlocks proportional access to our diversified portfolio.
        </p>
      </div>

      {/* Individual Tiers */}
      <div className="mb-20">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[var(--color-border-subtle)]" />
          <h3 className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-tertiary)] font-medium">
            Individual Plans
          </h3>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[var(--color-border-subtle)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {INDIVIDUAL_PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.tier} pkg={pkg} index={i} />
          ))}
        </div>
      </div>

      {/* Organisational Tiers */}
      <div>
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-r from-transparent to-[var(--color-border-subtle)]" />
          <h3 className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-tertiary)] font-medium">
            Organisational Plans
          </h3>
          <div className="h-px flex-1 max-w-[80px] bg-gradient-to-l from-transparent to-[var(--color-border-subtle)]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
          {ORG_PACKAGES.map((pkg, i) => (
            <PackageCard key={pkg.tier} pkg={pkg} index={i + INDIVIDUAL_PACKAGES.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
