"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NewsArticle } from "@/actions/news";
import { NewsCard } from "./news-card";
import { RadialHeatmap } from "./radial-heatmap";

// Register ScrollTrigger
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface NewsDashboardProps {
  readonly initialArticles: ReadonlyArray<NewsArticle>;
}

export function NewsDashboard({ initialArticles }: NewsDashboardProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = ["Crypto", "Stocks", "AI", "Commodities", "Forex"];

  // Compute article counts per category
  const articleCounts: Record<string, number> = {};
  categories.forEach((cat) => {
    articleCounts[cat] = initialArticles.filter(a => a.category === cat).length;
  });

  // Filter articles based on active category
  const filteredArticles = activeCategory 
    ? initialArticles.filter(a => a.category === activeCategory)
    : initialArticles;

  useEffect(() => {
    if (!containerRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      // Background parallax effect
      gsap.to(".parallax-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });

      // Animate cards staggering in
      gsap.from(".news-card-wrapper", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, [filteredArticles]); // Re-run when filter changes to animate new cards

  return (
    <div ref={containerRef} className="relative min-h-screen pb-24 overflow-hidden">
      {/* Dynamic Parallax Background Elements */}
      <div className="parallax-bg absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-vcc-green)]/5 blur-[120px] pointer-events-none" />
      <div className="parallax-bg absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#8800ff]/5 blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8">
        
        {/* Header Area */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-text-primary)] mb-4 tracking-tight">
            Market Intelligence
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto text-lg">
            Real-time algorithmic aggregation of global financial events, shifting the paradigm of how you consume market data.
          </p>
        </div>

        {/* Top Section: Immersive Heatmap */}
        <div className="relative flex justify-center mb-20 bg-[var(--color-surface-0)]/80 backdrop-blur-xl rounded-3xl py-12 px-6 border border-[var(--color-border-dim)] shadow-[0_0_60px_-15px_rgba(0,255,136,0.08)]">
          <RadialHeatmap 
            categories={categories} 
            activeCategory={activeCategory} 
            onSelectCategory={setActiveCategory}
            articleCounts={articleCounts}
          />
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
            <span className="w-2 h-8 bg-[var(--color-vcc-green)] rounded-full inline-block" />
            {activeCategory ? `${activeCategory} Feed` : "Live Feed"}
          </h2>
          <span className="text-sm font-medium text-[var(--color-text-tertiary)] bg-[var(--color-surface-2)] px-3 py-1.5 rounded-lg border border-[var(--color-border-dim)]">
            {filteredArticles.length} Updates
          </span>
        </div>

        {/* News Grid */}
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article, i) => (
              <div key={`${article.link}-${i}`} className="news-card-wrapper h-full">
                <NewsCard article={article} index={i} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border border-dashed border-[var(--color-border-dim)] rounded-2xl bg-[var(--color-surface-1)]/50">
              <p className="text-[var(--color-text-secondary)]">No news available for this category right now.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
