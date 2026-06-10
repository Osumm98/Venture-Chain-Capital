"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const MOCK_DATA = [
  { name: "Platinum Tokens", value: 55, color: "var(--color-vcc-green)" },
  { name: "Gold Tokens", value: 30, color: "#D4A853" },
  { name: "Silver Tokens", value: 15, color: "#A8B8C8" },
];

export function AllocationDonut(): React.JSX.Element {
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
              data={MOCK_DATA}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              cornerRadius={4}
            >
              {MOCK_DATA.map((entry, index) => (
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
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
          <span className="text-3xl font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
            72%
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[var(--color-text-tertiary)]">
            Equity Risk
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {MOCK_DATA.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
