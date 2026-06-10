"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Bitcoin, LineChart, Pickaxe, Landmark, ShieldAlert } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface PortfolioInfo {
  readonly name: string;
  readonly icon: React.ReactNode;
  readonly description: string;
  readonly color: string;
}

const PORTFOLIOS: ReadonlyArray<PortfolioInfo> = [
  {
    name: "Crypto",
    icon: <Bitcoin className="w-6 h-6" />,
    description:
      "Bitcoin, Ethereum, and high-conviction altcoins managed with institutional-grade risk frameworks.",
    color: "#F7931A",
  },
  {
    name: "Stocks",
    icon: <LineChart className="w-6 h-6" />,
    description:
      "Blue-chip equities and high-growth tech companies across global markets (NYSE, JSE, LSE).",
    color: "#4A90D9",
  },
  {
    name: "Commodities",
    icon: <Pickaxe className="w-6 h-6" />,
    description:
      "Gold, silver, and strategic commodity positions hedging against macro volatility.",
    color: "#FFD700",
  },
  {
    name: "Forex",
    icon: <Landmark className="w-6 h-6" />,
    description:
      "Major currency pairs and emerging market FX positions capitalising on monetary policy divergence.",
    color: "#00BFA5",
  },
  {
    name: "Hedge",
    icon: <ShieldAlert className="w-6 h-6" />,
    description:
      "Market-neutral strategies, arbitrage plays, and tail-risk protection across all asset classes.",
    color: "#AB47BC",
  },
];

function PortfolioCard({ portfolio }: { readonly portfolio: PortfolioInfo }): React.JSX.Element {
  const cardRef = useRef<HTMLDivElement>(null);
  const sparklineRef = useRef<SVGPathElement>(null);
  const [transformStyle, setTransformStyle] = useState("");

  useEffect(() => {
    // Animate sparkline drawing
    const path = sparklineRef.current;
    if (!path) return;
    
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: 1.5,
      ease: "power2.out",
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top 80%",
        toggleActions: "play none none none"
      }
    });
  }, []);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate rotation (-10 to 10 degrees based on mouse position relative to center)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
  };

  return (
    <div
      data-portfolio-card
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative rounded-2xl p-6 bg-[var(--color-surface-1)] backdrop-blur-xl border border-[var(--color-border-dim)] hover:border-[var(--color-border-accent)] opacity-0 shadow-lg"
      style={{
        transform: transformStyle,
        transition: transformStyle.includes("scale3d(1, 1, 1)") ? "transform 0.5s ease-out" : "none",
        willChange: "transform"
      }}
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_currentColor]"
        style={{
          background: `${portfolio.color}15`,
          color: portfolio.color,
        }}
      >
        {portfolio.icon}
      </div>

      {/* Content */}
      <h3 className="text-lg font-semibold font-[family-name:var(--font-heading)] mb-2 relative z-10">
        {portfolio.name}
      </h3>
      <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-6 relative z-10">
        {portfolio.description}
      </p>

      {/* Animated Sparkline */}
      <div className="absolute bottom-6 right-6 w-16 h-8 opacity-40 group-hover:opacity-100 transition-opacity duration-300">
        <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
          <path
            ref={sparklineRef}
            d="M 0 30 Q 15 35, 25 20 T 50 15 T 75 25 T 100 5"
            fill="none"
            stroke={portfolio.color}
            strokeWidth="3"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0px 2px 4px ${portfolio.color}40)` }}
          />
        </svg>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: portfolio.color, boxShadow: `0 -2px 10px ${portfolio.color}80` }}
      />
    </div>
  );
}

export function Portfolios(): React.JSX.Element {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const cards = el.querySelectorAll("[data-portfolio-card]");

    if (prefersReducedMotion) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      cards,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      }
    );
  }, []);

  return (
    <section
      id="portfolios"
      ref={sectionRef}
      className="relative py-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto"
    >
      {/* Divider line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-[var(--color-border-subtle)]" />

      <div className="text-center mb-16">
        <p className="text-sm uppercase tracking-[0.3em] text-[var(--color-vcc-green)] font-medium mb-4">
          Diversified Exposure
        </p>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-[family-name:var(--font-heading)] mb-4">
          5 Asset Portfolios
        </h2>
        <p className="text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto">
          Your subscription is allocated across five professionally managed
          portfolios, each led by a dedicated portfolio head.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 perspective-[2000px]">
        {PORTFOLIOS.map((portfolio) => (
          <PortfolioCard key={portfolio.name} portfolio={portfolio} />
        ))}
      </div>
    </section>
  );
}
