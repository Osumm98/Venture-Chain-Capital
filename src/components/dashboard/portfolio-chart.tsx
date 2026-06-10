"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { PortfolioGrowthPoint } from "@/actions/dashboard";

interface PortfolioChartProps {
  readonly data: ReadonlyArray<PortfolioGrowthPoint>;
}

export function PortfolioChart({ data }: PortfolioChartProps): React.JSX.Element {
  const [timeRange, setTimeRange] = useState<"6M" | "1Y" | "ALL">("6M");

  const displayData = useMemo(() => {
    if (data.length === 0) return [];
    
    if (timeRange === "6M") return data;

    // Generate mock past data for 1Y and ALL to demonstrate the toggle
    const mockData = [...data];
    const firstDate = new Date(data[0].date);
    let startValue = data[0].value;
    
    const monthsToAdd = timeRange === "1Y" ? 6 : 18;
    const pastData: PortfolioGrowthPoint[] = [];

    for (let i = monthsToAdd; i > 0; i--) {
      const d = new Date(firstDate);
      d.setMonth(d.getMonth() - i);
      // Simulate lower values in the past
      startValue = startValue * (0.95 + Math.random() * 0.04); 
      pastData.push({
        date: d.toISOString(),
        value: startValue,
      });
    }

    return [...pastData, ...mockData];
  }, [data, timeRange]);

  if (data.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            Portfolio Growth
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-[var(--color-text-tertiary)] text-sm">
          No valuation history available yet. Growth data will appear after your first token valuation cycle.
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 h-full flex flex-col relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            Portfolio Growth
          </h2>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            Performance over the last {timeRange === "ALL" ? "2 years" : timeRange === "1Y" ? "12 months" : "6 months"}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-surface-2)] p-1 rounded-lg border border-[var(--color-border-subtle)]">
          {(["6M", "1Y", "ALL"] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                timeRange === range
                  ? "bg-[var(--color-vcc-green)] text-white shadow-sm"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-[250px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData as PortfolioGrowthPoint[]}
            margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="vccGreenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-vcc-green)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-vcc-green)" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-dim)"
              vertical={false}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-text-tertiary)" }}
              tickFormatter={(dateStr: string) => {
                const dateObj = new Date(dateStr);
                // For ALL, show Year, else show Month
                if (timeRange === "ALL") {
                  return dateObj.toLocaleDateString("en-ZA", { month: "short", year: "2-digit" }).toUpperCase();
                }
                return dateObj.toLocaleDateString("en-ZA", { month: "short" }).toUpperCase();
              }}
              dy={10}
              minTickGap={timeRange === "ALL" ? 40 : 10}
            />

            <YAxis hide domain={['dataMin - 1000', 'dataMax + 1000']} />

            <Tooltip content={<VccTooltip />} cursor={{ stroke: 'var(--color-border-accent)', strokeWidth: 1, strokeDasharray: '3 3' }} />

            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-vcc-green)"
              strokeWidth={3}
              fill="url(#vccGreenGradient)"
              dot={false}
              activeDot={{
                r: 6,
                fill: "var(--color-vcc-green)",
                stroke: "var(--color-surface-0)",
                strokeWidth: 3,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom Tooltip
// ---------------------------------------------------------------------------

interface TooltipPayloadEntry {
  readonly value: number;
}

interface VccTooltipProps {
  readonly active?: boolean;
  readonly payload?: ReadonlyArray<TooltipPayloadEntry>;
  readonly label?: string;
}

function VccTooltip({
  active,
  payload,
  label,
}: VccTooltipProps): React.JSX.Element | null {
  if (!active || !payload || payload.length === 0) return null;

  const value = payload[0].value;
  const dateObj = label ? new Date(label) : new Date();

  return (
    <div className="glass-strong rounded-xl px-4 py-3 border border-[var(--color-border-subtle)]">
      <p className="text-xs text-[var(--color-text-tertiary)] mb-1">
        {dateObj.toLocaleDateString("en-ZA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <p className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-vcc-green)]">
        R{value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
