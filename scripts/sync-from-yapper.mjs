#!/usr/bin/env node
/**
 * Copies the canonical OpenAPI spec from the (private) yapper service repo
 * into ./openapi/relay.yaml and regenerates the SDK. Expects the yapper
 * repo to be a sibling directory at ../yapper.
 *
 * Usage:
 *   bun run scripts/sync-from-yapper.mjs
 */
import { copyFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");
const yapperSpec = resolve(repoRoot, "../yapper/frontend/openapi/yapper.yaml");
const target = resolve(repoRoot, "openapi/relay.yaml");

if (!existsSync(yapperSpec)) {
	console.error(`✖ Could not find ${yapperSpec}`);
	console.error("  Clone justrach/yapper as a sibling of this repo, or run from a different path.");
	process.exit(1);
}

copyFileSync(yapperSpec, target);
console.log(`✓ Copied OpenAPI spec → ${target}`);

const codegen = spawnSync("bun", ["run", "codegen"], { stdio: "inherit", cwd: repoRoot });
process.exit(codegen.status ?? 1);
