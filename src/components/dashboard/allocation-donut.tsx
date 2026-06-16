"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// Tier display names and colors — curated palette
const TIER_CONFIG: Record<string, { label: string; color: string }> = {
  ENTRY:     { label: "Entry Tokens",     color: "#6B8F9E" },
  SILVER:    { label: "Silver Tokens",    color: "#A8B8C8" },
  GOLD:      { label: "Gold Tokens",      color: "#D4A853" },
  PLATINUM:  { label: "Platinum Tokens",  color: "var(--color-vcc-green)" },
  DIAMOND:   { label: "Diamond Tokens",   color: "#B9F2FF" },
  GROUP_1:   { label: "Group 1 Tokens",   color: "#7C6EDB" },
  GROUP_2:   { label: "Group 2 Tokens",   color: "#E06C9F" },
  GROUP_3:   { label: "Group 3 Tokens",   color: "#FF9F43" },
};

interface AllocationSlice {
  readonly name: string;
  readonly value: number;
  readonly color: string;
  readonly percentage: number;
}

interface AllocationDonutProps {
  readonly data: ReadonlyArray<AllocationSlice>;
}

export function AllocationDonut({ data }: AllocationDonutProps): React.JSX.Element {
  // If no tokens, show an empty state
  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 h-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-vcc-green-subtle)] rounded-bl-[100px] opacity-20 pointer-events-none" />
        <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-4 text-[var(--color-text-primary)] self-start">
          Allocation Distribution
        </h3>
        <p className="text-sm text-[var(--color-text-tertiary)]">No token holdings to display.</p>
      </div>
    );
  }

  // The largest allocation drives the center percentage
  const topSlice = data.reduce((a, b) => (a.percentage > b.percentage ? a : b), data[0]);

  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-vcc-green-subtle)] rounded-bl-[100px] opacity-20 pointer-events-none" />
      
      <h3 className="text-lg font-bold font-[family-name:var(--font-heading)] mb-6 text-[var(--color-text-primary)]">
        Allocation Distribution
      </h3>

      <div className="flex-1 relative min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data as AllocationSlice[]}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-2)",
                borderRadius: "12px",
                border: "1px solid var(--color-border-subtle)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                color: "var(--color-text-primary)",
              }}
              itemStyle={{ color: "var(--color-text-primary)" }}
              formatter={(value: unknown) => [`${value}%`, "Allocation"]}
            />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text — shows the top allocation */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
          <span className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            {topSlice.percentage}%
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-text-tertiary)]">
            Top Holding
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export { TIER_CONFIG };
export type { AllocationSlice };
