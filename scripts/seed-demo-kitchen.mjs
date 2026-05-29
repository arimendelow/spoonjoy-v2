#!/usr/bin/env node
// Seed a demo Spoonjoy kitchen with sample recipes, a cookbook, and a shopping
// list — for the working reviewer account that connector directories (Anthropic,
// OpenAI) require. It calls the public REST API with a bearer token, so it works
// against production without DB access.
//
// Setup (Ari):
//   1. Sign up the demo account (e.g. demo@spoonjoy.app) at https://spoonjoy.app/signup
//   2. Create an API token in Account Settings (or via create_api_token)
//   3. Run:  SPOONJOY_API_TOKEN=sj_... node scripts/seed-demo-kitchen.mjs
//
// Options (env):
//   SPOONJOY_API_TOKEN   required — bearer token for the demo account
//   SPOONJOY_BASE_URL    optional — defaults to https://spoonjoy.app

const BASE_URL = (process.env.SPOONJOY_BASE_URL ?? "https://spoonjoy.app").replace(/\/$/, "");
const TOKEN = process.env.SPOONJOY_API_TOKEN;

if (!TOKEN) {
  console.error("Missing SPOONJOY_API_TOKEN. See the header of this script for setup steps.");
  process.exit(1);
}

async function callTool(operation, args = {}) {
  const res = await fetch(`${BASE_URL}/api/tools/${operation}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || payload.ok === false) {
    const message = payload?.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`${operation}: ${message}`);
  }
  return payload.data;
}

// Best-effort: a recipe whose title already exists will 400; treat that as
// "already seeded" and keep going so the script is safe to re-run.
async function seedRecipe(recipe) {
  try {
    const data = await callTool("create_recipe", recipe);
    console.log(`  ✓ recipe: ${recipe.title}`);
    return data.recipe;
  } catch (error) {
    console.log(`  • recipe skipped (${recipe.title}): ${error.message}`);
    return null;
  }
}

const RECIPES = [
  {
    title: "Weeknight Tomato Beans",
    description: "A 20-minute skillet of white beans in garlicky tomato with crusty bread.",
    servings: "4",
    steps: [
      {
        description: "Warm olive oil and sizzle the garlic until fragrant.",
        duration: 3,
        ingredients: [
          { name: "olive oil", quantity: 2, unit: "tbsp" },
          { name: "garlic", quantity: 3, unit: "clove" },
        ],
      },
      {
        description: "Add crushed tomatoes and beans; simmer until thickened. Finish with basil.",
        duration: 12,
        ingredients: [
          { name: "crushed tomatoes", quantity: 1, unit: "can" },
          { name: "white beans", quantity: 2, unit: "can" },
          { name: "basil", quantity: 0.25, unit: "cup" },
        ],
      },
    ],
  },
  {
    title: "Lemon Ricotta Pancakes",
    description: "Bright, fluffy weekend pancakes with whipped ricotta and lemon zest.",
    servings: "3",
    steps: [
      {
        description: "Whisk the dry ingredients, then fold in ricotta, milk, eggs, and lemon zest.",
        ingredients: [
          { name: "flour", quantity: 1.5, unit: "cup" },
          { name: "ricotta", quantity: 1, unit: "cup" },
          { name: "milk", quantity: 0.75, unit: "cup" },
          { name: "eggs", quantity: 2, unit: "whole" },
          { name: "lemon", quantity: 1, unit: "whole" },
        ],
      },
      {
        description: "Cook on a buttered griddle until golden, flipping once.",
        duration: 6,
        ingredients: [{ name: "butter", quantity: 1, unit: "tbsp" }],
      },
    ],
  },
  {
    title: "Sheet-Pan Harissa Chicken",
    description: "Spiced chicken thighs roasted with chickpeas and red onion on one pan.",
    servings: "4",
    steps: [
      {
        description: "Toss chicken, chickpeas, and onion with harissa and olive oil.",
        ingredients: [
          { name: "chicken thighs", quantity: 6, unit: "piece" },
          { name: "chickpeas", quantity: 1, unit: "can" },
          { name: "red onion", quantity: 1, unit: "whole" },
          { name: "harissa", quantity: 2, unit: "tbsp" },
        ],
      },
      {
        description: "Roast at 425°F until the chicken is crisp and cooked through.",
        duration: 35,
        ingredients: [],
      },
    ],
  },
];

async function main() {
  console.log(`Seeding demo kitchen at ${BASE_URL} ...`);

  const status = await callTool("auth_status");
  if (!status.writable) {
    throw new Error("Token is not writable — check that SPOONJOY_API_TOKEN belongs to the demo account.");
  }
  console.log(`Authenticated as ${status.principal?.email ?? status.defaultOwnerEmail ?? "demo account"}.`);

  console.log("Recipes:");
  const recipes = [];
  for (const recipe of RECIPES) {
    const created = await seedRecipe(recipe);
    if (created) recipes.push(created);
  }

  console.log("Cookbook:");
  const cookbook = await callTool("create_cookbook", { title: "Weeknight Favorites" });
  console.log(`  ✓ cookbook: ${cookbook.cookbook.title}`);
  for (const recipe of recipes) {
    await callTool("add_recipe_to_cookbook", { cookbookId: cookbook.cookbook.id, recipeId: recipe.id });
    console.log(`    ✓ added: ${recipe.title}`);
  }

  console.log("Shopping list:");
  for (const item of [
    { name: "olive oil", quantity: 1, unit: "bottle" },
    { name: "lemons", quantity: 4, unit: "whole" },
    { name: "chickpeas", quantity: 2, unit: "can" },
  ]) {
    await callTool("add_shopping_list_item", item);
    console.log(`  ✓ ${item.name}`);
  }

  console.log("\nDone. The demo kitchen is ready for reviewers.");
}

main().catch((error) => {
  console.error(`\nSeed failed: ${error.message}`);
  process.exit(1);
});
