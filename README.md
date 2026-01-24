# Spoonjoy v2

Recipe management platform rebuilt with React Router v7 on Cloudflare.

## Tech Stack

- **Framework**: React Router v7 (Remix)
- **Platform**: Cloudflare Pages/Workers
- **Database**: PostgreSQL (via Prisma)
- **Language**: TypeScript
- **Styling**: TBD (Tailwind CSS planned)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (local or remote)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. Generate Prisma Client:
   ```bash
   npm run prisma:generate
   ```

5. Push the database schema:
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

### Deployment to Cloudflare

1. Install Wrangler CLI (if not already installed):
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Configure your database:
   - **Option A**: Set up Cloudflare D1 (SQLite)
   - **Option B**: Use Cloudflare Hyperdrive with external Postgres

4. Deploy:
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
