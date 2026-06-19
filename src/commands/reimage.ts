import { Sandbox } from "microsandbox";
import { buildSandbox, findDefaultVivarium, sandboxName, startAgent } from "../sandbox.js";
import { loadConfig } from "../config.js";
import { registerVivarium } from "../hub-client.js";

export async function reimage(
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

  const oldConfig = handle.config();

  // Resolve credentials before touching the sandbox
  const config = loadConfig();
  const apiKey = process.env.ANTHROPIC_API_KEY ?? config.apiKey;
  if (!apiKey) {
    console.error("API key required. Set ANTHROPIC_API_KEY or run `viv config set api-key <key>`.");
    process.exit(1);
  }

  let token: string | undefined;
  let hubUrl = "wss://app.vivarium.run/ws";

  if (config.userToken) {
    const hubBase = config.hubUrl ?? "https://app.vivarium.run";
    try {
      const result = await registerVivarium(config.userToken, target, hubBase);
      token = result.token;
      hubUrl = result.hubUrl;
    } catch (err) {
      console.error(err instanceof Error ? err.message : "Failed to register with hub.");
      process.exit(1);
    }
  }

  if (!token) {
    console.error("Hub token required. Run `viv login` first.");
    process.exit(1);
  }

  const port = (oldConfig as Record<string, unknown>).network as { ports?: Array<{ host: number; guest: number }> } | undefined;
  const hostPort = port?.ports?.[0]?.host ?? 3000;

  console.log(`Upgrading vivarium "${target}"...`);

  if (handle.status === "running") {
    console.log("  Stopping...");
    await handle.stop();
  }

  console.log("  Removing old sandbox...");
  await Sandbox.remove(sName);

  console.log(`  Creating with ${opts.image}...`);

  const builder = buildSandbox({
    name: target,
    image: opts.image,
    apiKey,
    hubUrl,
    token,
    port: hostPort,
    cpus: (oldConfig as Record<string, unknown>).cpus as number ?? 2,
    memory: (oldConfig as Record<string, unknown>).memoryMib as number ?? 2048,
  });

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
