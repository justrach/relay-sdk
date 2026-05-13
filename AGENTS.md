# AGENTS.md — relay-sdk

Guidance for AI coding agents working inside this repo.

## What this repo is

The public TypeScript SDK for [relay](https://relay.codegraff.com). Published to npm as `@codegraff/relay`. The relay service itself lives in a separate (private) repo — see [Sibling repos](#sibling-repos).

## Layout

```
src/
├── index.ts              # public entrypoint — re-exports client.ts
├── client.ts             # hand-written wrapper around generated client
└── generated/            # gitignored; produced by `bun run codegen`
    ├── client/           # @hey-api/client-fetch glue
    ├── core/             # shared types
    ├── sdk.gen.ts        # one exported function per OpenAPI operation
    └── types.gen.ts      # request/response models
openapi/
└── relay.yaml            # vendored from the service repo
scripts/
└── sync-from-yapper.mjs  # pulls a fresh openapi spec from ../yapper
.github/workflows/
├── ci.yml                # typecheck + build on PR
└── release.yml           # npm publish on release (OIDC trusted publishing)
```

## Sibling repos

- **Service / dashboard / workers** → [justrach/yapper](https://github.com/justrach/yapper) — Convex + Cloudflare Workers + Next.js, private. Internals still say "yapper"; user-facing brand is "relay". This is where the OpenAPI spec is authored.
- **Public landing** → [relay.codegraff.com](https://relay.codegraff.com)

To pull the latest spec from the service repo, clone yapper as a sibling and run `bun run scripts/sync-from-yapper.mjs`.

## Editing rules

- **Never hand-edit `src/generated/*`** — it's regenerated. Edit `openapi/relay.yaml` (or upstream in yapper) and re-run codegen.
- **The public API surface is the named exports from `src/client.ts`.** Adding fields to the hand-written wrapper is fine; breaking changes to function signatures need a major version bump.
- **No runtime deps beyond `@hey-api/client-fetch`.** Keep the SDK small.

## Release flow

1. Edit, codegen, build, push to a branch, open a PR. CI typechecks + builds.
2. Merge to `main`.
3. `npm version patch|minor|major` on `main` (creates the tag).
4. `git push --follow-tags`.
5. Create a GitHub Release pointing at the tag — the `release.yml` workflow publishes to npm with provenance.

## What lives elsewhere

- The OpenAPI spec is authored in `yapper/frontend/openapi/yapper.yaml` and copied here. Treat `openapi/relay.yaml` as a snapshot — for source of truth, look in yapper.
