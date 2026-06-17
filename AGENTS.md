# AGENTS.md — wasitin-backend

## Stack
- **Runtime**: Node.js v18
- **Language**: TypeScript 5.3 (strict mode)
- **Framework**: Express.js 4
- **Database**: PostgreSQL via Supabase, accessed through Prisma v7 with `@prisma/adapter-pg`
- **Auth**: Firebase Admin (Google/Facebook OAuth) + custom JWT
- **Storage**: Biznet (S3-compatible) via `aws-sdk`
- **Email**: Brevo (Sendinblue) via `nodemailer`
- **Deploy**: Vercel (`@vercel/node`)

## Commands

```bash
npm run dev          # start dev server (nodemon + ts-node, watches src/)
npm run build        # compile TS → build/ (used by Vercel)
npm run format       # prettier --write .
npm run check-types  # tsc --pretty --noEmit
npm run check-format # prettier --check .
npm run check-lint   # eslint . --ext ts --ext tsx --ext js
npm run fix-lint     # eslint with --fix
```

After `npm install`, `prisma generate` runs automatically (via `postinstall`).

There are **no tests** in this repo.

## Architecture

```
src/
  index.ts          # app entrypoint, CORS, middleware, Swagger
  config/           # prisma, jwt, hashing, email, logger, firebase, biznet
  controllers/      # Express route handlers (1 per feature)
  services/         # business logic (1 per feature)
  routes/           # Express Router definitions + routes/index.ts wiring
  middleware/       # auth, deserializedToken, error-handler, multer, rate-limiter
  validations/      # Joi schemas
  types/            # TS type definitions (also in typeRoots)
  utils/            # response helpers, misc utilities
  i18n/             # message catalog (id.ts, en.ts) + translation engine (index.ts)
```

### i18n / Translation

- All error and success messages are stored as **message keys** in `src/i18n/id.ts` (Indonesian, default) and `src/i18n/en.ts`.
- Locale is resolved per-request by `localeMiddleware` (`src/middleware/locale.ts`) from `Accept-Language` header or `?lang=` query param, then stored in AsyncLocalStorage so `t(key, params?)` works everywhere.
- `src/i18n/index.ts` exports:
  - `t(key, params?)` — translate a message key with optional `{param}` interpolation (uses per-request locale)
  - `supportedLocales` — `['id', 'en']`
- `src/utils/response.helper.ts` exports:
  - `msg(key, params?)` — alias for `t()` from response context
  - `sendSuccessMsg(res, data, key, params?)` — send success with an i18n key
  - `sendErrorMsg(res, key, params?, statusCode?)` — send error with an i18n key
  - `sendBadRequestMsg(res, key, params?)` — send 400 with an i18n key
  - The original `sendSuccess`/`sendError`/`sendBadRequest` still work with raw strings (backward compat).
  - `sendNotFound(res, entity)` now uses i18n key `NOT_FOUND.ENTITY` with `{entity}` interpolation.
- **When adding new messages**: add the key and both translations to `src/i18n/id.ts` and `src/i18n/en.ts`, then use `msg('KEY', { param })` or `sendSuccessMsg(res, data, 'KEY')` in controllers/services.

### Route wiring

All routes are registered in `src/routes/index.ts` under `/api/v1/*`. All have the prefix `/api/v1/<feature>`:

| Prefix | Feature |
|---|---|
| `/api/v1/auth` | Authentication |
| `/api/v1/users` | Users |
| `/api/v1/region` | Region |
| `/api/v1/master` | Master data |
| `/api/v1/referee` | Referee |
| `/api/v1/admin/referees` | Admin referee |

Swagger docs at `/api-docs`.

## Conventions

- **No semicolons**, single quotes, trailing commas disabled, 120 char print width (Prettier config).
- **Base URL for imports**: `tsconfig.json` sets `baseUrl: "./src"`, so internal imports look like `import { foo } from './config/foo'` from within `src/`.
- **Prisma v7 adapter-pg**: Uses `@prisma/adapter-pg` for direct PostgreSQL access (not Prisma's built-in connection pool). `$connect()` is NOT used — connection health check is `prisma.$queryRaw\`SELECT 1\``.
- **Default port**: 3100 (set in `.env`).
- **`.env` loading**: `import 'dotenv/config'` at the top of `src/index.ts` — don't call `dotenv.config()` again.
- **API creation flow** (from README): Model → Service → Validation + Types → Controller → Routes → Swagger docs in `apidocs.json`.

## Environment

- `.env` is committed to the repo (contains real credentials) **despite** `.gitignore` listing it. Do NOT add new secrets without ensuring they're gitignored first. Same for `firebase.json`.
- Required env vars: `DATABASE_URL`, `DIRECT_URL`, `SECRET_KEY`, `REFRESH_TOKEN_SECRET`, Firebase service account JSON, Biznet keys, Brevo SMTP config.
- Template at `env.development` (no values, structure only).

## Gotchas

- **Husky hooks in `package.json`** are Angular stubs (`ng lint`, `ng build`) and are **not relevant** to this project. The `.husky/` directory does not exist.
- **Linting disabled for several rules**: `@typescript-eslint/no-unused-vars`, `no-useless-catch`, `@typescript-eslint/strict-boolean-expressions`, and others are explicitly off.
- **Vercel** build uses `src/index.ts` directly as the serverless function entrypoint (configured in `vercel.json`). The `build` dir is for compilation only.
- The `start` script (`npx tsc -w`) runs TypeScript watch mode — this is NOT the dev server command. Use `npm run dev` for development.
- CORS is configured to reflect the origin (`origin: true`) — not restricted to a specific domain.
