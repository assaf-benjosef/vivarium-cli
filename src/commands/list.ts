import { listVivariums, vivariumName } from "../sandbox.js";

export async function list(): Promise<void> {
  const sandboxes = await listVivariums();

  if (sandboxes.length === 0) {
    console.log("No vivariums found. Run `viv start` to create one.");
    return;
  }

  console.log("");
  const nameWidth = Math.max(6, ...sandboxes.map((s) => vivariumName(s.name).length));

  console.log(
    `  ${"NAME".padEnd(nameWidth)}  ${"STATUS".padEnd(10)}  CREATED`
  );
  console.log(`  ${"─".repeat(nameWidth)}  ${"─".repeat(10)}  ${"─".repeat(20)}`);

  for (const s of sandboxes) {
    const created = s.createdAt ? s.createdAt.toLocaleString() : "—";
    console.log(
      `  ${vivariumName(s.name).padEnd(nameWidth)}  ${s.status.padEnd(10)}  ${created}`
    );
  }
  console.log("");
}
