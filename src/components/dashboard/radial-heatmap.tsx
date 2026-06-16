"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface RadialHeatmapProps {
  readonly categories: string[];
  readonly activeCategory: string | null;
  readonly onSelectCategory: (cat: string | null) => void;
}

export function RadialHeatmap({ categories, activeCategory, onSelectCategory }: RadialHeatmapProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if (!containerRef.current) return;

    // Simple continuous rotation for the outer rings
    const rings = containerRef.current.querySelectorAll('.radar-ring');
    gsap.to(rings, {
      rotate: 360,
      transformOrigin: "center center",
      duration: 60,
      ease: "none",
      repeat: -1,
      stagger: {
        each: 2,
        from: "center",
      }
    });

    // Pulse effect on the center
    const centerNode = containerRef.current.querySelector('.radar-center');
    if (centerNode) {
      gsap.to(centerNode, {
        scale: 1.2,
        opacity: 0.8,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }
  }, []);

  if (!mounted) return <div className="h-[300px] w-full" />;

  const radius = 120;
  const center = 150;

  return (
    <div className="relative w-full max-w-[400px] aspect-square mx-auto flex items-center justify-center">
      {/* Background ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--color-vcc-green)]/10 to-[#8800ff]/10 rounded-full blur-[60px] pointer-events-none" />

      <div ref={containerRef} className="relative w-[300px] h-[300px]">
        <svg width="300" height="300" viewBox="0 0 300 300" className="overflow-visible">
          {/* Radar Rings */}
          {[1, 2, 3].map((ring) => (
            <circle
              key={`ring-${ring}`}
              className="radar-ring"
              cx={center}
              cy={center}
              r={radius * (ring / 3)}
              fill="none"
              stroke="var(--color-vcc-green)"
              strokeWidth="1"
              strokeDasharray="4 8"
              opacity={0.15 * ring}
            />
          ))}

          {/* Center Node */}
          <circle className="radar-center" cx={center} cy={center} r="4" fill="var(--color-vcc-green)" />

          {/* Categories as points on the radar */}
          {categories.map((cat, i) => {
            const angle = (i * (360 / categories.length) - 90) * (Math.PI / 180);
            const x = center + Math.cos(angle) * (radius * 0.8);
            const y = center + Math.sin(angle) * (radius * 0.8);
            const isActive = activeCategory === cat;

            return (
              <g 
                key={cat} 
                className="cursor-pointer transition-all duration-300 group"
                onClick={() => onSelectCategory(isActive ? null : cat)}
                style={{ transformOrigin: `${x}px ${y}px` }}
              >
                {/* Connecting Line */}
                <line 
                  x1={center} 
                  y1={center} 
                  x2={x} 
                  y2={y} 
                  stroke={isActive ? "var(--color-vcc-green)" : "var(--color-border-dim)"} 
                  strokeWidth="2"
                  className="transition-colors duration-300"
                  opacity={isActive ? 0.6 : 0.2}
                />
                
                {/* Node outer pulse */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 16 : 0}
                  fill="var(--color-vcc-green)"
                  opacity="0.2"
                  className="transition-all duration-500"
                />

                {/* Node */}
                <circle 
                  cx={x} 
                  cy={y} 
                  r={isActive ? 8 : 6} 
                  fill={isActive ? "var(--color-vcc-green)" : "var(--color-surface-2)"}
                  stroke={isActive ? "white" : "var(--color-border-dim)"}
                  strokeWidth="2"
                  className="transition-all duration-300 group-hover:fill-white"
                />

                {/* Label text placed outwards */}
                <text
                  x={center + Math.cos(angle) * (radius * 1.15)}
                  y={center + Math.sin(angle) * (radius * 1.15)}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fill={isActive ? "white" : "var(--color-text-secondary)"}
                  className="text-xs font-bold tracking-wider uppercase transition-colors duration-300 select-none group-hover:fill-[var(--color-vcc-green)]"
                  style={{ filter: isActive ? "drop-shadow(0 0 8px rgba(0,255,136,0.5))" : "none" }}
                >
                  {cat}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="absolute bottom-[-20px] left-0 right-0 text-center">
        <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-[0.2em]">
          Interactive Radar: Click nodes to filter
        </p>
      </div>
    </div>
  );
}
