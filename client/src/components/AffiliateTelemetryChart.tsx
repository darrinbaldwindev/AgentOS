import React, { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  selectTelemetryRange,
  summarizeTelemetry,
  type TelemetryRange,
} from "@shared/agentosTelemetry";

const chartConfig = {
  clicks: { label: "Clicks", color: "#67e8f9" },
  signups: { label: "Signups", color: "#f9a8d4" },
} satisfies ChartConfig;

type Range = TelemetryRange;

export function AffiliateTelemetryChart() {
  const [range, setRange] = useState<Range>("7D");
  const { isAuthenticated } = useAuth();
  const telemetryQuery = trpc.agentos.telemetry.useQuery(
    { range },
    { enabled: isAuthenticated }
  );
  const data = telemetryQuery.data?.points ?? selectTelemetryRange(range);
  const summary = telemetryQuery.data?.summary ?? summarizeTelemetry(data);
  const conversionRate = summary.conversionRate * 100;

  return (
    <Card className="border-white/10 bg-white/[0.035] text-white shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <CardTitle className="text-base font-medium">
            Interactive affiliate telemetry
          </CardTitle>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            clicks, signups, and consent-aware conversion
          </p>
        </div>
        <div className="flex gap-1" role="group" aria-label="Telemetry range">
          {(["7D", "4D", "2D"] as Range[]).map(option => (
            <Button
              key={option}
              size="sm"
              variant={range === option ? "default" : "outline"}
              onClick={() => setRange(option)}
              className="h-7 border-white/10 bg-white/5 px-2 font-mono text-[10px]"
            >
              {option}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="font-mono text-[9px] uppercase text-slate-500">
              clicks
            </p>
            <p className="mt-1 text-lg font-semibold text-cyan-100">
              {summary.clicks}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase text-slate-500">
              signups
            </p>
            <p className="mt-1 text-lg font-semibold text-pink-100">
              {summary.signups}
            </p>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase text-slate-500">
              conversion
            </p>
            <p className="mt-1 text-lg font-semibold text-white">
              {conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>
        <ChartContainer
          config={chartConfig}
          className="h-[260px] w-full"
          aria-label={`Affiliate telemetry chart for ${range}`}
        >
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 0, right: 8, top: 10, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="rgba(148,163,184,0.12)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fill: "#64748b", fontSize: 10 }}
            />
            <YAxis hide />
            <ChartTooltip
              cursor={{ stroke: "rgba(103,232,249,0.35)" }}
              content={<ChartTooltipContent />}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke="var(--color-clicks)"
              fill="var(--color-clicks)"
              fillOpacity={0.12}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="signups"
              stroke="var(--color-signups)"
              fill="var(--color-signups)"
              fillOpacity={0.12}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <p className="font-mono text-[10px] leading-5 text-slate-600">
          Source: AgentOS deterministic mock telemetry. No external affiliate
          calls are made.
        </p>
      </CardContent>
    </Card>
  );
}
