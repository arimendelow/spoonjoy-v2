# Spoonjoy v2

Recipe management platform rebuilt with React Router v7 on Cloudflare.

## Tech Stack

- **Framework**: React Router v7 (Remix)
- **Platform**: Cloudflare Pages/Workers
- **Database**: SQLite (local) / Cloudflare D1 (production) via Prisma
- **Language**: TypeScript
- **Styling**: Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

5. Push the database schema (creates local SQLite DB):
   ```bash
   npm run prisma:push
   ```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

### Database Management

- **Generate Prisma Client**: `npm run prisma:generate`
- **Push schema changes**: `npm run prisma:push`
- **Open Prisma Studio**: `npm run prisma:studio`
- **Seed database**: `npm run db:seed`

### Configuration Files

| File | Purpose |
|------|---------|
| `wrangler.json` | Cloudflare Workers config (D1 bindings, vars) |
| `.env` | Local dev secrets (SESSION_SECRET, OAuth keys) |

**What goes where:**
- **wrangler.json**: D1 database bindings, NODE_ENV, non-secret vars
- **.env**: Secrets (SESSION_SECRET, OAuth credentials, API keys)

Local dev uses SQLite (`file:./dev.db`). Production uses Cloudflare D1 via the `@prisma/adapter-d1` package.

### Deployment to Cloudflare

1. Login to Cloudflare:
   ```bash
   wrangler login
   ```

2. Create a D1 database (first time only):
   ```bash
   wrangler d1 create spoonjoy
   # Update wrangler.json with the returned database_id
   ```

3. Apply migrations to D1:
   ```bash
   wrangler d1 execute spoonjoy --file=./migrations/0001_create_users.sql
   ```

4. Set secrets:
   ```bash
   wrangler secret put SESSION_SECRET
   wrangler secret put GOOGLE_CLIENT_SECRET
   # etc.
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
└── schema.prisma    # Database schema (preserved from original Spoonjoy)
```

## Implementation Plan

This project follows a phased implementation approach:

1. **Foundation** (Current Phase)
   - ✅ Project setup
   - ✅ React Router v7 with Cloudflare
   - ✅ Prisma schema integration
   - ⏳ Authentication system

2. **Core Features**
   - Recipe CRUD operations
   - Image upload
   - Recipe steps and ingredients

3. **Advanced Features**
   - Cookbooks
   - Shopping list
   - Recipe sharing

4. **Mobile Apps**
   - Expo setup for iOS/Android
   - Mobile-optimized UI

5. **MCP Integration**
   - Recipe management tools
   - Claude integration

## Database Schema

The Prisma schema is preserved exactly from the original Spoonjoy project to enable seamless production data migration. Key models include:

- `User` - User accounts with authentication
- `Recipe` - Recipe metadata and ownership
- `RecipeStep` - Step-by-step instructions
- `Ingredient` - Ingredients linked to recipe steps
- `Cookbook` - Recipe collections
- `ShoppingList` - Shopping list functionality

## License

ISC
