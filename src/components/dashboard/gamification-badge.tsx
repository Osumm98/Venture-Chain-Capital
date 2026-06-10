"use client";

import { Award } from "lucide-react";

export function GamificationBadge(): React.JSX.Element {
  // Mock data for the elite badge
  const tierName = "Platinum";
  const tierColor = "var(--color-vcc-green)"; // Matching the screenshot's green/dark vibe or white text

  return (
    <div className="rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center relative overflow-hidden group bg-[#0F172A]">
      {/* Background radial glow */}
      <div 
        className="absolute inset-0 opacity-40 transition-opacity duration-500 group-hover:opacity-60 pointer-events-none"
        style={{ background: `radial-gradient(circle at center, ${tierColor}40 0%, transparent 70%)` }}
      />
      
      <div className="relative z-10">
        <div className="w-16 h-16 mx-auto mb-4 relative">
          <div className="absolute inset-0 bg-white rounded-lg rotate-45 opacity-10 group-hover:rotate-90 transition-transform duration-700" />
          <Award className="w-16 h-16 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
        </div>
        
        <h3 className="text-2xl font-bold font-[family-name:var(--font-heading)] text-white uppercase tracking-wider mb-1">
          {tierName} Tier
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-medium">
          Elite Investor Status
        </p>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white opacity-20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/3 h-1 bg-white" />
    </div>
  );
}
