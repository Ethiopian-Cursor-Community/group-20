import "./load-env.js";
import { Agent, Cursor, CursorAgentError } from "@cursor/sdk";
import { localAgentOptions } from "./config.js";
import { requireApiKey } from "./load-env.js";

async function main() {
  console.log("Cursor Agent SDK — hackathon setup check\n");

  const apiKey = requireApiKey();
  console.log("✓ CURSOR_API_KEY is set");

  const isPlanLimited = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    return msg.includes("plan_required") || msg.includes("not available");
  };

  try {
    const user = await Cursor.me({ apiKey });
    console.log(`✓ API key valid (name: ${user.apiKeyName})`);
  } catch (err) {
    if (err instanceof CursorAgentError && isPlanLimited(err)) {
      console.log(
        "⚠ Cloud account APIs need Pro (or higher); continuing with local-agent check.",
      );
    } else if (err instanceof CursorAgentError) {
      console.error(`✗ Auth failed: ${err.message}`);
      process.exit(1);
    } else {
      throw err;
    }
  }

  try {
    const models = await Cursor.models.list({ apiKey });
    console.log(`✓ ${models.length} models available`);
    if (models.some((m) => m.id === "composer-2")) {
      console.log("  → composer-2 is available");
    }
  } catch (err) {
    if (isPlanLimited(err)) {
      console.log("⚠ Model list skipped (cloud plan); using composer-2 for local runs.");
    } else {
      console.warn(`⚠ Could not list models: ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("\nRunning a short local agent smoke test (may take ~30s)…");
  try {
    const result = await Agent.prompt(
      "Reply with exactly: SDK_OK (one line, nothing else)",
      localAgentOptions(),
    );
    if (result.status === "finished" && result.result?.includes("SDK_OK")) {
      console.log("✓ Local agent ran successfully");
    } else if (result.status === "finished") {
      console.log(`✓ Local agent finished: ${result.result?.slice(0, 120)}…`);
    } else {
      console.warn(`⚠ Local agent ended with status: ${result.status}`);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`⚠ Local smoke test skipped or failed: ${msg}`);
    console.log(
      "  Ensure Cursor is updated (Cursor 3) and the CLI/agent runtime is available on your machine.",
    );
  }

  console.log("\n---");
  console.log("Ready for Sunday. Next steps:");
  console.log("  npm run example:prompt   # one-shot prompt");
  console.log("  npm run example:stream   # streaming + follow-up");
  console.log("  Docs: https://cursor.com/docs/api/sdk/typescript");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
