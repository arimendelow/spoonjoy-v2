# Spoonjoy v2

Recipe management platform rebuilt with React Router v7 on Cloudflare.

## Links

- **Storybook**: https://spoonjoy-storybook.pages.dev/
- **Getting Started Guide**: [GUIDE.md](./GUIDE.md) — comprehensive walkthrough from clone to delighted

## Tech Stack

- **Framework**: React Router v7 (Remix)
- **Platform**: Cloudflare Pages/Workers
- **Database**: Cloudflare D1 (local & production) via Prisma
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Quick Start

```bash
# Clone and install
git clone https://github.com/arimendelow/spoonjoy-v2.git
cd spoonjoy-v2
npm install

# Generate Prisma client
npm run prisma:generate

# Set up local D1 database
npx wrangler d1 execute spoonjoy-local --local --file=./migrations/init.sql

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — no additional setup required!

> **Note:** For a detailed walkthrough including creating recipes, exploring Storybook, and running tests, see [GUIDE.md](./GUIDE.md).

## Configuration

All configuration lives in `wrangler.json`:

| Setting | Purpose |
|---------|---------|
| `d1_databases` | D1 database bindings |
| `vars` | Environment variables (NODE_ENV, OAuth credentials, etc.) |

**Local development uses sensible defaults** — no configuration required to get started.

For OAuth (Google/Apple login), add credentials to `wrangler.json`:

```json
{
  "vars": {
    "GOOGLE_CLIENT_ID": "your-client-id",
    "GOOGLE_CLIENT_SECRET": "your-secret",
    "GOOGLE_CALLBACK_URL": "http://localhost:5173/auth/google/callback"
  }
}
```

For production, use `wrangler secret put` for sensitive values.

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run storybook` | Component explorer |
| `npm test` | Run test suite |
| `npm run test:ui` | Tests with visual UI |
| `npm run test:coverage` | Coverage report |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run test:storybook` | Run Storybook interaction tests |
| `npm run prisma:generate` | Regenerate Prisma client |
| `npm run db:migrate:local:option2:idempotent` | Safely apply/skip local option2 migration (rerunnable) |
| `npm run dev:sync` | Generate Prisma client, run idempotent local option2 migration, then start dev |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript validation |

## E2E Testing

End-to-end tests use [Playwright](https://playwright.dev/) and live in the `e2e/` folder.

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run all e2e tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e e2e/flows/recipes.spec.ts

# Run with UI mode (interactive)
pnpm test:e2e --ui

# Run headed (see browser)
pnpm test:e2e --headed
```

**Test structure:**
- `e2e/auth.setup.ts` — Authentication fixture (logs in as demo user)
- `e2e/flows/auth.spec.ts` — Login, logout, protected routes
- `e2e/flows/recipes.spec.ts` — Recipe list, detail, navigation
- `e2e/flows/cookbooks.spec.ts` — Cookbook CRUD
- `e2e/flows/shopping-list.spec.ts` — Shopping list operations

**Note:** Tests run against `http://localhost:5173`. Start the dev server first with `pnpm dev`.

## Database Management

Local development uses D1 via the Cloudflare Vite plugin (stored in `.wrangler/`).

```bash
# Apply schema to local D1
npx wrangler d1 execute spoonjoy-local --local --file=./migrations/init.sql

# Regenerate migration from Prisma schema (if schema changes)
npx prisma migrate diff --from-empty --to-schema-datamodel=./prisma/schema.prisma --script > migrations/init.sql
```

## Deployment to Cloudflare

1. Login to Cloudflare:
   ```bash
   wrangler login
   ```

2. Create a D1 database (first time only):
   ```bash
   wrangler d1 create spoonjoy
   # Update wrangler.json with the returned database_id
   ```

3. Apply migrations to production D1:
   ```bash
   wrangler d1 execute spoonjoy --remote --file=./migrations/init.sql
   ```

4. Set secrets:
   ```bash
   wrangler secret put SESSION_SECRET
   wrangler secret put GOOGLE_CLIENT_SECRET
   ```

5. Deploy:
   ```bash
   npm run deploy
   ```

## Project Structure

```
app/
├── routes/          # Route modules (loaders, actions, components)
├── components/      # Shared React components
├── lib/             # Utility functions and database client
├── entry.client.tsx # Client entry point
├── entry.server.tsx # Server entry point
├── root.tsx         # Root layout
└── routes.ts        # Route configuration

prisma/
└── schema.prisma    # Database schema

migrations/
└── init.sql         # D1 migration (generated from Prisma)
```

## Features

- **Authentication**: Email/password + Google/Apple OAuth
- **Recipes**: Full CRUD with steps, ingredients, and step dependencies
- **Step Dependencies**: Steps can reference outputs from previous steps
- **Cookbooks**: Organize recipes into collections
- **Shopping List**: Personal shopping list with check-off

## Database Schema

Key models:

- `User` - Accounts with authentication
- `Recipe` - Recipe metadata and ownership
- `RecipeStep` - Step-by-step instructions with optional titles
- `StepOutputUse` - Dependencies between steps (the killer feature!)
- `Ingredient` - Ingredients linked to specific steps
- `Cookbook` - Recipe collections
- `ShoppingList` - Personal shopping lists

## Feedback

Ongoing feedback is tracked in `feedback/YYYY-MM-DD.md` files. Check there for known issues and planned improvements.

## License

ISC
