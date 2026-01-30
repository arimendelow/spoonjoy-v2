# 🍳 Spoonjoy v2 — Getting Started Guide

*From zero to cooking in 10 minutes*

---

## Welcome!

Spoonjoy is a recipe management app built with modern web tech: React Router v7 on Cloudflare's edge. You're about to clone it, run it locally, and explore a beautifully architected recipe platform.

**What you'll have when you're done:**
- A running app where you can create, edit, and organize recipes
- A component library to explore (Storybook)
- A comprehensive test suite

Let's go! 🚀

---

## Part 1: Clone & Install

### Prerequisites

You'll need:
- **Node.js 18+** (`node --version` to check)
- **npm** (comes with Node)
- A terminal
- ~5 minutes

### Clone the Repository

```bash
git clone https://github.com/arimendelow/spoonjoy-v2.git
cd spoonjoy-v2
```

### Install Dependencies

```bash
npm install
```

This installs everything: React Router, Prisma, Tailwind, testing tools, Storybook — the works.

---

## Part 2: Environment Setup

### Create Your Environment File

```bash
cp .env.example .env
```

Open `.env` in your editor. For local development, you only need to set one thing:

```bash
# Generate a random secret
openssl rand -base64 32
```

Paste the output as your `SESSION_SECRET`:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="your-generated-secret-here"
```

That's it for basic setup. OAuth credentials are optional (you can skip Google/Apple login for now).

### Initialize the Database

Spoonjoy uses Prisma with SQLite for local development:

```bash
# Generate the Prisma client
npm run prisma:generate

# Create the database and apply the schema
npm run prisma:push
```

You now have a `dev.db` file with all the tables ready.

### Seed Sample Data (Optional but Recommended)

Want to jump right into exploring? Seed the database with sample users, recipes, and cookbooks:

```bash
npm run db:seed
```

This creates:
- **Demo user**: `demo@spoonjoy.com` / password: `demo1234`
- Sample recipes with steps, ingredients, and step dependencies
- Example cookbooks

Great for exploring the app without manual data entry!

---

## Part 3: Run the App! 🎉

```bash
npm run dev
```

Open **http://localhost:5173** — welcome to Spoonjoy!

### What You'll See

1. **Landing page** — Clean, minimal homepage
2. **Navigation** — Links to Recipes, Cookbooks, Shopping List
3. **Auth buttons** — Log In / Sign Up in the header

### Log In or Sign Up

**Option A: Use the seeded demo account**
1. Click **Log In**
2. Email: `demo@spoonjoy.com`
3. Password: `demo1234`
4. You're in — with sample recipes ready to explore!

**Option B: Create your own account**
1. Click **Sign Up**
2. Enter an email, username, and password
3. You're in — with a fresh slate to build your recipes!

*Note: Passwords are securely hashed with bcrypt. OAuth login (Google/Apple) requires setting up API credentials in `.env`.*

---

## Part 4: Create Your First Recipe

Let's make something delicious — how about a classic grilled cheese?

### Step 1: Add the Recipe

1. Navigate to **Recipes** in the nav
2. Click **New Recipe**
3. Fill in:
   - **Title**: `Ultimate Grilled Cheese`
   - **Description**: `The only grilled cheese recipe you'll ever need`
   - **Servings**: `1`
4. Click **Create Recipe**

### Step 2: Add Steps

Recipes are built from steps, and each step can have its own ingredients. Click **Add Step**:

**Step 1: Prep the butter**
- Description: `Let 2 tablespoons of butter soften at room temperature`
- Add ingredient: `2 tbsp butter`

**Step 2: Assemble the sandwich**
- Description: `Layer cheese between two slices of bread`
- Add ingredients: 
  - `2 slices bread`
  - `2 slices cheddar cheese`

**Step 3: Grill it**
- Description: `Spread softened butter on the outside of each bread slice. Grill on medium heat until golden brown, about 2-3 minutes per side.`
- Here's the magic: click **Uses output from** and select **Step 1** (the softened butter!)

🎯 **This is Spoonjoy's killer feature**: steps can reference outputs from previous steps. It makes recipes flow naturally.

### Step 3: Admire Your Work

Navigate back to your recipe. You'll see:
- Your steps in order
- Ingredients listed per step
- Dependencies shown clearly ("uses softened butter from Step 1")

---

## Part 5: Explore the Features

Now that you have the basics, let's tour the rest:

### Cookbooks 📚

Organize recipes into collections:

1. Go to **Cookbooks** → **New Cookbook**
2. Name it `Quick Weeknight Meals`
3. Add your grilled cheese (and future recipes!)

### Shopping List 🛒

Every user gets a personal shopping list:

1. Go to **Shopping List**
2. Add items manually, or (in future features) generate from recipes
3. Check items off as you shop

### Account Settings ⚙️

Under your profile:
- Link OAuth providers (Google, Apple)
- Update your account info

---

## Part 6: Explore the Component Library

Spoonjoy includes a full Storybook with 34 documented components.

```bash
npm run storybook
```

Opens at **http://localhost:6006**

