import { loadConfig } from "../config.js";
import { getFleet, getFleetStatus } from "../hub-client.js";
import type { FleetVivarium } from "../hub-client.js";

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function requireLogin(): { token: string; hubUrl?: string } {
  const config = loadConfig();
  if (!config.userToken) {
    console.error("Not logged in. Run `viv login` first.");
    process.exit(1);
  }
  return { token: config.userToken, hubUrl: config.hubUrl };
}

async function fleetList(): Promise<void> {
  const { token, hubUrl } = requireLogin();
  const vivariums = await getFleet(token, hubUrl);

  if (vivariums.length === 0) {
    console.log("No vivariums registered. Run `viv start` to create one.");
    return;
  }

  const nameWidth = Math.max(4, ...vivariums.map((v) => v.name.length));
  const versionWidth = Math.max(7, ...vivariums.map((v) => (v.version ?? "—").length));

  console.log("");
  console.log(
    `  ${"NAME".padEnd(nameWidth)}  ${"STATUS".padEnd(8)}  ${"VERSION".padEnd(versionWidth)}  CONNECTED`,
  );
  console.log(
    `  ${"─".repeat(nameWidth)}  ${"─".repeat(8)}  ${"─".repeat(versionWidth)}  ${"─".repeat(12)}`,
  );

  for (const v of vivariums) {
    const status = v.online ? "online" : "offline";
    const version = v.version ?? "—";
    const connected = v.connectedAt ? timeAgo(v.connectedAt) : "—";
    console.log(
      `  ${v.name.padEnd(nameWidth)}  ${status.padEnd(8)}  ${version.padEnd(versionWidth)}  ${connected}`,
    );
  }
  console.log("");
}

async function fleetStatus(name: string): Promise<void> {
  const { token, hubUrl } = requireLogin();
  const vivariums = await getFleet(token, hubUrl);
  const v = vivariums.find((v) => v.name === name);

  if (!v) {
    console.error(`Vivarium "${name}" not found.`);
    process.exit(1);
  }

  console.log(`\n  ${v.name}`);
  console.log(`  Status:     ${v.online ? "online" : "offline"}`);
  console.log(`  Version:    ${v.version ?? "—"}`);
  console.log(`  Created:    ${new Date(v.createdAt).toLocaleString()}`);
  console.log(`  Connected:  ${v.connectedAt ? timeAgo(v.connectedAt) : "—"}`);

  if (v.online) {
    try {
      const status = await getFleetStatus(token, v.id, hubUrl);
      console.log(`  App:        ${status.appRunning ? "running" : "not running"}`);
      const h = Math.floor(status.uptime / 3600);
      const m = Math.floor((status.uptime % 3600) / 60);
      console.log(`  Uptime:     ${h}h ${m}m`);
      if (status.totalCostUsd != null) {
        console.log(`  Cost:       $${status.totalCostUsd.toFixed(2)}`);
      }
      if (status.inputTokens != null) {
        console.log(`  Tokens:     ${status.inputTokens.toLocaleString()}`);
      }
    } catch {
      console.log("  (live status unavailable)");
    }
  }
  console.log("");
}

export async function fleet(sub?: string, name?: string): Promise<void> {
  switch (sub) {
    case undefined:
    case "list":
      return fleetList();

    case "status": {
      if (!name) {
        console.error("Usage: viv fleet status <name>");
        process.exit(1);
      }
      return fleetStatus(name);
    }

    default:
      console.error("Usage: viv fleet [list|status] [name]");
      process.exit(1);
  }
}
