#!/usr/bin/env node

import { program } from "commander";
import { start } from "./commands/start.js";
import { stop } from "./commands/stop.js";
import { list } from "./commands/list.js";
import { logs } from "./commands/logs.js";
import { shell } from "./commands/shell.js";
import { status } from "./commands/status.js";
import { upgrade } from "./commands/upgrade.js";
import { remove } from "./commands/remove.js";

program
  .name("viv")
  .description("Manage Vivarium sandboxes")
  .version("0.1.0");

program
  .command("start")
  .description("Create and start a new vivarium sandbox")
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
  .command("upgrade [name]")
  .description("Pull latest image and recreate sandbox")
  .option("--image <image>", "OCI image", "ghcr.io/assaf-benjosef/vivarium:latest")
  .action(upgrade);

program
  .command("remove [name]")
  .alias("rm")
  .description("Stop and delete a vivarium sandbox and its volume")
  .option("-f, --force", "Skip confirmation")
  .action(remove);

program.parse();
