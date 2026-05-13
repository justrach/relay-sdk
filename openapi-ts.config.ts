import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "./openapi/relay.yaml",
	output: {
		path: "./src/generated",
		postProcess: [],
	},
	plugins: ["@hey-api/client-fetch", "@hey-api/sdk", "@hey-api/typescript"],
});
