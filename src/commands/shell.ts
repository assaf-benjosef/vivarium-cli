import { Sandbox } from "microsandbox";
import { findDefaultVivarium, sandboxName } from "../sandbox.js";

export async function shell(name?: string): Promise<void> {
  const target = name ?? await findDefaultVivarium();
  if (!target) {
    console.error("Specify a vivarium name, or run `viv list` to see available vivariums.");
    process.exit(1);
  }

  let handle;
  try {
    handle = await Sandbox.get(sandboxName(target));
  } catch {
    console.error(`Vivarium "${target}" not found.`);
    process.exit(1);
  }

  if (handle.status !== "running") {
    console.error(`Vivarium "${target}" is not running.`);
    process.exit(1);
  }

  const sandbox = await handle.connect();
  const exitCode = await sandbox.attachShell();
  process.exit(exitCode);
}
