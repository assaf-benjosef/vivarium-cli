import { execSync } from "node:child_process";

const PKG = "@vivarium-run/cli";

export async function upgrade(): Promise<void> {
  const current = process.env.npm_package_version ?? getInstalledVersion();
  console.log(`Current version: ${current}`);
  console.log("Checking for updates...");

  try {
    execSync(`npm install -g ${PKG}@latest`, { stdio: "inherit" });
  } catch {
    console.error("Update failed. You may need to run with sudo.");
    process.exit(1);
  }

  const updated = getInstalledVersion();
  if (updated === current) {
    console.log("Already on the latest version.");
  } else {
    console.log(`✓ Updated to ${updated}`);
  }
}

function getInstalledVersion(): string {
  try {
    return execSync(`npm view ${PKG} version`, { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}
