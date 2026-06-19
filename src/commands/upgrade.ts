import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const PKG = "@vivarium-run/cli";

function getInstalledVersion(): string {
  try {
    const dir = dirname(fileURLToPath(import.meta.url));
    const pkg = JSON.parse(readFileSync(resolve(dir, "../../package.json"), "utf-8"));
    return pkg.version;
  } catch {
    return "unknown";
  }
}

function getLatestVersion(): string {
  try {
    return execSync(`npm view ${PKG} version`, { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

export async function upgrade(): Promise<void> {
  const current = getInstalledVersion();
  const latest = getLatestVersion();
  console.log(`Current: ${current}`);
  console.log(`Latest:  ${latest}`);

  if (current === latest) {
    console.log("Already on the latest version.");
    return;
  }

  console.log("Upgrading...");
  try {
    execSync(`npm install -g ${PKG}@latest`, { stdio: "inherit" });
  } catch {
    console.error("Update failed. You may need to run with sudo.");
    process.exit(1);
  }

  console.log(`✓ Updated from ${current} to ${latest}`);
}
