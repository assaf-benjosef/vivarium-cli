import { loadConfig } from "../config.js";
import { getMe } from "../hub-client.js";

export async function whoami(): Promise<void> {
  const config = loadConfig();
  if (!config.userToken) {
    console.log("Not logged in. Run `viv login` to authenticate.");
    return;
  }

  try {
    const user = await getMe(config.userToken, config.hubUrl);
    console.log(`${user.displayName ?? user.email} (${user.email})`);
  } catch (err) {
    console.error(
      err instanceof Error ? err.message : "Failed to fetch user info.",
    );
    process.exit(1);
  }
}
