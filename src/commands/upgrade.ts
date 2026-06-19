import { Sandbox } from "microsandbox";
import { findDefaultVivarium, sandboxName, startAgent } from "../sandbox.js";

export async function upgrade(
  name: string | undefined,
  opts: { image: string }
): Promise<void> {
  const target = name ?? await findDefaultVivarium();
  if (!target) {
    console.error("Specify a vivarium name, or run `viv list` to see available vivariums.");
    process.exit(1);
  }

  const sName = sandboxName(target);
  let handle;
  try {
    handle = await Sandbox.get(sName);
  } catch {
    console.error(`Vivarium "${target}" not found.`);
    process.exit(1);
  }

  const config = handle.config();

  console.log(`Upgrading vivarium "${target}"...`);

  // Stop if running
  if (handle.status === "running") {
    console.log("  Stopping...");
    await handle.stop();
  }

  // Remove old sandbox (keeps the volume)
  console.log("  Removing old sandbox...");
  await Sandbox.remove(sName);

  // Recreate with new image but same config
  console.log(`  Creating with ${opts.image}...`);
  const builder = Sandbox.builder(sName)
    .image(opts.image)
    .cpus((config as Record<string, unknown>).cpus as number ?? 2)
    .memory((config as Record<string, unknown>).memory as number ?? 2048)
    .volume("/workspace", (v) => v.namedWith(sName, "ensure-exists"))
    .label("vivarium", "true")
    .detached(true);

  // Re-apply env vars from old config
  const envs = (config as Record<string, unknown>).envs as Record<string, string> | undefined;
  if (envs) {
    for (const [key, value] of Object.entries(envs)) {
      builder.env(key, value);
    }
  }

  // Re-apply port mapping
  const ports = (config as Record<string, unknown>).ports as Array<{ host: number; guest: number }> | undefined;
  if (ports) {
    for (const p of ports) {
      builder.port(p.host, p.guest);
    }
  }

  const progress = await builder.createWithPullProgress();
  for await (const event of progress) {
    if (event.kind && event.reference) {
      process.stdout.write(`\r  Pulling: ${event.kind} ${event.reference.slice(0, 20)}...`);
    }
  }
  process.stdout.write("\r" + " ".repeat(60) + "\r");

  const sandbox = await progress.awaitSandbox();
  await startAgent(sandbox);
  console.log(`✓ Vivarium "${target}" upgraded and running.`);
}
