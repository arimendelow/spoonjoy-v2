# Spoonjoy v2 Exploration Guide 🍳

*A guide for exploring the codebase on your flight — Jan 29, 2026*

---

## Quick Start

```bash
cd ~/Projects/spoonjoy-v2

# Install deps (if needed)
npm install

# Run the app
npm run dev

# Run Storybook (component explorer)
npm run storybook
```

---

## What's Been Built

### 1. Core Recipe Features

**Step Dependencies (stepOutputUse)** — The star feature! 🌟
- Steps can declare dependencies on outputs from previous steps
- "Use 1 cup of the diced onions from Step 2"
- Location: `app/components/StepOutputUseDisplay.tsx`
- Schema: `app/db/schema/step-output-uses.ts`

### 2. UI Component Library

All components in `app/components/ui/` are from Catalyst UI (Tailwind Labs):
- **Form inputs**: Button, Input, Textarea, Select, Listbox, Checkbox, Radio, Switch, Combobox
- **Display**: Heading, Text, Badge, Avatar, Alert, Link, Divider
- **Interactive**: Dialog, Dropdown, Pagination, Table
- **Layout**: Fieldset, DescriptionList, StackedLayout, SidebarLayout, Navbar, Sidebar

### 3. Authentication

- OAuth setup with Google (ready for more providers)
- Auth layout at `app/components/ui/auth-layout.tsx`
- OAuth buttons component

---

## Storybook — The Fun Part 🎨

We just finished setting up Storybook with **34 story files**!

```bash
npm run storybook
# Opens at http://localhost:6006
```

### What to Explore

1. **Introduction** — Start here, it's snarky
2. **Component Inventory** — See everything at a glance
3. **Design Tokens** — Colors, spacing, typography reference
4. **StepOutputUseDisplay** — Our custom feature, extra love in the docs

### Interaction Tests

Many components have "play" functions that test interactions:
- Click the "Interactions" tab in Storybook
- Watch automated tests run
- Button, Dialog, Dropdown have the most interesting ones

### The Snarky Docs

Every component has personality-filled documentation. Some highlights:
- Button: "The Three Laws of Buttonics"
- Pagination: "Because infinite scroll is a crime against humanity"
- Dialog: "The velvet rope between you and the content"
- Alert: "Not to be confused with those annoying browser alert() popups from 2003"

---

## Key Files to Browse

### Schema & Database
```
app/db/
├── schema/
│   ├── recipes.ts          # Recipe, Step, Ingredient schemas
│   ├── step-output-uses.ts # Step dependency schema
│   └── users.ts            # User/auth schemas
├── index.ts                # Drizzle setup for D1
└── migrations/             # SQL migrations
```

### Routes (React Router v7)
```
app/routes/
├── _index.tsx              # Home page
├── recipes.$id.tsx         # Recipe detail
└── auth/                   # Login/signup
```

### Components
```
app/components/
├── ui/                     # Catalyst components (29 files)
├── StepOutputUseDisplay.tsx # Custom step dependency display
└── ValidationError.tsx     # Form validation display
```

---

## Architecture Notes

### Stack
- **Framework**: React Router v7 (file-based routing)
- **Styling**: Tailwind CSS + Catalyst UI
- **Database**: Cloudflare D1 (SQLite at edge)
- **ORM**: Drizzle
- **Deployment**: Cloudflare Pages/Workers

### Path Aliases
```typescript
"~/*" → "./app/*"
"@/*" → "./app/components/*"
```

### Testing
```bash
npm test        # Vitest unit tests
npm run storybook:test  # Storybook interaction tests (if configured)
```

---

## Things to Think About on the Flight ✈️

1. **Recipe Creation Flow** — How should users add recipes? Import? Manual entry?

2. **Ingredient Parsing** — "1 cup diced onions" → structured data?

3. **Step Dependencies UX** — Current implementation uses a listbox. Better ideas?

4. **Scaling/Sharing** — How to handle recipe scaling? Sharing between users?

5. **Mobile Experience** — Check the responsive stories in Storybook

---

## Next Steps (After Flight)

1. **Chromatic Setup** — Add project token for visual regression
   ```bash
   CHROMATIC_PROJECT_TOKEN=<token> npm run chromatic
   ```

2. **Recipe CRUD** — Build out create/edit flows

3. **Ingredient Intelligence** — Parse natural language ingredients

4. **Deployment** — Push to Cloudflare (checklist being prepared)

---

## Quick Reference

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start dev server |
| `npm run storybook` | Component explorer |
| `npm test` | Run tests |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |

---

*Have a good flight! 🦝*
