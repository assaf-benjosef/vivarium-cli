import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execSync } from "node:child_process";
import { homedir, platform } from "node:os";
import { join } from "node:path";

export function installService(name: string): void {
  if (platform() === "darwin") {
    installLaunchAgent(name);
  } else {
    installSystemdService(name);
  }
}

export function uninstallService(name: string): void {
  if (platform() === "darwin") {
    uninstallLaunchAgent(name);
  } else {
    uninstallSystemdService(name);
  }
}

function launchAgentLabel(name: string): string {
  return `com.vivarium.${name}`;
}

function launchAgentPath(name: string): string {
  return join(homedir(), "Library", "LaunchAgents", `${launchAgentLabel(name)}.plist`);
}

function installLaunchAgent(name: string): void {
  const vivPath = execSync("which viv", { encoding: "utf-8" }).trim();
  const label = launchAgentLabel(name);
  const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${vivPath}</string>
    <string>start</string>
    <string>--name</string>
    <string>${name}</string>
    <string>--no-service</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <dict>
    <key>SuccessfulExit</key>
    <false/>
  </dict>
  <key>StandardOutPath</key>
  <string>/tmp/vivarium-${name}.log</string>
  <key>StandardErrorPath</key>
  <string>/tmp/vivarium-${name}.log</string>
</dict>
</plist>`;

  const dir = join(homedir(), "Library", "LaunchAgents");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(launchAgentPath(name), plist);
  execSync(`launchctl load -w ${launchAgentPath(name)}`, { stdio: "ignore" });
  console.log(`  LaunchAgent installed: ${label}`);
}

function uninstallLaunchAgent(name: string): void {
  const path = launchAgentPath(name);
  if (!existsSync(path)) return;
  try {
    execSync(`launchctl unload ${path}`, { stdio: "ignore" });
  } catch {}
  try {
    execSync(`rm ${path}`, { stdio: "ignore" });
  } catch {}
}

function systemdServicePath(name: string): string {
  return join(homedir(), ".config", "systemd", "user", `vivarium-${name}.service`);
}

function installSystemdService(name: string): void {
  const vivPath = execSync("which viv", { encoding: "utf-8" }).trim();
  const unit = `[Unit]
Description=Vivarium ${name}

[Service]
ExecStart=${vivPath} start --name ${name} --no-service
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target`;

  const dir = join(homedir(), ".config", "systemd", "user");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(systemdServicePath(name), unit);
  execSync(`systemctl --user daemon-reload`, { stdio: "ignore" });
  execSync(`systemctl --user enable --now vivarium-${name}.service`, { stdio: "ignore" });
  console.log(`  systemd service installed: vivarium-${name}.service`);
}

function uninstallSystemdService(name: string): void {
  const path = systemdServicePath(name);
  if (!existsSync(path)) return;
  try {
    execSync(`systemctl --user disable --now vivarium-${name}.service`, { stdio: "ignore" });
  } catch {}
  try {
    execSync(`rm ${path}`, { stdio: "ignore" });
  } catch {}
}
