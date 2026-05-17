/**
 * Pattern 2: Agent.create() + agent.send() + run.stream()
 * Best for multi-turn work, live output, and follow-up prompts.
 */
import "../load-env.js";
import { Agent } from "@cursor/sdk";
import { localAgentOptions } from "../config.js";

const agent = await Agent.create(localAgentOptions());

try {
  const prompt =
    process.argv.slice(2).join(" ") ||
    "What is this repository? Answer in 3 bullet points.";

  const run = await agent.send(prompt);

  for await (const event of run.stream()) {
    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") process.stdout.write(block.text);
      }
    } else if (event.type === "tool_call") {
      process.stderr.write(`\n[tool] ${event.name}: ${event.status}\n`);
    }
  }

  const result = await run.wait();
  console.log(`\n\n--- done (${result.status}) ---`);

  // Follow-up keeps conversation context.
  const run2 = await agent.send("Suggest one hackathon project idea using this SDK.");
  for await (const event of run2.stream()) {
    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") process.stdout.write(block.text);
      }
    }
  }
  await run2.wait();
  console.log("\n");
} finally {
  await agent[Symbol.asyncDispose]();
}
