/**
 * Verifies Cursor API key + SDK install.
 * Usage: npm run verify:sdk
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Cursor, CursorAgentError } from "@cursor/sdk";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const apiKey = process.env.CURSOR_API_KEY?.trim();
if (!apiKey) {
  console.error("Missing CURSOR_API_KEY in .env");
  process.exit(1);
}

const masked =
  apiKey.length <= 12
    ? "***"
    : `${apiKey.slice(0, 8)}…${apiKey.slice(-4)}`;
console.log(`Using CURSOR_API_KEY (${masked})`);

async function checkRestAuth(): Promise<boolean> {
  const res = await fetch("https://api.cursor.com/v0/models", {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (res.ok) return true;
  const body = await res.text();
  console.error(`REST auth failed: HTTP ${res.status} ${body.slice(0, 200)}`);
  if (res.status === 401) {
    console.error(
      "Create or rotate a user API key at https://cursor.com/dashboard/integrations",
    );
  }
  return false;
}

try {
  const restOk = await checkRestAuth();
  if (!restOk) process.exit(1);

  const models = await Cursor.models.list({ apiKey });
  const ids = models.map((m) => m.id).slice(0, 8);
  console.log("SDK models.list OK:", ids.join(", ") || "(empty)");

  console.log("\nRunning one-shot local agent (requires Cursor local runtime)…");
  const { Agent } = await import("@cursor/sdk");
  const result = await Agent.prompt("Reply with exactly: SDK_OK", {
    apiKey,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
  });
  if (result.status === "error") {
    console.error("Agent run finished with status error:", result.id);
    process.exit(2);
  }
  console.log("Local agent status:", result.status);
  console.log("SDK verification passed.");
} catch (err) {
  if (err instanceof CursorAgentError) {
    console.error("CursorAgentError:", err.message);
    if (err.isRetryable !== undefined) {
      console.error("Retryable:", err.isRetryable);
    }
    process.exit(1);
  }
  if (err instanceof Error) {
    console.error("Error:", err.message);
  }
  process.exit(1);
}
