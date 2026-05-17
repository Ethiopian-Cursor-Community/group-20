import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { AgentOptions } from "@cursor/sdk";
import { requireApiKey } from "./load-env.js";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Default model for local agents (required for local runtime). */
export const DEFAULT_MODEL = { id: "composer-2" } as const;

/** Shared options for local agents against this repo. */
export function localAgentOptions(cwd = projectRoot): AgentOptions {
  return {
    apiKey: requireApiKey(),
    model: DEFAULT_MODEL,
    local: { cwd },
  };
}
