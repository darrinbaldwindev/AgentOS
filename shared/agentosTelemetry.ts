export type TelemetryPoint = {
  date: string;
  label: string;
  clicks: number;
  signups: number;
  activeUsers: number;
};

export const affiliateTelemetry: TelemetryPoint[] = [
  {
    date: "2026-08-15",
    label: "SAT",
    clicks: 86,
    signups: 19,
    activeUsers: 62,
  },
  {
    date: "2026-08-16",
    label: "SUN",
    clicks: 112,
    signups: 26,
    activeUsers: 74,
  },
  {
    date: "2026-08-17",
    label: "MON",
    clicks: 98,
    signups: 22,
    activeUsers: 69,
  },
  {
    date: "2026-08-18",
    label: "TUE",
    clicks: 145,
    signups: 34,
    activeUsers: 88,
  },
  {
    date: "2026-08-19",
    label: "WED",
    clicks: 161,
    signups: 41,
    activeUsers: 96,
  },
  {
    date: "2026-08-20",
    label: "THU",
    clicks: 132,
    signups: 29,
    activeUsers: 81,
  },
  {
    date: "2026-08-21",
    label: "FRI",
    clicks: 188,
    signups: 47,
    activeUsers: 112,
  },
];

export type TelemetryRange = "2D" | "4D" | "7D";

export function selectTelemetryRange(range: TelemetryRange): TelemetryPoint[] {
  const count = range === "2D" ? 2 : range === "4D" ? 4 : 7;
  return affiliateTelemetry.slice(-count);
}

export function filterTelemetryByDateRange(
  points: TelemetryPoint[],
  startDate: string,
  endDate: string
): TelemetryPoint[] {
  return points.filter(
    point => point.date >= startDate && point.date <= endDate
  );
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function telemetryToCsv(points: TelemetryPoint[]): string {
  const header = [
    "date",
    "label",
    "clicks",
    "signups",
    "active_users",
    "conversion_rate",
  ].join(",");
  const rows = points.map(point =>
    [
      point.date,
      point.label,
      point.clicks,
      point.signups,
      point.activeUsers,
      point.clicks ? (point.signups / point.clicks).toFixed(4) : "0",
    ]
      .map(escapeCsvCell)
      .join(",")
  );
  return [header, ...rows].join("\n");
}

export function summarizeTelemetry(points: TelemetryPoint[]) {
  const clicks = points.reduce((sum, point) => sum + point.clicks, 0);
  const signups = points.reduce((sum, point) => sum + point.signups, 0);
  const activeUsers = points.length
    ? Math.max(...points.map(point => point.activeUsers))
    : 0;
  return {
    clicks,
    signups,
    activeUsers,
    conversionRate: clicks ? signups / clicks : 0,
  };
}
