import { createServer } from "node:http";
import { exec } from "node:child_process";
import { platform } from "node:os";
import { loadConfig, saveConfig } from "../config.js";
import { getMe } from "../hub-client.js";

const LOGIN_TIMEOUT_MS = 120_000;
const DEFAULT_HUB_URL = "https://app.vivarium.run";

function openBrowser(url: string): void {
  const cmd =
    platform() === "darwin"
      ? `open "${url}"`
      : `xdg-open "${url}" 2>/dev/null`;
  exec(cmd, () => {});
}

export async function login(opts: { hubUrl?: string }): Promise<void> {
  const hubUrl = (opts.hubUrl ?? DEFAULT_HUB_URL).replace(/\/$/, "");
  const config = loadConfig();

  const token = await new Promise<string>((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url!, `http://localhost`);

      if (url.pathname !== "/callback") {
        res.writeHead(404);
        res.end();
        return;
      }

      const authError = url.searchParams.get("auth_error");
      if (authError) {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<html><body><h2>Login failed</h2><p>You can close this tab.</p></body></html>",
        );
        server.close();
        reject(new Error(`Authentication failed: ${authError}`));
        return;
      }

      const t = url.searchParams.get("token");
      if (!t) {
        res.writeHead(400, { "Content-Type": "text/html" });
        res.end(
          "<html><body><h2>Missing token</h2><p>You can close this tab.</p></body></html>",
        );
        return;
      }

      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        "<html><body><h2>Login successful!</h2><p>You can close this tab and return to the terminal.</p></body></html>",
      );
      server.close();
      resolve(t);
    });

    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number };
      const callbackUrl = `http://localhost:${port}/callback`;
      const authUrl = `${hubUrl}/auth/google?origin=${encodeURIComponent(callbackUrl)}`;

      console.log("Opening browser to log in...");
      console.log(`If the browser doesn't open, visit:\n  ${authUrl}\n`);
      openBrowser(authUrl);
    });

    const timeout = setTimeout(() => {
      server.close();
      reject(new Error("Login timed out after 2 minutes. Try again."));
    }, LOGIN_TIMEOUT_MS);
    server.on("close", () => clearTimeout(timeout));
  });

  const user = await getMe(token, hubUrl);

  config.userToken = token;
  if (hubUrl !== DEFAULT_HUB_URL) {
    config.hubUrl = hubUrl;
  }
  saveConfig(config);

  console.log(`✓ Logged in as ${user.displayName ?? user.email}`);
}
