import { Sandbox } from "microsandbox";
import { findDefaultVivarium, sandboxName } from "../sandbox.js";

export async function logs(
  name: string | undefined,
  opts: { follow?: boolean }
): Promise<void> {
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

  if (opts.follow) {
    const stream = await handle.logStream({ follow: true });
    for await (const entry of stream) {
      process.stdout.write(entry.data);
    }
  } else {
    const entries = await handle.logs();
    for (const entry of entries) {
      process.stdout.write(entry.data);
    }
  }
}
