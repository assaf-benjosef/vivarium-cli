import { readFileSync, writeFileSync, mkdirSync, chmodSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export interface VivariumConfig {
  userToken?: string;
  apiKey?: string;
  hubUrl?: string;
}

const CONFIG_DIR = join(homedir(), ".config", "vivarium");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function loadConfig(): VivariumConfig {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

export function saveConfig(config: VivariumConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", {
    mode: 0o600,
  });
}
