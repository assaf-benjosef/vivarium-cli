#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { program } from "commander";
import { start } from "./commands/start.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(resolve(__dirname, "../package.json"), "utf-8"));
import { stop } from "./commands/stop.js";
import { list } from "./commands/list.js";
import { logs } from "./commands/logs.js";
import { shell } from "./commands/shell.js";
import { status } from "./commands/status.js";
import { upgrade } from "./commands/upgrade.js";
import { reimage } from "./commands/reimage.js";
import { remove } from "./commands/remove.js";
import { login } from "./commands/login.js";
import { logout } from "./commands/logout.js";
import { whoami } from "./commands/whoami.js";
import { configCmd } from "./commands/config.js";

program
  .name("viv")
  .description("Manage Vivarium sandboxes")
  .version(pkg.version);

program
  .command("start")
  .description("Create and start a new vivarium, or resume a stopped one")
  .option("--name <name>", "Vivarium name")
  .option("--token <token>", "Hub authentication token")
  .option("--hub-url <url>", "Hub WebSocket URL", "wss://app.vivarium.run/ws")
  .option("--api-key <key>", "Anthropic API key")
  .option("--port <port>", "Host port to expose (default: auto-assign 3000-3099)")
  .option("--image <image>", "OCI image", "ghcr.io/assaf-benjosef/vivarium:latest")
  .option("--cpus <n>", "CPU cores", "2")
  .option("--memory <mib>", "Memory in MiB", "2048")
  .option("--no-service", "Don't install system service for auto-restart")
  .action(start);

program
  .command("stop [name]")
  .description("Stop a running vivarium")
  .action(stop);

program
  .command("list")
  .alias("ls")
  .description("List all vivariums")
  .action(list);

program
  .command("logs [name]")
  .description("Stream sandbox output")
  .option("-f, --follow", "Follow log output")
  .action(logs);

program
  .command("shell [name]")
  .description("Open a shell in a vivarium sandbox")
  .action(shell);

program
  .command("status [name]")
  .description("Show vivarium status")
  .action(status);

program
  .command("reimage [name]")
  .description("Pull latest agent image and recreate sandbox")
  .option("--image <image>", "OCI image", "ghcr.io/assaf-benjosef/vivarium:latest")
  .action(reimage);

program
  .command("remove [name]")
  .alias("rm")
  .description("Stop and delete a vivarium sandbox, volume, and system service")
  .option("-f, --force", "Skip confirmation")
  .action(remove);

program
  .command("login")
  .description("Log in to Vivarium Hub via Google OAuth")
  .option("--hub-url <url>", "Hub base URL", "https://app.vivarium.run")
  .action(login);

program
  .command("logout")
  .description("Clear stored credentials")
  .action(logout);

program
  .command("whoami")
  .description("Show the currently logged-in user")
  .action(whoami);

const configCommand = program
  .command("config <subcommand> [args...]")
  .description("Manage CLI configuration")
  .action((sub: string, args: string[]) => configCmd(sub, args));
configCommand.addHelpText(
  "after",
  "\nSubcommands:\n  list              Show current config\n  get <key>         Get a config value\n  set <key> <value> Set a config value (api-key, hub-url)\n  path              Print config file path",
);

program
  .command("upgrade")
  .description("Upgrade the viv CLI to the latest version")
  .action(upgrade);

program.parse();
