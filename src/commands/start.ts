import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { Sandbox } from "microsandbox";
import { buildSandbox, sandboxName } from "../sandbox.js";
import { installService } from "../service.js";
import { findAvailablePort } from "../port.js";

export async function start(opts: {
  name?: string;
  token?: string;
  hubUrl: string;
  apiKey?: string;
  port?: string;
  image: string;
  cpus: string;
  memory: string;
  service: boolean;
}): Promise<void> {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  try {
    const name = opts.name ?? await rl.question("Vivarium name: ");
    if (!name) {
      console.error("Name is required.");
      process.exit(1);
    }

    // Check if already running
    try {
      const existing = await Sandbox.get(sandboxName(name));
      if (existing.status === "running") {
        console.log(`Vivarium "${name}" is already running.`);
        return;
      }
      // Stopped — start it
      console.log(`Resuming stopped vivarium "${name}"...`);
      await Sandbox.startDetached(sandboxName(name));
      console.log(`✓ Vivarium "${name}" resumed.`);
      return;
    } catch {
      // Doesn't exist — create it
    }

    const token = opts.token ?? await rl.question("Hub token: ");
    if (!token) {
      console.error("Token is required.");
      process.exit(1);
    }

    const apiKey = opts.apiKey ?? process.env.ANTHROPIC_API_KEY ?? await rl.question("Anthropic API key: ");
    if (!apiKey) {
      console.error("API key is required.");
      process.exit(1);
    }

    const port = opts.port ? parseInt(opts.port, 10) : await findAvailablePort();

    console.log(`\nCreating vivarium "${name}"...`);

    const builder = buildSandbox({
      name,
      image: opts.image,
      apiKey,
      hubUrl: opts.hubUrl,
      token,
      port,
      cpus: parseInt(opts.cpus, 10),
      memory: parseInt(opts.memory, 10),
    });

    const progress = await builder.createWithPullProgress();
    for await (const event of progress) {
      if (event.kind && event.reference) {
        stdout.write(`\r  Pulling: ${event.kind} ${event.reference.slice(0, 20)}...`);
      }
    }
    stdout.write("\r" + " ".repeat(60) + "\r");

    await progress.awaitSandbox();

    console.log(`✓ Vivarium "${name}" is running`);
    console.log(`  App:  http://localhost:${port}`);
    console.log(`  Name: ${name}`);

    if (opts.service) {
      installService(name);
    }

    console.log(`\nUseful commands:`);
    console.log(`  viv logs ${name}     Stream output`);
    console.log(`  viv shell ${name}    Open a shell`);
    console.log(`  viv status ${name}   Check status`);
    console.log(`  viv stop ${name}     Stop`);
  } finally {
    rl.close();
  }
}
