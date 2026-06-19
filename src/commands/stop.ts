import { Sandbox } from "microsandbox";
import { findDefaultVivarium, sandboxName } from "../sandbox.js";

export async function stop(name?: string): Promise<void> {
  const target = name ?? await findDefaultVivarium();
  if (!target) {
    console.error("Specify a vivarium name, or run `viv list` to see available vivariums.");
    process.exit(1);
  }

  try {
    const handle = await Sandbox.get(sandboxName(target));
    if (handle.status !== "running") {
      console.log(`Vivarium "${target}" is already stopped.`);
      return;
    }
  } catch {
    console.error(`Vivarium "${target}" not found.`);
    process.exit(1);
  }

  const sandbox = await Sandbox.startDetached(sandboxName(target));
  await sandbox.stop();
  console.log(`✓ Vivarium "${target}" stopped.`);
}
