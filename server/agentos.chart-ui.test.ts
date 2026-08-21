import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));
vi.mock("@/lib/trpc", () => ({
  trpc: { agentos: { telemetry: { useQuery: () => ({ data: undefined }) } } },
}));

import { AffiliateTelemetryChart } from "../client/src/components/AffiliateTelemetryChart";

describe("Affiliate telemetry chart accessibility surface", () => {
  it("renders the labelled range group and interactive range controls", () => {
    const markup = renderToStaticMarkup(createElement(AffiliateTelemetryChart));
    expect(markup).toContain('role="group"');
    expect(markup).toContain('aria-label="Telemetry range"');
    expect(markup).toContain('id="telemetry-start"');
    expect(markup).toContain('id="telemetry-end"');
    expect(markup).toContain('aria-label="Export filtered telemetry CSV"');
    expect(markup).toContain(">7D<");
    expect(markup).toContain(">4D<");
    expect(markup).toContain(">2D<");
    expect(markup).toContain("Affiliate telemetry chart for 7D");
  });
});
