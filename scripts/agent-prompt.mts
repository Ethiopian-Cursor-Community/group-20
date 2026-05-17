/**
 * One-shot Cursor agent prompt (uses CURSOR_API_KEY from .env).
 * Usage: npx tsx scripts/agent-prompt.mts "Your prompt here"
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { Agent, CursorAgentError } from "@cursor/sdk";

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

const prompt = process.argv.slice(2).join(" ").trim();
if (!prompt) {
  console.error('Usage: npx tsx scripts/agent-prompt.mts "your prompt"');
  process.exit(1);
}

const apiKey = process.env.CURSOR_API_KEY?.trim();
if (!apiKey) {
  console.error("Missing CURSOR_API_KEY in .env");
  process.exit(1);
}

try {
  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: "composer-2" },
    local: { cwd: process.cwd() },
  });
  console.log("status:", result.status);
  if (result.result) console.log(result.result);
  process.exit(result.status === "finished" ? 0 : 2);
} catch (err) {
  if (err instanceof CursorAgentError) {
    console.error(`${err.name}: ${err.message}`);
    if (err.status === 401) {
      console.error(
        "Invalid API key — create one at https://cursor.com/dashboard/integrations",
      );
    }
    process.exit(1);
  }
  throw err;
}
