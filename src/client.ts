import { createClient as createGenClient } from "./generated/client";
import type { ClientOptions } from "./generated/client";

/**
 * relay SDK client. Hand-written wrapper around the generated OpenAPI
 * client so we own the public surface — `./generated/` is regenerated
 * by `bun run codegen` against `./openapi/relay.yaml`.
 *
 * @example
 *   import { createClient, identityWhoami } from "@codegraff/relay";
 *
 *   const relay = createClient({
 *     baseUrl: "https://relay.codegraff.com/api/v1",
 *     token: process.env.RELAY_TOKEN,
 *   });
 *   const { data: me } = await identityWhoami({ client: relay });
 */
export function createClient(opts: {
	baseUrl: string;
	token?: string;
	headers?: Record<string, string>;
} & Omit<ClientOptions, "headers">) {
	const { baseUrl, token, headers: extraHeaders, ...rest } = opts;
	return createGenClient({
		baseUrl,
		headers: {
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(extraHeaders ?? {}),
		},
		...rest,
	});
}

export type RelayClient = ReturnType<typeof createClient>;

export * from "./generated/sdk.gen";
export type * from "./generated/types.gen";
