# Spoonjoy v2 Exploration Guide 🍳

*A comprehensive guide for exploring the codebase offline — Jan 29, 2026*

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Database Schema Deep Dive](#database-schema-deep-dive)
4. [Route Structure](#route-structure)
5. [Component Library (Catalyst UI)](#component-library-catalyst-ui)
6. [Key Features](#key-features)
7. [Testing Setup](#testing-setup)
8. [Storybook](#storybook)
9. [Interesting Patterns & Decisions](#interesting-patterns--decisions)
10. [Flight Exploration Tips](#flight-exploration-tips)

---

## Quick Start

```bash
cd ~/Projects/spoonjoy-v2

# Install deps (if needed)
npm install

# Generate Prisma client
npm run prisma:generate

# Run the app
npm run dev

# Run Storybook (component explorer)
npm run storybook

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

---

## Architecture Overview

### Tech Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| **Framework** | React Router v7 | File-based routing with loaders/actions |
| **Styling** | Tailwind CSS v4 | With Catalyst UI component library |
| **Database** | SQLite (Prisma) | Local dev; Cloudflare D1 in prod |
| **ORM** | Prisma | With D1 adapter for edge deployment |
| **Auth** | Custom + OAuth | Google & Apple OAuth via Arctic |
| **Testing** | Vitest + Testing Library | 21,000+ lines of tests |
| **Components** | Storybook 10 | 34 story files with docs |
| **Deployment** | Cloudflare Pages/Workers | Edge-first architecture |

### Directory Structure

```
spoonjoy-v2/
├── app/
│   ├── components/
│   │   ├── ui/                 # Catalyst UI components (27 files)
│   │   └── StepOutputUseDisplay.tsx  # Custom component
│   ├── lib/                    # Server-side utilities
│   │   ├── auth.server.ts      # Password auth
│   │   ├── session.server.ts   # Cookie sessions
│   │   ├── google-oauth*.ts    # Google OAuth flow
│   │   ├── apple-oauth*.ts     # Apple OAuth flow
│   │   ├── validation.ts       # Shared validation (client+server)
│   │   ├── step-output-use-*.ts # Step dependency logic
│   │   └── db.server.ts        # Prisma client
│   ├── routes/                 # Page components with loaders/actions
│   ├── routes.ts               # Route configuration
│   └── root.tsx                # App shell with nav
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── test/
│   ├── lib/                    # Unit tests for lib/
│   ├── routes/                 # Route integration tests
│   ├── models/                 # Model/data layer tests
│   ├── components/             # Component tests
│   ├── setup.ts                # Test configuration
│   └── utils.ts                # Test utilities
├── stories/                    # Storybook stories (34 files)
└── .storybook/                 # Storybook config
```

### Path Aliases

```typescript
"~/*" → "./app/*"           // e.g., ~/lib/auth.server
"@/*" → "./app/components/*" // e.g., @/ui/button
```

---

## Database Schema Deep Dive

The schema lives in `prisma/schema.prisma`. Here's the full entity relationship:

### Core Entities

#### User
```prisma
model User {
  id                  String    @id @default(cuid())
  email               String    @unique
  username            String    @unique
  hashedPassword      String?   # Optional for OAuth-only users
  salt                String?
  photoUrl            String?
  # Relations
  recipes             Recipe[]
  cookbooks           Cookbook[]
  shoppingList        ShoppingList?
  OAuth               OAuth[]          # Linked OAuth providers
  credentials         UserCredential[] # WebAuthn (future)
}
```

**Key insight**: Password fields are optional because users can sign up via OAuth only.

#### Recipe
```prisma
model Recipe {
  id          String    @id @default(cuid())
  title       String
  description String?
  imageUrl    String    @default("...")
  servings    String?
  chefId      String
  deletedAt   DateTime?  # Soft delete support
  # Forking support
  sourceRecipeId String?
  sourceUrl      String?
  # Relations
  steps       RecipeStep[]
  cookbooks   RecipeInCookbook[]
  
  @@unique([chefId, title, deletedAt])  # Allow same title if deleted
}
```

**Key insight**: Recipes use soft delete (`deletedAt`). The unique constraint allows recreating deleted recipes with the same name.

#### RecipeStep
```prisma
model RecipeStep {
  id          String @id @default(cuid())
  recipeId    String
  stepNum     Int
  stepTitle   String?
  description String
  # Relations
  ingredients Ingredient[]
  usingSteps  StepOutputUse[] @relation("input")   # Steps this uses
  usedBySteps StepOutputUse[] @relation("output")  # Steps that use this
  
  @@unique([recipeId, stepNum])  # Step numbers are unique per recipe
}
```

#### StepOutputUse (⭐ Star Feature)
```prisma
model StepOutputUse {
  id            String @id @default(cuid())
  recipeId      String
  outputStepNum Int    # The step producing output
  inputStepNum  Int    # The step using the output
  
  @@unique([recipeId, outputStepNum, inputStepNum])
}
```

This is the key innovation: steps can declare dependencies on outputs from previous steps. Example: "In step 4, use the caramelized onions from step 2."

**Constraints enforced**:
- Can only reference *previous* steps (outputStepNum < inputStepNum)
- No self-references
- No circular dependencies (enforced by ordering)

#### Ingredient
```prisma
model Ingredient {
  id              String @id @default(cuid())
  recipeId        String
  stepNum         Int
  quantity        Float
  unitId          String
  ingredientRefId String
  # Relations
  unit            Unit
  ingredientRef   IngredientRef
}
```

**Key insight**: Ingredients belong to steps, not recipes. This enables per-step ingredient lists and accurate shopping list generation.

#### Supporting Entities

```prisma
model IngredientRef {
  id   String @id @default(cuid())
  name String @unique  # "onion", "garlic", etc.
}

model Unit {
  id   String @id @default(cuid())
  name String @unique  # "cup", "tbsp", "pieces"
}

model Cookbook {
  id       String @id @default(cuid())
  title    String
  authorId String
  recipes  RecipeInCookbook[]
  
  @@unique([authorId, title])  # One cookbook per title per user
}

model ShoppingList {
  id       String @id @default(cuid())
  authorId String @unique  # One shopping list per user
  items    ShoppingListItem[]
}
```

### Entity Relationship Diagram

```
User
 ├── Recipe (1:many)
 │    ├── RecipeStep (1:many)
 │    │    ├── Ingredient (1:many) → Unit, IngredientRef
 │    │    └── StepOutputUse (many:many via input/output)
 │    └── RecipeInCookbook (many:many with Cookbook)
 ├── Cookbook (1:many)
 ├── ShoppingList (1:1)
 │    └── ShoppingListItem (1:many) → Unit, IngredientRef
 └── OAuth (1:many) - Google, Apple providers
```

---

## Route Structure

Routes are defined in `app/routes.ts` and implemented in `app/routes/*.tsx`.

### Route Configuration

```typescript
// app/routes.ts
export default [
  index("routes/_index.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("recipes", "routes/recipes.tsx", [
    index("routes/recipes._index.tsx"),
    route("new", "routes/recipes.new.tsx"),
    route(":id", "routes/recipes.$id.tsx"),
    route(":id/edit", "routes/recipes.$id.edit.tsx"),
    route(":id/steps/new", "routes/recipes.$id.steps.new.tsx"),
    route(":id/steps/:stepId/edit", "routes/recipes.$id.steps.$stepId.edit.tsx"),
  ]),
  route("cookbooks", "routes/cookbooks.tsx", [
    index("routes/cookbooks._index.tsx"),
    route("new", "routes/cookbooks.new.tsx"),
    route(":id", "routes/cookbooks.$id.tsx"),
  ]),
  route("shopping-list", "routes/shopping-list.tsx"),
] satisfies RouteConfig;
```

### Route Details

| Route | File | Purpose |
|-------|------|---------|
| `/` | `_index.tsx` | Home page, landing |
| `/login` | `login.tsx` | Email/password + OAuth login |
| `/signup` | `signup.tsx` | Account creation + OAuth |
| `/logout` | `logout.tsx` | Session destruction |
| `/recipes` | `recipes.tsx` | Layout wrapper for recipe routes |
| `/recipes` (index) | `recipes._index.tsx` | List all user's recipes |
| `/recipes/new` | `recipes.new.tsx` | Create new recipe |
| `/recipes/:id` | `recipes.$id.tsx` | View single recipe with steps |
| `/recipes/:id/edit` | `recipes.$id.edit.tsx` | Edit recipe metadata |
| `/recipes/:id/steps/new` | `recipes.$id.steps.new.tsx` | Add step to recipe |
| `/recipes/:id/steps/:stepId/edit` | `recipes.$id.steps.$stepId.edit.tsx` | Edit step, ingredients, dependencies |
| `/cookbooks` | `cookbooks.tsx` | Layout wrapper |
| `/cookbooks` (index) | `cookbooks._index.tsx` | List user's cookbooks |
| `/cookbooks/new` | `cookbooks.new.tsx` | Create cookbook |
| `/cookbooks/:id` | `cookbooks.$id.tsx` | View/manage cookbook |
| `/shopping-list` | `shopping-list.tsx` | Shopping list management |
| `/account/settings` | `account.settings.tsx` | User settings, OAuth linking |

### Loader/Action Pattern

Each route follows React Router v7's data loading pattern:

```typescript
// Loader: Fetch data server-side before render
export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireUserId(request);  // Auth check
  const recipe = await db.recipe.findUnique({ where: { id: params.id } });
  return { recipe };
}

// Action: Handle form submissions
export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "delete") {
    await db.recipe.update({ where: { id }, data: { deletedAt: new Date() } });
    return redirect("/recipes");
  }
  // ...
}

// Component: Render with loaded data
export default function RecipeDetail() {
  const { recipe } = useLoaderData<typeof loader>();
  return <div>...</div>;
}
```

---

## Component Library (Catalyst UI)

All UI components in `app/components/ui/` are from [Catalyst](https://tailwindui.com/templates/catalyst), Tailwind Labs' headless component library.

### Available Components

#### Form Inputs
| Component | File | Description |
|-----------|------|-------------|
| `Button` | `button.tsx` | Buttons with 20+ color variants |
| `Input` | `input.tsx` | Text input fields |
| `Textarea` | `textarea.tsx` | Multi-line text input |
| `Select` | `select.tsx` | Native select dropdown |
| `Listbox` | `listbox.tsx` | Custom styled select (HeadlessUI) |
| `Combobox` | `combobox.tsx` | Searchable select with autocomplete |
| `Checkbox` | `checkbox.tsx` | Checkboxes with labels |
| `Radio` | `radio.tsx` | Radio button groups |
| `Switch` | `switch.tsx` | Toggle switches |
| `Fieldset` | `fieldset.tsx` | Form field grouping |

#### Display
| Component | File | Description |
|-----------|------|-------------|
| `Heading` | `heading.tsx` | h1-h6 with consistent styling |
| `Text` | `text.tsx` | Paragraph text with `Strong`, `Code`, `TextLink` |
| `Badge` | `badge.tsx` | Status badges with colors |
| `Avatar` | `avatar.tsx` | User avatars with fallbacks |
| `Alert` | `alert.tsx` | Alert messages with icons |
| `Divider` | `divider.tsx` | Horizontal/vertical dividers |
| `DescriptionList` | `description-list.tsx` | Key-value display |

#### Interactive
| Component | File | Description |
|-----------|------|-------------|
| `Dialog` | `dialog.tsx` | Modal dialogs |
| `Dropdown` | `dropdown.tsx` | Dropdown menus |
| `Link` | `link.tsx` | Styled links (wraps React Router) |
| `Pagination` | `pagination.tsx` | Page navigation |
| `Table` | `table.tsx` | Data tables with sorting |

#### Layout
| Component | File | Description |
|-----------|------|-------------|
| `Navbar` | `navbar.tsx` | Top navigation bar |
| `Sidebar` | `sidebar.tsx` | Side navigation |
| `SidebarLayout` | `sidebar-layout.tsx` | Sidebar + content layout |
| `StackedLayout` | `stacked-layout.tsx` | Header + stacked content |
| `AuthLayout` | `auth-layout.tsx` | Login/signup page layout |

#### Custom
| Component | File | Description |
|-----------|------|-------------|
| `ValidationError` | `validation-error.tsx` | Form error display |
| `OAuth` | `oauth.tsx` | OAuth provider buttons |
| `StepOutputUseDisplay` | `../StepOutputUseDisplay.tsx` | Step dependency display |

### Button Color Palette

The Button component supports extensive color customization:

```typescript
// Solid colors (22 options)
<Button color="blue">Primary</Button>
<Button color="red">Danger</Button>
<Button color="green">Success</Button>
<Button color="zinc">Neutral</Button>
// ... indigo, cyan, orange, amber, yellow, lime, emerald, teal, sky, violet, purple, fuchsia, pink, rose

// Variants
<Button outline>Outline</Button>
<Button plain>Plain/Ghost</Button>

// As link
<Button href="/recipes/new">Create Recipe</Button>
```

### Component Pattern

All Catalyst components follow this pattern:

```typescript
import * as Headless from '@headlessui/react'
import clsx from 'clsx'

// Style definitions using Tailwind
const styles = {
  base: ['rounded-lg', 'border', '...'],
  variants: { ... }
}

// Component with forwardRef for composition
export const Button = forwardRef(function Button(
  { color, outline, plain, className, ...props },
  ref
) {
  const classes = clsx(className, styles.base, ...)
  
  return props.href ? (
    <Link {...props} className={classes} ref={ref} />
  ) : (
    <Headless.Button {...props} className={classes} ref={ref} />
  )
})
```

---

## Key Features

### 1. Authentication

**Location**: `app/lib/auth.server.ts`, `app/lib/session.server.ts`, `app/lib/*-oauth*.ts`

#### Password Authentication
```typescript
// Hash password with bcrypt
const { hashedPassword, salt } = await hashPassword(password);

// Create user
const user = await db.user.create({
  data: { email, username, hashedPassword, salt }
});

// Verify on login
const isValid = await verifyPassword(password, user.hashedPassword);
```

#### OAuth Flow (Google/Apple)
```typescript
// 1. Generate authorization URL
const { url, state, codeVerifier } = await getGoogleAuthUrl(env);

// 2. Store state in session, redirect user
// 3. Handle callback
const { accessToken, idToken } = await exchangeCodeForTokens(code, codeVerifier, env);

// 4. Get user info and create/link account
const googleUser = await getGoogleUserInfo(accessToken);
const user = await findOrCreateOAuthUser(db, {
  provider: 'google',
  providerUserId: googleUser.id,
  email: googleUser.email,
  // ...
});
```

**OAuth account linking**: Users can link multiple OAuth providers to one account via `/account/settings`.

#### Session Management
```typescript
// Cookie-based sessions
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
  }
});

// Auth helpers
await requireUserId(request);  // Throws redirect to /login if not authed
await getUserId(request);      // Returns null if not authed
```

### 2. Recipe Management

**Location**: `app/routes/recipes*.tsx`

#### Recipe CRUD
- **Create**: `/recipes/new` - Title, description, servings, image URL
- **Read**: `/recipes/:id` - Full recipe with steps, ingredients, dependencies
- **Update**: `/recipes/:id/edit` - Edit metadata
- **Delete**: Soft delete via `deletedAt` timestamp

#### Steps
Steps are ordered by `stepNum` and can include:
- Optional title
- Required description
- Ingredients (quantity + unit + ingredient name)
- Dependencies on previous steps' outputs

### 3. Step Output Use (⭐ Core Innovation)

**Location**: `app/lib/step-output-use-*.server.ts`, `app/components/StepOutputUseDisplay.tsx`

This feature allows steps to reference outputs from previous steps:

```typescript
// Example: Step 3 uses output from steps 1 and 2
await db.stepOutputUse.create({
  data: {
    recipeId: "recipe-123",
    outputStepNum: 1,  // "dice the onions"
    inputStepNum: 3,   // "add the diced onions to the pan"
  }
});
```

**Validation rules** (`app/lib/validation.ts`):
```typescript
export function validateStepReference(outputStepNum, inputStepNum) {
  // Must be positive integers
  // Cannot reference self
  // Can only reference PREVIOUS steps (outputStepNum < inputStepNum)
}
```

**Reorder validation** (`app/lib/step-reorder-validation.server.ts`):
When reordering steps, the system prevents invalid states:
- Can't move a step past steps that depend on its output
- Can't move a step before steps whose output it uses

```typescript
// Validates moving step 2 to position 4
const result = await validateStepReorderComplete(recipeId, 2, 4);
// Returns: { valid: false, error: "Cannot move Step 2 to position 4 because Step 3 uses its output" }
```

**Deletion protection** (`app/lib/step-deletion-validation.server.ts`):
```typescript
// Check if step can be deleted
const dependents = await checkStepUsage(recipeId, stepNum);
if (dependents.length > 0) {
  // Show warning: "Step 3 and Step 5 use this step's output"
}
```

### 4. Ingredients

**Location**: Embedded in step forms (`recipes.$id.steps.new.tsx`, `recipes.$id.steps.$stepId.edit.tsx`)

Ingredients are attached to steps, not recipes:

```typescript
// Add ingredient to step
await db.ingredient.create({
  data: {
    recipeId,
    stepNum,
    quantity: 2,
    unitId: "unit-cup",
    ingredientRefId: "ref-flour",
  }
});
```

**IngredientRef** and **Unit** are normalized:
- Same ingredient name across recipes points to same IngredientRef
- Units are reusable ("cup", "tbsp", "pieces")
- Enables shopping list aggregation

### 5. Cookbooks

**Location**: `app/routes/cookbooks*.tsx`

Cookbooks are collections of recipes:
- Users can create multiple cookbooks
- Same recipe can be in multiple cookbooks
- Tracks who added each recipe (`addedById`)

### 6. Shopping List

**Location**: `app/routes/shopping-list.tsx`

Personal shopping list with:
- Items with quantity + unit + ingredient
- Check/uncheck functionality
- Aggregates same ingredients across recipes

---

## Testing Setup

### Configuration

**File**: `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    pool: "threads",
    maxWorkers: 1,           // Single worker for DB consistency
    fileParallelism: false,  // Sequential for isolation
    coverage: {
      provider: "istanbul",
      include: ["app/lib/**", "app/routes/**", "app/components/**"],
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app"),
      "@": resolve(__dirname, "./app/components"),
    }
  }
});
```

### Test Setup

**File**: `test/setup.ts`

Key setup steps:
1. Register tsconfig path aliases for Node.js
2. Mock HeadlessUI animations (`jsdom-testing-mocks`)
3. Mock ResizeObserver for virtual components
4. Set test environment variables
5. Clean database before all tests

### Test Structure

```
test/
├── lib/                    # Unit tests for server utilities
│   ├── auth.server.test.ts
│   ├── google-oauth*.test.ts
│   ├── apple-oauth*.test.ts
│   ├── validation.test.ts
│   ├── step-output-use-*.test.ts
│   └── step-reorder-validation.server.test.ts
├── routes/                 # Integration tests for routes
│   ├── login.test.tsx
│   ├── signup.test.tsx
│   ├── recipes-*.test.tsx
│   ├── cookbooks-*.test.tsx
│   └── *-e2e.test.tsx      # End-to-end flows
├── models/                 # Data layer tests
│   ├── recipe.test.ts
│   ├── recipe-step.test.ts
│   ├── cookbook.test.ts
│   └── shopping-list.test.ts
├── components/             # Component unit tests
│   └── ui/
│       ├── button.test.tsx
│       ├── dialog.test.tsx
│       └── ...
├── setup.ts               # Global test setup
└── utils.ts               # Test utilities
```

### Running Tests

```bash
# Run all tests
npm test

# Run with UI
npm run test:ui

# Run with coverage
npm run test:coverage

# Run specific file
npm test -- test/lib/auth.server.test.ts

# Run matching pattern
npm test -- --grep "step output"
```

### Test Utilities

**File**: `test/utils.ts`

```typescript
// Create authenticated user for testing
export async function createTestUser(db) {
  return db.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      username: `testuser-${Date.now()}`,
      hashedPassword: await hashPassword("password"),
    }
  });
}

// Create recipe with steps for testing
export async function createTestRecipe(db, userId, options = {}) {
  // ...
}
```

### Coverage

The project targets 100% code coverage. Current coverage areas:
- `app/lib/**/*.ts` - All server utilities
- `app/routes/**/*.tsx` - All route handlers
- `app/components/**/*.tsx` - All components

---

## Storybook

### Running Storybook

```bash
npm run storybook
# Opens at http://localhost:6006
```

### Story Structure

**34 story files** in `stories/`:

```
stories/
├── Introduction.mdx          # Start here!
├── ComponentInventory.mdx    # All components at a glance
├── DesignTokens.mdx          # Colors, spacing, typography
├── Button.stories.tsx        # Button variants
├── Input.stories.tsx         # Input states
├── Dialog.stories.tsx        # Modal patterns
├── StepOutputUseDisplay.stories.tsx  # Custom component
└── ... (30+ more)
```

### Key Stories to Explore

1. **Introduction** (`Introduction.mdx`)
   - Overview of the component system
   - Philosophy and usage guidelines
   - Witty documentation style

2. **Component Inventory** (`ComponentInventory.mdx`)
   - All components in one view
   - Quick visual reference

3. **Design Tokens** (`DesignTokens.mdx`)
   - Color palette visualization
   - Spacing scale
   - Typography scale

4. **StepOutputUseDisplay** (`StepOutputUseDisplay.stories.tsx`)
   - The custom step dependency component
   - Shows various states (empty, single, multiple)

### Story Pattern

```typescript
// Example: Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '~/components/ui/button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Click me',
  },
};

export const Colors: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button color="blue">Blue</Button>
      <Button color="red">Red</Button>
      <Button color="green">Green</Button>
    </div>
  ),
};
```

### Interaction Tests

Many stories include play functions for interaction testing:

```typescript
export const WithInteraction: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.click(button);
    await expect(canvas.getByText('Clicked!')).toBeInTheDocument();
  },
};
```

### Chromatic Integration

Visual regression testing is set up with Chromatic:

```bash
# Run Chromatic (needs project token)
CHROMATIC_PROJECT_TOKEN=<token> npm run chromatic
```

Configuration in `chromatic.config.json`.

---

## Interesting Patterns & Decisions

### 1. Soft Delete for Recipes

Recipes use `deletedAt` instead of hard delete:
- Preserves data integrity
- Allows recovery
- Unique constraint allows recreating with same title

### 2. Ingredients on Steps, Not Recipes

Unlike most recipe apps, ingredients are attached to individual steps:
- More accurate cooking flow
- Enables "add ingredients at this step" UX
- Better shopping list aggregation

### 3. Step Output Dependencies

The `StepOutputUse` model is the key innovation:
- Explicit declaration of step relationships
- Enables dependency-aware reordering
- Prevents accidentally breaking recipes

### 4. Server-Side Validation with Shared Code

`app/lib/validation.ts` exports functions used on both client and server:
```typescript
// Works in browser and Node.js
export function validateTitle(title: string): ValidationResult {
  // ...
}
```

### 5. D1 Adapter Pattern

The codebase handles both local SQLite and Cloudflare D1:
```typescript
// In loaders/actions
const database = context?.cloudflare?.env?.DB
  ? getDb(context.cloudflare.env as { DB: D1Database })  // Production
  : db;  // Development
```

### 6. OAuth Account Linking

Users can have multiple OAuth providers linked:
- Sign up with Google
- Later link Apple
- Either can be used to log in

### 7. Normalized Ingredients

`IngredientRef` and `Unit` are normalized tables:
- "onion" is stored once, referenced many times
- Enables future features: nutrition lookup, unit conversion

### 8. Test Isolation via Sequential Execution

Tests run sequentially with database cleanup:
```typescript
// vitest.config.ts
maxWorkers: 1,
fileParallelism: false,
```

This ensures test isolation with a shared test database.

---

## Flight Exploration Tips

### Without Internet

1. **Storybook** - Pre-built at `storybook-static/`
   ```bash
   npx serve storybook-static
   ```

2. **Tests** - Run offline (uses local SQLite)
   ```bash
   npm test
   ```

3. **Code Reading** - Key files to study:
   - `prisma/schema.prisma` - Understand the data model
   - `app/routes/recipes.$id.steps.$stepId.edit.tsx` - Most complex route
   - `app/lib/step-reorder-validation.server.ts` - Interesting algorithm

### Exploration Order

1. **Schema first** - `prisma/schema.prisma` (15 min)
2. **Route structure** - `app/routes.ts` (5 min)
3. **Pick a feature flow**:
   - Auth: `login.tsx` → `auth.server.ts` → `session.server.ts`
   - Recipes: `recipes.new.tsx` → `recipes.$id.tsx` → `recipes.$id.edit.tsx`
   - Steps: `recipes.$id.steps.new.tsx` → `step-output-use-*.ts`
4. **Component library** - Browse `app/components/ui/` (30 min)
5. **Tests** - Read tests for understanding intent

### Questions to Ponder ✈️

1. **Recipe Import** - How would you parse "1 cup diced onions" into structured data?

2. **Step Reordering UI** - The validation exists, but how should drag-and-drop feel?

3. **Recipe Scaling** - How to handle "serves 4" → "serves 8"?

4. **Sharing** - Public recipes? Private sharing links?

5. **Timer Integration** - Steps often have durations ("bake for 30 minutes")

6. **Ingredient Substitutions** - "No eggs? Try applesauce"

7. **Nutrition** - How would you integrate nutrition data?

### File Size Reference

| Area | Files | Lines (approx) |
|------|-------|----------------|
| Schema | 1 | 200 |
| Routes | 17 | 3,500 |
| Components | 28 | 4,000 |
| Lib | 14 | 1,500 |
| Tests | 50+ | 21,000+ |
| Stories | 34 | 25,000+ |

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server |
| `npm run storybook` | Component explorer |
| `npm test` | Run tests |
| `npm run test:ui` | Tests with UI |
| `npm run test:coverage` | Coverage report |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run prisma:studio` | Database GUI |
| `npm run prisma:generate` | Regenerate Prisma client |

---

*Happy exploring! 🦝✈️*
