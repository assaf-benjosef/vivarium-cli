const DEFAULT_HUB_URL = "https://app.vivarium.run";

export interface HubUser {
  id: number;
  email: string;
  displayName: string;
}

export interface RegisterResult {
  token: string;
  name: string;
  hubUrl: string;
}

function apiBase(hubUrl?: string): string {
  return (hubUrl ?? DEFAULT_HUB_URL).replace(/\/$/, "");
}

async function hubFetch(
  path: string,
  token: string,
  hubUrl?: string,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${apiBase(hubUrl)}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (res.status === 401) {
    throw new Error("Session expired. Run `viv login` again.");
  }
  return res;
}

export async function getMe(
  token: string,
  hubUrl?: string,
): Promise<HubUser> {
  const res = await hubFetch("/auth/me", token, hubUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch user info: ${res.status}`);
  }
  return res.json() as Promise<HubUser>;
}

export async function registerVivarium(
  token: string,
  name: string,
  hubUrl?: string,
): Promise<RegisterResult> {
  const res = await hubFetch("/api/fleet", token, hubUrl, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to register vivarium: ${res.status} ${body}`);
  }
  return res.json() as Promise<RegisterResult>;
}
