# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm start        # Start production server
pnpm preview      # Build + start

# Code quality
pnpm check        # Lint + typecheck (run before committing)
pnpm lint         # ESLint only
pnpm lint:fix     # ESLint with auto-fix
pnpm typecheck    # TypeScript only
pnpm format:write # Prettier auto-format
pnpm format:check # Prettier check
```

## Architecture

**T3 Stack** — Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 + shadcn/ui.

**Path alias:** `~/` maps to `src/` (e.g., `import { cn } from "~/lib/utils"`).

**Environment variables** are validated at startup via `@t3-oss/env-nextjs` in `src/env.js`. Server-side vars go in the `server` schema, client-side (`NEXT_PUBLIC_*`) in the `client` schema. Add new vars there before using them.

**shadcn/ui** components are added to `src/components/ui/`. The `cn()` utility in `src/lib/utils.ts` merges Tailwind classes (clsx + tailwind-merge). Use it for all className composition.

**Styling** uses Tailwind CSS v4 via PostCSS. Theme colors are defined as CSS custom properties using oklch in `src/styles/globals.css`. Prettier auto-sorts Tailwind classes on save via `prettier-plugin-tailwindcss`.

**No database is configured yet** — `.gitignore` has Prisma placeholders but no schema exists. T3 Stack supports Prisma or Drizzle.

**No API routes exist yet** — ready for tRPC or Next.js route handlers under `src/app/api/`.
