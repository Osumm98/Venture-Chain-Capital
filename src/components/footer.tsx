"use client";

import Image from "next/image";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { Shield, Award, Globe, Landmark, TrendingUp, Lock } from "lucide-react";

/* ─── Partner / Credibility logos ────────────────────────────────────────── */
const PARTNERS = [
  { name: "JSE", icon: Landmark, label: "Johannesburg Stock Exchange" },
  { name: "FSCA", icon: Shield, label: "Financial Sector Conduct Authority" },
  { name: "CoinGecko", icon: TrendingUp, label: "CoinGecko Data" },
  { name: "Luno", icon: Globe, label: "Luno Exchange" },
  { name: "VALR", icon: Award, label: "VALR Exchange" },
  { name: "ISO 27001", icon: Lock, label: "ISO 27001 Certified" },
  { name: "Binance", icon: Globe, label: "Binance Network" },
  { name: "SARB", icon: Landmark, label: "SA Reserve Bank Compliant" },
] as const;

/* ─── Infinite Marquee ──────────────────────────────────────────────────── */
function PartnerMarquee() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Duplicate list to ensure there's enough content to scroll seamlessly
  const items = [...PARTNERS, ...PARTNERS, ...PARTNERS, ...PARTNERS];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !trackRef.current) return;

    // The track contains 4 sets of partners. We want to animate the container
    // leftwards by exactly the width of ONE set, then reset, to create a seamless loop.
    // However, since we want a continuous conveyor belt without calculating exact pixels,
    // we animate it by -50% (since we quadrupled the items, moving -50% shifts it exactly 2 sets).
    // we animate it by -50% (since we quadrupled the items, moving -50% shifts it exactly 2 sets).
    // Using fromTo ensures that React Fast Refresh and Strict Mode don't break the animation state.
    const animation = gsap.fromTo(
      trackRef.current,
      { x: 0 },
      {
        x: "-50%",
        ease: "none",
        duration: 40, // Sped up slightly for a better conveyor feel
        repeat: -1,
      }
    );

    // Add pause on hover
    const handleMouseEnter = () => animation.pause();
    const handleMouseLeave = () => animation.play();

    const el = trackRef.current;
    el.addEventListener("mouseenter", handleMouseEnter);
    el.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      animation.kill();
      el.removeEventListener("mouseenter", handleMouseEnter);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [mounted]);

  return (
    <div className="relative w-full overflow-hidden py-8 border-y border-[var(--color-border-dim)]">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[var(--color-surface-0)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[var(--color-surface-0)] to-transparent z-10 pointer-events-none" />

      {/* Label */}
      <div className="text-center mb-5">
        <span className="text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-tertiary)] font-bold">
          Trusted Integrations & Compliance
        </span>
      </div>

      {/* Scrolling track */}
      <div 
        ref={trackRef}
        className="flex w-max"
        style={{ visibility: mounted ? "visible" : "hidden" }}
      >
        {items.map((partner, idx) => {
          const Icon = partner.icon;
          return (
            <div
              key={`${partner.name}-${idx}`}
              className="flex items-center gap-2.5 px-8 shrink-0 group cursor-default"
            >
              <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-dim)] flex items-center justify-center group-hover:border-[var(--color-border-accent)] group-hover:bg-[var(--color-vcc-green-subtle)] transition-all duration-300">
                <Icon className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-vcc-green)] transition-colors duration-300" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors duration-300 whitespace-nowrap">
                  {partner.name}
                </div>
                <div className="text-[10px] text-[var(--color-text-tertiary)] whitespace-nowrap">
                  {partner.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Footer ───────────────────────────────────────────────────────── */
export function Footer(): React.JSX.Element {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="site-footer"
      className="relative border-t border-[var(--color-border-dim)] bg-[var(--color-surface-0)] overflow-hidden"
    >
      {/* Ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 20% 80%, rgba(0,255,136,0.03) 0%, transparent 50%), radial-gradient(ellipse at 80% 60%, rgba(0,255,136,0.02) 0%, transparent 50%)",
        }}
      />

      {/* Partner Marquee Strip */}
      <PartnerMarquee />

      {/* Main Footer Content */}
      <div className="relative z-[1] max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-20 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 sm:gap-12 mb-10">
          {/* Brand — takes 2 cols */}
          <div className="sm:col-span-2 md:col-span-2">
            <div className="mb-4">
              <a href="/" aria-label="Venture Chain Capital">
                <div className="relative w-[300px] sm:w-[400px] h-[80px] sm:h-[100px]">
                  <Image
                    src="/images/vcc-logo-footer.png"
                    alt="Venture Chain Capital Logo"
                    fill
                    className="object-contain object-left logo-adaptive"
                  />
                </div>
              </a>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm leading-relaxed mb-6">
              A diversified investment platform distributing capital across
              five professionally managed asset class portfolios with
              transparent, rules-based automation.
            </p>

            {/* Trust badges */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-dim)]">
                <Shield className="w-3.5 h-3.5 text-[var(--color-vcc-green)]" />
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  FSCA Compliant
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border-dim)]">
                <Lock className="w-3.5 h-3.5 text-[var(--color-vcc-green)]" />
                <span className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                  256-bit SSL
                </span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] mb-5">
              Platform
            </h4>
            <ul className="space-y-3">
              {["Token Packages", "Portfolios", "How It Works", "Academy", "Markets"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-vcc-green)] transition-colors duration-200 group flex items-center gap-2"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-[var(--color-vcc-green)] transition-all duration-200" />
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {["Terms of Service", "Privacy Policy", "Compliance", "Risk Disclosure"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-vcc-green)] transition-colors duration-200 group flex items-center gap-2"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-[var(--color-vcc-green)] transition-all duration-200" />
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-tertiary)] mb-5">
              Connect
            </h4>
            <ul className="space-y-3">
              {["Support", "Partnerships", "Careers", "Press Kit"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-vcc-green)] transition-colors duration-200 group flex items-center gap-2"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-[var(--color-vcc-green)] transition-all duration-200" />
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-[var(--color-border-dim)] gap-4">
          <p className="text-xs text-[var(--color-text-tertiary)]">
            © {currentYear} Venture Chain Capital (Pty) Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wider">
              South Africa 🇿🇦
            </span>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              Built with precision. Powered by trust.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
