import {
  Activity,
  BarChart3,
  Blocks,
  LayoutDashboard,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";

export const CONTROL_PLANE_BADGE_LABELS = {
  admin: "ADMIN CONTROL",
  owner: "OWNER CONTROL",
} as const;

export const dashboardNavItems = [
  { icon: LayoutDashboard, label: "Command center", path: "/" },
  { icon: MessageSquare, label: "Model-switch chat", path: "/control/chat" },
  { icon: Activity, label: "Provider health", path: "/providers" },
  { icon: BarChart3, label: "Affiliate telemetry", path: "/affiliates" },
  { icon: Blocks, label: "Integration adapters", path: "/integrations" },
  { icon: ShieldCheck, label: "Recovery + policy", path: "/recovery" },
] as const;

export const dashboardA11yContract = {
  navigationLabel: "Toggle navigation",
  providerSelectLabel: "Choose provider route",
  liveRegionPoliteness: "polite",
  recoveryAlertRole: "alert",
  loadingStatusRole: "status",
} as const;