### Highlights to Check Out

| Story | What You'll See |
|-------|-----------------|
| **Introduction** | Project philosophy & setup |
| **Component Inventory** | Every component at a glance |
| **Design Tokens** | Color palette, spacing, typography |
| **Button** | 22 color variants, outline/plain modes |
| **Dialog** | Modal patterns with animations |
| **Combobox** | Searchable dropdown with autocomplete |
| **StepOutputUseDisplay** | The custom step dependency component |

The components are from [Catalyst](https://tailwindui.com/templates/catalyst), Tailwind Labs' headless library — production-quality, accessible, beautiful.

---

## Part 7: Run the Tests

The test suite has 21,000+ lines of tests covering auth, recipes, steps, ingredients, and all components.

```bash
# Run all tests
npm test

# Run with a pretty UI
npm run test:ui

# Run with coverage report
npm run test:coverage
```

### Test Areas

| Directory | What's Tested |
|-----------|---------------|
| `test/lib/` | Auth, OAuth, validation, step logic |
| `test/routes/` | Full route integration tests |
| `test/models/` | Data layer & database operations |
| `test/components/` | UI component behavior |

---

## Part 8: Explore the Database

Want to poke around the data?

```bash
npm run prisma:studio
```

Opens a visual database browser at **http://localhost:5555**.

### Key Tables

| Table | Purpose |
|-------|---------|
| `User` | Accounts (email, username, password hash) |
| `Recipe` | Recipe metadata (title, description, servings) |
| `RecipeStep` | Individual steps with descriptions |
| `Ingredient` | Ingredients tied to specific steps |
| `StepOutputUse` | Step dependencies (the secret sauce!) |
| `Cookbook` | Recipe collections |
| `ShoppingList` | Personal shopping lists |

---

## Part 9: Understand the Architecture

### Tech Stack at a Glance

| Layer | Tech |
|-------|------|
| Framework | React Router v7 (née Remix) |
| Styling | Tailwind CSS v4 |
| Database | SQLite (local) / Cloudflare D1 (production) |
| ORM | Prisma with D1 adapter |
| Auth | Custom + Google/Apple OAuth |
| Testing | Vitest + Testing Library |
| Components | Storybook 10 |
| Deploy | Cloudflare Pages/Workers |

### Directory Structure

```
spoonjoy-v2/
├── app/
│   ├── components/ui/    # Catalyst components (27 files)
│   ├── lib/              # Server utilities (auth, validation, etc.)
│   ├── routes/           # Page components with loaders/actions
│   └── root.tsx          # App shell with navigation
├── prisma/
│   └── schema.prisma     # Database schema
├── test/                 # Comprehensive test suite
├── stories/              # Storybook documentation
└── .env                  # Your local secrets
```

### The React Router Pattern

Every route follows this pattern:

```typescript
// 1. Loader: Fetch data server-side
export async function loader({ request }) {
  const userId = await requireUserId(request);  // Auth check
  const recipes = await db.recipe.findMany({ where: { chefId: userId } });
  return { recipes };
}

// 2. Action: Handle form submissions
export async function action({ request }) {
  const formData = await request.formData();
  // Process the form...
  return redirect("/recipes");
}

// 3. Component: Render with loaded data
export default function Recipes() {
  const { recipes } = useLoaderData<typeof loader>();
  return <RecipeList recipes={recipes} />;
}
```

---

## Part 10: What's Next?

### Ideas to Explore

1. **Add more recipes** — Try something complex with multiple step dependencies

2. **Explore the schema** — Open `prisma/schema.prisma` and trace the relationships

3. **Modify a component** — Change a button color in `app/components/ui/button.tsx`

4. **Add a test** — Find a route in `test/routes/` and add a new test case

5. **Build for production** — `npm run build` creates an optimized bundle

### Future Features (In Progress)

- Recipe import from URLs
- Recipe scaling (serves 4 → serves 8)
- Timer integration for steps
- Nutrition information
- Recipe sharing

---

## Quick Reference

| Command | What It Does |
|---------|--------------|
| `npm run dev` | Start the dev server |
| `npm run storybook` | Launch component explorer |
| `npm test` | Run test suite |
| `npm run test:ui` | Tests with visual UI |
| `npm run prisma:studio` | Database browser |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript validation |

---

## Troubleshooting

### "Cannot find module '@prisma/client'"

Run `npm run prisma:generate` — the client needs to be generated after install.

### "Database not found"

Run `npm run prisma:push` — this creates the SQLite database.

### OAuth login not working

You need to set up Google/Apple credentials in `.env`. For local dev, email/password login works without any OAuth setup.

### Port 5173 already in use

Either stop whatever's using it, or modify `vite.config.ts` to use a different port.

---

## Get Involved

- **GitHub**: https://github.com/arimendelow/spoonjoy-v2
- **Issues**: Feature requests, bugs, ideas welcome
- **Storybook (Live)**: https://697bd34029fa33717b859aff-inamkrsowd.chromatic.com/

---

*Happy cooking! 🍳🦝*
