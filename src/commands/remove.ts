import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Sandbox, Volume } from "microsandbox";
import { findDefaultVivarium, sandboxName } from "../sandbox.js";
import { uninstallService } from "../service.js";

export async function remove(
  name: string | undefined,
  opts: { force?: boolean }
): Promise<void> {
  const target = name ?? await findDefaultVivarium();
  if (!target) {
    console.error("Specify a vivarium name, or run `viv list` to see available vivariums.");
    process.exit(1);
  }

  const sName = sandboxName(target);

  if (!opts.force) {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    const answer = await rl.question(
      `Remove vivarium "${target}" and its data? This cannot be undone. [y/N] `
    );
    rl.close();
    if (answer.toLowerCase() !== "y") {
      console.log("Cancelled.");
      return;
    }
  }

  // Stop if running
  try {
    const handle = await Sandbox.get(sName);
    if (handle.status === "running") {
      console.log("  Stopping...");
      const sandbox = await Sandbox.startDetached(sName);
      await sandbox.stop();
    }
  } catch {}

  // Remove sandbox
  try {
    await Sandbox.remove(sName);
  } catch {}

  // Remove volume
  try {
    await Volume.remove(sName);
  } catch {}

  // Remove system service
  uninstallService(target);

  console.log(`✓ Vivarium "${target}" removed.`);
}
