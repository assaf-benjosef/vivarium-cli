# Vivarium CLI — Agent Context

## What this is

The `viv` CLI that manages Vivarium sandbox lifecycle via the microsandbox SDK. It creates, starts, stops, and monitors microVMs running the vivarium agent.

## Architecture

```
src/
  index.ts          — CLI entry point (commander)
  sandbox.ts        — microsandbox wrapper: builder, startAgent, list/get helpers
  service.ts        — LaunchAgent (macOS) and systemd (Linux) service install
  port.ts           — Port scanner for auto-assigning from 3000-3099
  commands/
    start.ts        — Create or resume a sandbox, start agent process
    stop.ts         — Stop a running sandbox
    list.ts         — List all vivariums with status table
    logs.ts         — Stream sandbox log output
    shell.ts        — Attach interactive shell
    status.ts       — Show status with CPU/memory metrics
    upgrade.ts      — Pull new image, recreate sandbox preserving volume
    remove.ts       — Delete sandbox, volume, and system service
```

## Key patterns

- Sandboxes are created with `.detached(true)` so they outlive the CLI process
- The agent process is started via `setsid` + `exec` inside the VM, then `sandbox.detach()` releases the native handle
- Named volumes persist `/workspace` across sandbox restarts
- Labels (`vivarium=true`) identify vivarium sandboxes vs other microsandbox VMs
- Single-vivarium default: most commands auto-resolve the name when only one exists

## Environment

- Runtime: Node.js 22+ (ESM, TypeScript compiled to JS)
- Build: `npm run build` → `tsc` → `dist/`
- Key deps: `microsandbox` (SDK + native binary), `commander`

## Related repos

- [vivarium](https://github.com/assaf-benjosef/vivarium) — the agent runtime
- [vivarium-hub](https://github.com/assaf-benjosef/vivarium-hub) — message broker + web console
