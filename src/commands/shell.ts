import { Sandbox } from "microsandbox";
import { findDefaultVivarium, sandboxName } from "../sandbox.js";

export async function shell(name?: string): Promise<void> {
  const target = name ?? await findDefaultVivarium();
  if (!target) {
    console.error("Specify a vivarium name, or run `viv list` to see available vivariums.");
    process.exit(1);
  }

  let sandbox;
  try {
    sandbox = await Sandbox.startDetached(sandboxName(target));
  } catch {
    console.error(`Vivarium "${target}" not found or not running.`);
    process.exit(1);
  }

  const exitCode = await sandbox.attachShell();
  process.exit(exitCode);
}
