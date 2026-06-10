import Image from "next/image";
import { Hero3DWrapper } from "@/components/hero-3d-wrapper";
import { Header } from "@/components/header";
import { TokenPackages } from "@/components/token-packages";
import { Portfolios } from "@/components/portfolios";
import { HowItWorks } from "@/components/how-it-works";
import { CtaBanner } from "@/components/cta-banner";
import { Footer } from "@/components/footer";

export default function LandingPage(): React.JSX.Element {
  return (
    <>
      <Header />

      <main className="flex-1">
        {/* ================================================================ *
         * HERO SECTION
         * ================================================================ */}
        <section
          id="hero"
          className="relative min-h-screen flex items-center justify-center overflow-hidden"
        >
          {/* 3D Background Canvas */}
          <Hero3DWrapper />

          {/* Gradient overlays for depth */}
          <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[var(--color-surface-0)] via-transparent to-[var(--color-surface-0)]" />
          <div className="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-r from-[var(--color-surface-0)] via-transparent to-transparent opacity-60" />

          {/* Hero content */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 md:px-12 text-center flex flex-col items-center">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-accent mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <span className="w-2 h-2 rounded-full bg-[var(--color-vcc-green)] animate-pulse-glow" />
              <span className="text-xs font-medium tracking-wider uppercase text-[var(--color-text-secondary)]">
                Diversified Investment Platform
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold font-[family-name:var(--font-heading)] leading-[0.95] mb-6 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <span className="block text-[var(--color-text-primary)]">
                Build Wealth
              </span>
              <span className="block text-[var(--color-vcc-green)] text-glow">
                Across Five
              </span>
              <span className="block text-[var(--color-text-primary)]">
                Asset Classes
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-sm sm:text-base md:text-xl text-[var(--color-text-primary)] font-medium max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed animate-fade-in-up drop-shadow-lg"
              style={{ animationDelay: "0.6s", textShadow: "0 2px 10px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.9)" }}
            >
              Venture Chain Capital distributes your investment across Crypto,
              Stocks, Commodities, Forex, and Hedge portfolios. Each is managed
              by a dedicated portfolio head with transparent, automated accounting.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.8s" }}
            >
              <a
                href="#token-packages"
                className="px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider bg-[var(--color-vcc-green)] text-[var(--color-surface-0)] hover:shadow-[0_0_40px_rgba(0,255,136,0.25)] transition-all duration-200"
              >
                View Packages
              </a>
              <a
                href="#how-it-works"
                className="px-8 py-4 rounded-xl text-sm font-semibold uppercase tracking-wider border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] hover:border-[var(--color-border-accent)] hover:bg-[var(--color-surface-2)] transition-all duration-200"
              >
                Learn More
              </a>
            </div>

            {/* Hero metrics */}
            <div
              className="mt-10 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto animate-fade-in-up"
              style={{ animationDelay: "1.0s" }}
            >
              <div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-vcc-green)]">
                  5
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mt-1">
                  Portfolios
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-vcc-green)]">
                  8
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mt-1">
                  Tier Options
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-vcc-green)]">
                  R62.50
                </div>
                <div className="text-xs text-[var(--color-text-secondary)] font-semibold uppercase tracking-wider mt-1">
                  Starting From
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fade-in-up" style={{ animationDelay: "1.2s" }}>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-secondary)] font-semibold">
              Scroll
            </span>
            <div className="w-px h-8 bg-gradient-to-b from-[var(--color-text-tertiary)] to-transparent" />
          </div>
        </section>

        {/* ================================================================ *
         * CONTENT SECTIONS
         * ================================================================ */}

        {/* Subtle section divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border-subtle)] to-transparent" />

        <TokenPackages />

        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border-subtle)] to-transparent" />

        <Portfolios />

        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-border-subtle)] to-transparent" />

        <HowItWorks />

        <CtaBanner />
      </main>

      <Footer />
    </>
  );
}
