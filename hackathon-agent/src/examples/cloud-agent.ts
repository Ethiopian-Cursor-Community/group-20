/**
 * Pattern 3: Cloud agent — runs on Cursor VMs, can open PRs.
 * Requires cloud access on your Cursor plan and a GitHub repo URL.
 *
 * Usage:
 *   REPO_URL=https://github.com/org/repo npm run example:cloud -- "Add a README badge"
 */
import "../load-env.js";
import { Agent } from "@cursor/sdk";
import { DEFAULT_MODEL } from "../config.js";
import { requireApiKey } from "../load-env.js";

const repoUrl = process.env.REPO_URL;
if (!repoUrl) {
  console.error(
    "Set REPO_URL to your team's GitHub repo, e.g.\n  REPO_URL=https://github.com/ethiopian-cursor-community/your-team-repo npm run example:cloud",
  );
  process.exit(1);
}

const prompt =
  process.argv.slice(2).join(" ") || "Summarize this repository in 5 bullet points.";

const agent = await Agent.create({
  apiKey: requireApiKey(),
  model: DEFAULT_MODEL,
  cloud: {
    repos: [{ url: repoUrl, startingRef: "main" }],
    autoCreatePR: false,
  },
});

try {
  console.log(`Cloud agent ${agent.agentId} — repo: ${repoUrl}\n`);
  const run = await agent.send(prompt);

  for await (const event of run.stream()) {
    if (event.type === "assistant") {
      for (const block of event.message.content) {
        if (block.type === "text") process.stdout.write(block.text);
      }
    } else if (event.type === "status") {
      process.stderr.write(`\n[status] ${event.status}\n`);
    }
  }

  const result = await run.wait();
  console.log(`\n\n--- ${result.status} ---`);
  if (result.git?.branches?.length) {
    for (const b of result.git.branches) {
      console.log(`branch: ${b.branch ?? "(none)"}  pr: ${b.prUrl ?? "(none)"}`);
    }
  }
} finally {
  await agent[Symbol.asyncDispose]();
}
