"use client";

import { useRef, useState, useEffect } from "react";
import { NewsArticle } from "@/actions/news";
import { ExternalLink, Clock } from "lucide-react";

interface NewsCardProps {
  readonly article: NewsArticle;
  readonly index: number;
}

export function NewsCard({ article, index }: NewsCardProps): React.JSX.Element {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top;  // y position within the element.

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5; // max 5 degrees
    const rotateY = ((x - centerX) / centerX) * 5;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  // Determine an accent color based on category
  const catColor = 
    article.category === "Crypto" ? "from-[#00ff88] to-[#00aa55]" :
    article.category === "AI" ? "from-[#8800ff] to-[#5500aa]" :
    article.category === "Commodities" ? "from-[#ffaa00] to-[#cc8800]" :
    article.category === "Forex" ? "from-[#ff0088] to-[#cc0066]" :
    "from-[#0088ff] to-[#0055aa]";

  const shadowColor = 
    article.category === "Crypto" ? "rgba(0,255,136,0.2)" :
    article.category === "AI" ? "rgba(136,0,255,0.2)" :
    article.category === "Commodities" ? "rgba(255,170,0,0.2)" :
    article.category === "Forex" ? "rgba(255,0,136,0.2)" :
    "rgba(0,136,255,0.2)";

  if (!mounted) return <div className="h-[200px] w-full bg-[var(--color-surface-1)] rounded-2xl animate-pulse" />;

  return (
    <a
      ref={cardRef}
      href={article.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative block rounded-2xl p-6 bg-[var(--color-surface-1)] border border-[var(--color-border-dim)] transition-all duration-300 overflow-hidden"
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        boxShadow: isHovering ? `0 20px 40px -10px ${shadowColor}` : "0 4px 20px -10px rgba(0,0,0,0.5)",
      }}
    >
      {/* Dynamic Glow Background */}
      <div 
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${catColor}`}
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-md bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors border border-[var(--color-border-dim)]`}>
              {article.category}
            </span>
            <ExternalLink className="w-4 h-4 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-vcc-green)] transition-colors" />
          </div>

          <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-3 leading-tight group-hover:text-[var(--color-vcc-green)] transition-all">
            {article.title}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border-dim)]/50">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            {article.source}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-tertiary)]">
            <Clock className="w-3.5 h-3.5" />
            <span>{timeAgo(article.pubDate)}</span>
          </div>
        </div>
      </div>
    </a>
  );
}
