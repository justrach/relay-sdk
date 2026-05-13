#!/usr/bin/env node
/**
 * `relay` — a tiny CLI around the @codegraff/relay SDK so end users don't
 * need to clone the service repo to test their token or wire up MCP.
 *
 * Usage:
 *   relay whoami [--token <t>]     # check the token resolves to an Identity
 *   relay mcp [--token <t>]        # print the `claude mcp add` snippet
 *
 * Falls back to RELAY_TOKEN env var if --token is omitted.
 */
import { createClient, identityWhoami } from "./client";

const BASE = process.env.RELAY_BASE_URL ?? "https://relay.codegraff.com/api/v1";
const MCP = process.env.RELAY_MCP_URL ?? "https://relay.codegraff.com/api/mcp";

function parseArgs(argv: string[]): {
	cmd: string | null;
	token: string | null;
	help: boolean;
} {
	const rest = argv.slice(2);
	let token = process.env.RELAY_TOKEN ?? null;
	let help = false;
	let cmd: string | null = null;
	for (let i = 0; i < rest.length; i++) {
		const a = rest[i];
		if (a === "--help" || a === "-h") help = true;
		else if (a === "--token" || a === "-t") token = rest[++i] ?? null;
		else if (!cmd && !a.startsWith("-")) cmd = a;
	}
	return { cmd, token, help };
}

function printHelp(): void {
	console.log(`relay — CLI for @codegraff/relay

Usage:
  relay whoami [--token <t>]   Resolve the token to an Identity and print it
  relay mcp    [--token <t>]   Print a 'claude mcp add' snippet for this token

Token lookup order:
  1. --token / -t flag
  2. RELAY_TOKEN environment variable

Environment:
  RELAY_BASE_URL   override the REST base (default ${BASE})
  RELAY_MCP_URL    override the MCP URL  (default ${MCP})
`);
}

async function cmdWhoami(token: string): Promise<number> {
	const client = createClient({ baseUrl: BASE, token });
	const res = await identityWhoami({ client });
	if (res.error) {
		console.error("✖ whoami failed:", JSON.stringify(res.error, null, 2));
		return 1;
	}
	console.log(JSON.stringify(res.data, null, 2));
	return 0;
}

function cmdMcp(token: string): number {
	// `claude mcp add` defaults to stdio; we need --transport http for the
	// HTTP MCP endpoint, otherwise the URL gets exec'd as a local binary
	// and dies with ENOENT.
	console.log(`claude mcp add --transport http relay \\
  ${MCP} \\
  --header "Authorization: Bearer ${token}"`);
	return 0;
}

async function main(): Promise<void> {
	const { cmd, token, help } = parseArgs(process.argv);

	if (help || !cmd) {
		printHelp();
		process.exit(cmd ? 0 : 1);
	}

	if (!token) {
		console.error("✖ No token. Pass --token, or set RELAY_TOKEN.");
		console.error("  Grab one from https://relay.codegraff.com/app/settings");
		process.exit(2);
	}

	switch (cmd) {
		case "whoami":
			process.exit(await cmdWhoami(token));
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: handled by exit
		case "mcp":
			process.exit(cmdMcp(token));
		default:
			console.error(`✖ Unknown command: ${cmd}`);
			printHelp();
			process.exit(1);
	}
}

main().catch((e) => {
	console.error("✖ Unhandled error:", e);
	process.exit(1);
});
