# AI Front

A cross-platform ready AI assistant client implemented with a Next.js web application, shared domain stores, transport utilities, renderers, and a plugin SDK. The project follows the architecture blueprint previously outlined and turns it into an executable monorepo scaffold that you can extend into production.

## Monorepo layout

```
repo/
  apps/
    web/              # Next.js App Router experience (MVP implementation)
  packages/
    domain/           # Session & message state machines, shared types
    transport/        # Streaming hooks and networking helpers
    ui/               # Reusable UI composition primitives
    renderers/        # Block renderer registry and defaults
    plugin-sdk/       # Tool/plugin specification helpers
```

Each workspace is written in TypeScript and exposed via workspace:* dependencies so the web app (and any future native shells) can consume them without extra build tooling.

## Features implemented

- ✅ **Session & message stores** with Zustand + Immer, including delta merging helpers and utilities to create user messages.
- ✅ **Streaming transport hook** wrapping Server-Sent Events that merges incoming deltas into the shared store.
- ✅ **Composable UI kit** featuring a desktop-like chat layout, session list, streaming message view, and a message composer.
- ✅ **Renderer registry** that resolves blocks dynamically (text, code) and gracefully handles unsupported payloads.
- ✅ **Plugin SDK scaffold** with typed tool specs and an in-memory plugin host ready for extension.
- ✅ **Mock BFF** inside the Next.js app that accepts messages, queues prompts, and streams assistant responses to demonstrate the full flow end-to-end.

## Getting started

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:3000` to open the AI Front web client. Ask a question in the composer—mock streaming responses will appear, proving the state/transport/rendering loop.

> The project uses `pnpm` workspaces. You can switch to npm/yarn by updating the root `package.json` if desired.

## Architectural guardrails

The implementation keeps the layered architecture from the blueprint:

1. **Experience layer (UI/UX)** – `packages/ui`, `packages/renderers`, and `apps/web/app` supply reusable surfaces and renderers.
2. **Domain layer** – `packages/domain` encapsulates domain models, stores, and helpers for sessions/messages.
3. **Infrastructure layer** – `packages/transport` and the mock Next.js API routes demonstrate networking, streaming, and queue handling.

Data flows from UI ➜ domain ➜ transport (SSE) ➜ mock backend ➜ renderers, mirroring the production contract. Replacing the mock API with a real BFF keeps the rest of the stack unchanged.

## Next steps

- Flesh out more block renderers (tables, charts, multimedia) and plug them into the registry.
- Persist sessions/messages to IndexedDB for offline support.
- Wire the transport layer to a real BFF that proxies foundation models and tools.
- Expand the plugin SDK with capability negotiation, sandboxing, and authorization flows.
- Add automated testing (unit + Playwright E2E) and CI workflows as the product matures.

## License

MIT
