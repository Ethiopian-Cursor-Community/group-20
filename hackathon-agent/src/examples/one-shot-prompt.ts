/**
 * Pattern 1: Agent.prompt() — one prompt, wait for result, auto-dispose.
 * Best for scripts, CI steps, and quick hacks.
 */
import "../load-env.js";
import { Agent } from "@cursor/sdk";
import { localAgentOptions } from "../config.js";

const prompt =
  process.argv.slice(2).join(" ") ||
  "List the top 3 files in this project and one sentence about each.";

const result = await Agent.prompt(prompt, localAgentOptions());

console.log("\n--- status ---");
console.log(result.status);
if (result.result) {
  console.log("\n--- result ---\n");
  console.log(result.result);
}
