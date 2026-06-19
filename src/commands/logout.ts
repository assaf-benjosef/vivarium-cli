import { loadConfig, saveConfig } from "../config.js";

export async function logout(): Promise<void> {
  const config = loadConfig();
  if (!config.userToken) {
    console.log("Not logged in.");
    return;
  }
  delete config.userToken;
  saveConfig(config);
  console.log("✓ Logged out.");
}
