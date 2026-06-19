# @vivarium/cli

CLI for managing [Vivarium](https://github.com/assaf-benjosef/vivarium) sandboxes. Uses [microsandbox](https://github.com/superradcompany/microsandbox) to run the agent in a lightweight microVM with hardware-level isolation.

## Install

```bash
npm install -g @vivarium/cli
```

Requires Node.js 22+ and macOS (Apple Silicon) or Linux with KVM.

## Quick start

```bash
viv start --name my-app --token <HUB_TOKEN>
```

This pulls the vivarium OCI image, boots a microVM, and starts the agent. The agent connects to the hub and is ready to receive messages.

## Commands

| Command | Description |
|---------|-------------|
| `viv start` | Create and start a new vivarium, or resume a stopped one |
| `viv stop [name]` | Stop a running vivarium |
| `viv list` | List all vivariums with status |
| `viv logs [name]` | Stream sandbox output (`-f` to follow) |
| `viv shell [name]` | Open an interactive shell in the sandbox |
| `viv status [name]` | Show status, CPU, and memory usage |
| `viv upgrade [name]` | Pull latest image and recreate (preserves data) |
| `viv remove [name]` | Stop, delete sandbox, volume, and system service |

When only one vivarium exists, the name argument is optional.

### Start options

```
--name <name>       Vivarium name
--token <token>     Hub authentication token
--hub-url <url>     Hub WebSocket URL (default: wss://app.vivarium.run/ws)
--api-key <key>     Anthropic API key (or set ANTHROPIC_API_KEY)
--port <port>       Host port (default: auto-assign from 3000-3099)
--image <image>     OCI image (default: ghcr.io/assaf-benjosef/vivarium:latest)
--cpus <n>          CPU cores (default: 2)
--memory <mib>      Memory in MiB (default: 2048)
--no-service        Don't install system service for auto-restart
```

## How it works

Each vivarium runs inside a [microsandbox](https://github.com/superradcompany/microsandbox) microVM — a real VM with its own Linux kernel, booted from an OCI image in under a second. The agent process runs inside the VM with full access to `/workspace` (a persistent named volume).

On macOS, `viv start` also installs a LaunchAgent so the sandbox auto-restarts on reboot. On Linux, it creates a systemd user service.

## Related

- [vivarium](https://github.com/assaf-benjosef/vivarium) — the agent runtime
- [vivarium-hub](https://github.com/assaf-benjosef/vivarium-hub) — message broker + web console
- [vivarium.run](https://vivarium.run) — landing page

## License

MIT
