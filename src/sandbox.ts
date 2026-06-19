import { Sandbox, type SandboxBuilder } from "microsandbox";

const LABEL_KEY = "vivarium";
const LABEL_VALUE = "true";
const NODE_CMD = "node";
const NODE_ARGS = ["/app/dist/index.js"];

export function sandboxName(name: string): string {
  return `vivarium-${name}`;
}

export function vivariumName(sandboxName: string): string {
  return sandboxName.replace(/^vivarium-/, "");
}

export function buildSandbox(opts: {
  name: string;
  image: string;
  apiKey: string;
  hubUrl: string;
  token: string;
  port: number;
  cpus: number;
  memory: number;
}): SandboxBuilder {
  const sName = sandboxName(opts.name);
  return Sandbox.builder(sName)
    .image(opts.image)
    .cpus(opts.cpus)
    .memory(opts.memory)
    .env("ANTHROPIC_API_KEY", opts.apiKey)
    .env("HUB_URL", opts.hubUrl)
    .env("HUB_TOKEN", opts.token)
    .env("VIVARIUM_NAME", opts.name)
    .port(opts.port, 3000)
    .volume("/workspace", (v) => v.namedWith(sName, "ensure-exists"))
    .label(LABEL_KEY, LABEL_VALUE)
    .detached(true);
}

export async function startAgent(sandbox: InstanceType<typeof Sandbox>): Promise<void> {
  const result = await sandbox.exec("/bin/sh", [
    "-c",
    `setsid ${NODE_CMD} ${NODE_ARGS.join(" ")} </dev/null >/dev/null 2>&1 &`,
  ]);
  if (result.code !== 0) {
    throw new Error(
      `Agent process failed to start (code ${result.code}): ${result.stderr()}`
    );
  }
  await new Promise((r) => setTimeout(r, 2000));
  const check = await sandbox.exec("pgrep", ["-f", NODE_ARGS[0]]);
  if (check.code !== 0) {
    throw new Error("Agent process exited immediately after start");
  }
  await sandbox.detach();
  // Prevent Symbol.asyncDispose from stopping the sandbox on process exit
  (sandbox as unknown as { ownsLifecycle: boolean }).ownsLifecycle = false;
}

export async function listVivariums() {
  return Sandbox.listWith({ labels: { [LABEL_KEY]: LABEL_VALUE } });
}

export async function getVivarium(name: string) {
  return Sandbox.get(sandboxName(name));
}

export async function findDefaultVivarium(): Promise<string | null> {
  const all = await listVivariums();
  if (all.length === 0) return null;
  if (all.length === 1) return vivariumName(all[0].name);
  return null;
}
