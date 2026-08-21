import React from "react";
import {
  dashboardA11yContract,
  dashboardNavItems,
} from "@/lib/dashboardContracts";

export function DashboardAccessibilityProbe() {
  return (
    <div className="sr-only">
      <nav aria-label="AgentOS control plane navigation">
        {dashboardNavItems.map(item => (
          <a key={item.path} href={item.path}>
            {item.label}
          </a>
        ))}
      </nav>
      <label htmlFor="agentos-provider-probe">Provider route</label>
      <select
        id="agentos-provider-probe"
        aria-label={dashboardA11yContract.providerSelectLabel}
        defaultValue="ollama"
      >
        <option value="ollama">Ollama Local</option>
      </select>
      <button type="button">Run mock health check</button>
      <p aria-live={dashboardA11yContract.liveRegionPoliteness}>
        All live routing flags are disabled by policy.
      </p>
    </div>
  );
}
