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

export interface FleetVivarium {
  id: number;
  name: string;
  version: string | null;
  online: boolean;
  connectedAt: string | null;
  createdAt: string;
}

export interface VivariumStatus {
  appRunning: boolean;
  uptime: number;
  totalCostUsd?: number;
  inputTokens?: number;
}

export async function getFleet(
  token: string,
  hubUrl?: string,
): Promise<FleetVivarium[]> {
  const res = await hubFetch("/api/fleet", token, hubUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch fleet: ${res.status}`);
  }
  return res.json() as Promise<FleetVivarium[]>;
}

export async function getFleetStatus(
  token: string,
  vivariumId: number,
  hubUrl?: string,
): Promise<VivariumStatus> {
  const res = await hubFetch(`/api/fleet/${vivariumId}/status`, token, hubUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch status: ${res.status}`);
  }
  return res.json() as Promise<VivariumStatus>;
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
