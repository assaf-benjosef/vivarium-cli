import { Sandbox } from "microsandbox";
import { findDefaultVivarium, sandboxName, vivariumName } from "../sandbox.js";

export async function status(name?: string): Promise<void> {
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

  console.log("");
  console.log(`  Name:     ${vivariumName(handle.name)}`);
  console.log(`  Status:   ${handle.status}`);
  console.log(`  Created:  ${handle.createdAt?.toLocaleString() ?? "—"}`);
  console.log(`  Updated:  ${handle.updatedAt?.toLocaleString() ?? "—"}`);

  if (handle.status === "running") {
    try {
      const metrics = await handle.metrics();
      console.log(`  CPU:      ${metrics.cpuPercent.toFixed(1)}%`);
      console.log(`  Memory:   ${(metrics.memoryBytes / 1024 / 1024).toFixed(0)} MiB`);
    } catch {}
  }

  console.log("");
}
