import { loadConfig, saveConfig, getConfigPath } from "../config.js";

const SETTABLE_KEYS: Record<string, string> = {
  "api-key": "apiKey",
  "hub-url": "hubUrl",
};

function mask(value: string): string {
  if (value.length <= 8) return "****";
  return value.slice(0, 4) + "…" + value.slice(-4);
}

export async function configCmd(sub: string, args: string[]): Promise<void> {
  switch (sub) {
    case "path": {
      console.log(getConfigPath());
      return;
    }

    case "list": {
      const config = loadConfig();
      const entries: [string, string][] = [
        ["user-token", config.userToken ? mask(config.userToken) : "(not set)"],
        ["api-key", config.apiKey ? mask(config.apiKey) : "(not set)"],
        ["hub-url", config.hubUrl ?? "(default)"],
      ];
      for (const [key, val] of entries) {
        console.log(`  ${key.padEnd(14)} ${val}`);
      }
      return;
    }

    case "get": {
      const key = args[0];
      if (!key) {
        console.error("Usage: viv config get <key>");
        process.exit(1);
      }
      const field = SETTABLE_KEYS[key];
      if (!field) {
        console.error(`Unknown key: ${key}. Valid keys: ${Object.keys(SETTABLE_KEYS).join(", ")}`);
        process.exit(1);
      }
      const config = loadConfig();
      const val = config[field as keyof typeof config];
      console.log(val ?? "");
      return;
    }

    case "set": {
      const [key, ...rest] = args;
      const value = rest.join(" ");
      if (!key || !value) {
        console.error("Usage: viv config set <key> <value>");
        process.exit(1);
      }
      const field = SETTABLE_KEYS[key];
      if (!field) {
        console.error(`Unknown key: ${key}. Valid keys: ${Object.keys(SETTABLE_KEYS).join(", ")}`);
        process.exit(1);
      }
      const config = loadConfig();
      (config as Record<string, string>)[field] = value;
      saveConfig(config);
      console.log(`✓ ${key} saved.`);
      return;
    }

    default: {
      console.error(
        "Usage: viv config <list|get|set|path> [key] [value]",
      );
      process.exit(1);
    }
  }
}
