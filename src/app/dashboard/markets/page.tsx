"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Zap,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  getMarketAssets,
  getPortfolioSummary,
  type Asset,
  type AssetCategory,
  type PortfolioSummary,
} from "@/actions/market-data";

/* ─── Micro Sparkline SVG ────────────────────────────────────────────────── */
function Sparkline({ data, positive }: { data: number[]; positive: boolean }) {
  const width = 80;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const gradientId = positive ? "sparkGreen" : "sparkRed";
  const strokeColor = positive ? "var(--color-vcc-green)" : "#ef4444";
  const fillColor = positive ? "rgba(0,255,136,0.08)" : "rgba(239,68,68,0.08)";

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-20 h-8"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillColor} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Portfolio Composition Bar ──────────────────────────────────────────── */
function CompositionBar({
  breakdown,
}: {
  breakdown: PortfolioSummary["categoryBreakdown"];
}) {
  return (
    <div className="flex items-center gap-0.5 h-2 rounded-full overflow-hidden w-full">
      {breakdown.map((segment) => (
        <div
          key={segment.category}
          className="h-full rounded-full transition-all duration-700 ease-out relative group/seg"
          style={{
            width: `${segment.weight}%`,
            backgroundColor: segment.color,
            minWidth: "4px",
          }}
        >
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-md bg-[var(--color-surface-3)] text-[10px] font-bold text-[var(--color-text-primary)] whitespace-nowrap opacity-0 group-hover/seg:opacity-100 transition-opacity pointer-events-none z-10">
            {segment.category} · {segment.weight}%
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Stat Pill ──────────────────────────────────────────────────────────── */
function StatPill({
  label,
  value,
  subValue,
  positive,
  icon: Icon,
}: {
  label: string;
  value: string;
  subValue?: string;
  positive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border-dim)] min-w-[160px]">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          positive === undefined
            ? "bg-[var(--color-vcc-green-subtle)] text-[var(--color-vcc-green)]"
            : positive
            ? "bg-[rgba(0,255,136,0.08)] text-[var(--color-vcc-green)]"
            : "bg-[rgba(239,68,68,0.08)] text-red-500"
        }`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-bold mb-0.5">
          {label}
        </div>
        <div className="text-sm font-bold text-[var(--color-text-primary)] truncate">
          {value}
        </div>
        {subValue && (
          <div
            className={`text-[11px] font-bold ${
              positive ? "text-[var(--color-vcc-green)]" : "text-red-500"
            }`}
          >
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Bento Tile (Hero Asset Card) ───────────────────────────────────────── */
function BentoHeroTile({ asset, size }: { asset: Asset; size: "lg" | "md" | "sm" }) {
  const isPositive = asset.change24h >= 0;

  const sizeClasses = {
    lg: "col-span-2 row-span-2",
    md: "col-span-1 row-span-2",
    sm: "col-span-1 row-span-1",
  };

  return (
    <div
      className={`${sizeClasses[size]} group relative rounded-2xl border border-[var(--color-border-dim)] overflow-hidden transition-all duration-500 hover:border-[var(--color-border-accent)] cursor-pointer`}
      style={{
        background: `linear-gradient(135deg, var(--color-surface-1) 0%, var(--color-surface-2) 100%)`,
      }}
    >
      {/* Performance Glow — ambient light that shifts with performance */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: isPositive
            ? "radial-gradient(ellipse at 30% 20%, rgba(0,255,136,0.06) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 30% 20%, rgba(239,68,68,0.06) 0%, transparent 70%)",
        }}
      />

      <div className={`relative z-[1] h-full flex flex-col justify-between ${size === "lg" ? "p-6" : "p-4"}`}>
        {/* Top Row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                  isPositive
                    ? "bg-[rgba(0,255,136,0.1)] text-[var(--color-vcc-green)]"
                    : "bg-[rgba(239,68,68,0.1)] text-red-500"
                }`}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {isPositive ? "+" : ""}
                {asset.change24h}%
              </span>
              <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
                24h
              </span>
            </div>
            <h3
              className={`font-bold text-[var(--color-text-primary)] ${
                size === "lg" ? "text-xl" : "text-base"
              }`}
            >
              {asset.name}
            </h3>
            <p className="text-xs text-[var(--color-text-tertiary)] font-medium mt-0.5">
              {asset.ticker}
            </p>
          </div>

          {/* Sparkline */}
          <div className="opacity-60 group-hover:opacity-100 transition-opacity">
            <Sparkline data={asset.sparkline} positive={isPositive} />
          </div>
        </div>

        {/* Bottom Row */}
        <div>
          {/* Portfolio Holdings */}
          <div className="mb-3">
            <div className="flex items-baseline justify-between">
              <span
                className={`font-bold tracking-tight text-[var(--color-text-primary)] ${
                  size === "lg" ? "text-2xl" : "text-lg"
                }`}
              >
                R{" "}
                {asset.priceZAR.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          {/* Holdings bar */}
          <div className="flex items-center justify-between py-2 border-t border-[var(--color-border-dim)]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-vcc-green)] animate-pulse" />
              <span className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
                Holdings
              </span>
            </div>
            <span className="text-xs font-bold text-[var(--color-text-secondary)]">
              {asset.portfolioWeight}% · R{" "}
              {asset.holdingsValueZAR.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Shimmer on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.02) 45%, rgba(255,255,255,0.04) 50%, rgba(255,255,255,0.02) 55%, transparent 60%)",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Asset Row (Replaces boring table rows) ─────────────────────────────── */
function AssetRow({ asset, rank }: { asset: Asset; rank: number }) {
  const isPositive = asset.change24h >= 0;

  return (
    <div className="group flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-[var(--color-surface-1)] transition-all duration-200 cursor-pointer border border-transparent hover:border-[var(--color-border-dim)]">
      {/* Rank */}
      <span className="text-[11px] font-bold text-[var(--color-text-tertiary)] w-5 text-center tabular-nums">
        {rank}
      </span>

      {/* Asset Identity */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
            isPositive
              ? "bg-[rgba(0,255,136,0.06)] text-[var(--color-vcc-green)] border border-[rgba(0,255,136,0.12)]"
              : "bg-[rgba(239,68,68,0.06)] text-red-400 border border-[rgba(239,68,68,0.12)]"
          }`}
        >
          {asset.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-[var(--color-text-primary)] truncate">
            {asset.name}
          </div>
          <div className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
            {asset.ticker}
          </div>
        </div>
      </div>

      {/* Sparkline — hidden on small screens */}
      <div className="hidden md:block opacity-50 group-hover:opacity-100 transition-opacity">
        <Sparkline data={asset.sparkline} positive={isPositive} />
      </div>

      {/* Price */}
      <div className="text-right min-w-[100px]">
        <div className="text-sm font-bold text-[var(--color-text-primary)] tabular-nums">
          R {asset.priceZAR.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-[11px] text-[var(--color-text-tertiary)] font-medium">
          {asset.marketCapStr}
        </div>
      </div>

      {/* 24h Change */}
      <div
        className={`text-right min-w-[65px] flex items-center justify-end gap-1 text-sm font-bold ${
          isPositive ? "text-[var(--color-vcc-green)]" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-3.5 h-3.5" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5" />
        )}
        {isPositive ? "+" : ""}
        {asset.change24h}%
      </div>

      {/* Holdings Weight */}
      <div className="hidden lg:flex items-center gap-2 min-w-[120px]">
        <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--color-vcc-green)] transition-all duration-700"
            style={{ width: `${Math.min(asset.portfolioWeight * 3, 100)}%` }}
          />
        </div>
        <span className="text-[11px] font-bold text-[var(--color-text-secondary)] tabular-nums w-10 text-right">
          {asset.portfolioWeight}%
        </span>
      </div>

      {/* Action */}
      <button className="p-2 rounded-lg border border-[var(--color-border-dim)] text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 hover:border-[var(--color-vcc-green)] hover:text-[var(--color-vcc-green)] transition-all duration-200 cursor-pointer">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Main Markets Page ──────────────────────────────────────────────────── */
export default function MarketsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [activeCategory, setActiveCategory] = useState<AssetCategory>("All Assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const categories: AssetCategory[] = [
    "All Assets",
    "Hedge",
    "Stocks",
    "Forex",
    "Commodities",
    "NFTs",
  ];

  useEffect(() => {
    async function loadData() {
      const [assetData, summaryData] = await Promise.all([
        getMarketAssets(),
        getPortfolioSummary(),
      ]);
      setAssets(assetData);
      setSummary(summaryData);
    }
    loadData();
  }, []);

  const featuredAssets = assets.filter((a) => a.isFeatured);
  const allFilteredAssets = assets.filter((asset) => {
    const matchesCategory =
      activeCategory === "All Assets" || asset.category === activeCategory;
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.ticker.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort by portfolio weight descending
  const sortedListAssets = [...allFilteredAssets]
    .filter((a) => !a.isFeatured)
    .sort((a, b) => b.portfolioWeight - a.portfolioWeight);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* ══════════════════════════════════════════════════════════════════
          SECTION 1 — PULSE BANNER (Portfolio Health at a Glance)
         ══════════════════════════════════════════════════════════════════ */}
      {summary && (
        <section className="rounded-2xl border border-[var(--color-border-dim)] overflow-hidden relative">
          {/* Ambient background gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 20% 50%, rgba(0,255,136,0.03) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(0,255,136,0.02) 0%, transparent 60%)",
            }}
          />

          <div className="relative z-[1] p-6">
            {/* Top Line: Total Value + Change */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-[var(--color-vcc-green)]" />
                  <span className="text-[11px] uppercase tracking-widest text-[var(--color-text-tertiary)] font-bold">
                    Portfolio Value
                  </span>
                  <span className="inline-flex w-2 h-2 rounded-full bg-[var(--color-vcc-green)] animate-pulse" />
                </div>
                <div className="flex items-baseline gap-4">
                  <h1 className="text-3xl lg:text-4xl font-bold text-[var(--color-text-primary)] tracking-tight font-[family-name:var(--font-heading)]">
                    R{" "}
                    {summary.totalValueZAR.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </h1>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-sm font-bold ${
                      summary.change24hPercent >= 0
                        ? "bg-[rgba(0,255,136,0.1)] text-[var(--color-vcc-green)]"
                        : "bg-[rgba(239,68,68,0.1)] text-red-500"
                    }`}
                  >
                    {summary.change24hPercent >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {summary.change24hPercent >= 0 ? "+" : ""}
                    {summary.change24hPercent}%
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-3">
                <StatPill
                  label="Best 24h"
                  value={summary.bestPerformer.name}
                  subValue={`+${summary.bestPerformer.change}%`}
                  positive={true}
                  icon={Zap}
                />
                <StatPill
                  label="Worst 24h"
                  value={summary.worstPerformer.name}
                  subValue={`${summary.worstPerformer.change}%`}
                  positive={false}
                  icon={Activity}
                />
                <StatPill
                  label="Total Assets"
                  value={String(summary.totalAssets)}
                  icon={BarChart3}
                />
              </div>
            </div>

            {/* Composition Bar */}
            <div className="space-y-2">
              <CompositionBar breakdown={summary.categoryBreakdown} />
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {summary.categoryBreakdown.map((segment) => (
                  <div key={segment.category} className="flex items-center gap-1.5">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <span className="text-[10px] text-[var(--color-text-tertiary)] font-medium">
                      {segment.category}{" "}
                      <span className="font-bold text-[var(--color-text-secondary)]">
                        {segment.weight}%
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 2 — SEARCH + CATEGORY FILTERS
         ══════════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-[var(--color-text-tertiary)]" />
          </div>
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-surface-1)] border border-[var(--color-border-dim)] rounded-xl text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] transition-all placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>

        {/* Category Filters */}
        <div ref={filterRef} className="flex gap-1.5 overflow-x-auto hide-scrollbar p-0.5">
          {categories.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                onMouseEnter={() => setHoveredCategory(category)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`relative px-4 py-2 rounded-lg whitespace-nowrap text-xs font-bold transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "text-black bg-[var(--color-vcc-green)] shadow-[0_0_12px_rgba(0,255,136,0.25)]"
                    : hoveredCategory === category
                    ? "text-[var(--color-text-primary)] bg-[var(--color-surface-2)]"
                    : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 3 — BENTO GRID (Featured Assets)
         ══════════════════════════════════════════════════════════════════ */}
      {featuredAssets.length > 0 && activeCategory === "All Assets" && !searchQuery && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full bg-[var(--color-vcc-green)]" />
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Spotlight
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 auto-rows-[140px]">
            {featuredAssets[0] && (
              <BentoHeroTile asset={featuredAssets[0]} size="lg" />
            )}
            {featuredAssets[1] && (
              <BentoHeroTile asset={featuredAssets[1]} size="md" />
            )}
            {featuredAssets[2] && (
              <BentoHeroTile asset={featuredAssets[2]} size="sm" />
            )}
            {featuredAssets[3] && (
              <BentoHeroTile asset={featuredAssets[3]} size="sm" />
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          SECTION 4 — ASSET LIST (Modern card-row hybrid)
         ══════════════════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-[var(--color-vcc-green)]" />
            <h2 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              All Holdings
            </h2>
            <span className="text-[11px] font-bold text-[var(--color-text-tertiary)] bg-[var(--color-surface-2)] px-2 py-0.5 rounded-md">
              {allFilteredAssets.length}
            </span>
          </div>

          {/* Column Labels — desktop */}
          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-text-tertiary)]">
            <span className="w-20 text-center">7D</span>
            <span className="w-[100px] text-right">Price</span>
            <span className="w-[65px] text-right">24H</span>
            <span className="hidden lg:block w-[120px] text-right">Weight</span>
            <span className="w-8" />
          </div>
        </div>

        <div className="space-y-1">
          {/* Show featured assets in the list too when filtering */}
          {(activeCategory !== "All Assets" || searchQuery
            ? allFilteredAssets
            : sortedListAssets
          ).map((asset, idx) => (
            <AssetRow key={asset.id} asset={asset} rank={idx + 1} />
          ))}

          {allFilteredAssets.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-[var(--color-text-tertiary)] text-sm">
                No assets match your search.
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
