export type TelemetryPoint = {
  label: string;
  clicks: number;
  signups: number;
};

export const affiliateTelemetry: TelemetryPoint[] = [
  { label: "MON", clicks: 86, signups: 19 },
  { label: "TUE", clicks: 112, signups: 26 },
  { label: "WED", clicks: 98, signups: 22 },
  { label: "THU", clicks: 145, signups: 34 },
  { label: "FRI", clicks: 161, signups: 41 },
  { label: "SAT", clicks: 132, signups: 29 },
  { label: "SUN", clicks: 188, signups: 47 },
];

export type TelemetryRange = "2D" | "4D" | "7D";

export function selectTelemetryRange(range: TelemetryRange): TelemetryPoint[] {
  const count = range === "2D" ? 2 : range === "4D" ? 4 : 7;
  return affiliateTelemetry.slice(-count);
}

export function summarizeTelemetry(points: TelemetryPoint[]) {
  const clicks = points.reduce((sum, point) => sum + point.clicks, 0);
  const signups = points.reduce((sum, point) => sum + point.signups, 0);
  return { clicks, signups, conversionRate: clicks ? signups / clicks : 0 };
}
