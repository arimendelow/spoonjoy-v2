import {
  Apple,
  Beef,
  CookingPot,
  Droplets,
  Egg,
  Leaf,
  LucideIcon,
  Milk,
  Package,
  Sandwich,
  Wheat,
} from "lucide-react";

export type IngredientCategoryKey =
  | "produce"
  | "protein"
  | "dairy"
  | "pantry"
  | "bakery"
  | "frozen"
  | "spices"
  | "other";

export type IngredientIconKey =
  | "leaf"
  | "apple"
  | "beef"
  | "egg"
  | "milk"
  | "wheat"
  | "droplets"
  | "package"
  | "pot"
  | "sandwich";

export type IngredientAffordance = {
  categoryKey: IngredientCategoryKey;
  categoryLabel: string;
  iconKey: IngredientIconKey;
  iconLabel: string;
};

const CATEGORY_LABELS: Record<IngredientCategoryKey, string> = {
  produce: "Produce",
  protein: "Protein",
  dairy: "Dairy",
  pantry: "Pantry",
  bakery: "Bakery",
  frozen: "Frozen",
  spices: "Spices",
  other: "Other",
};

const ICON_LABELS: Record<IngredientIconKey, string> = {
  leaf: "Leaf",
  apple: "Apple",
  beef: "Meat",
  egg: "Egg",
  milk: "Milk",
  wheat: "Grain",
  droplets: "Liquid",
  package: "Packaged",
  pot: "Cooked",
  sandwich: "Prepared",
};

const CATEGORY_KEYWORDS: Array<{
  includes: string[];
  categoryKey: IngredientCategoryKey;
  iconKey: IngredientIconKey;
}> = [
  { includes: ["basil", "cilantro", "lettuce", "spinach", "kale", "herb"], categoryKey: "produce", iconKey: "leaf" },
  { includes: ["apple", "onion", "garlic", "tomato", "carrot", "potato", "pepper", "lemon"], categoryKey: "produce", iconKey: "apple" },
  { includes: ["chicken", "beef", "pork", "salmon", "shrimp", "tofu", "turkey"], categoryKey: "protein", iconKey: "beef" },
  { includes: ["egg"], categoryKey: "protein", iconKey: "egg" },
  { includes: ["milk", "cream", "yogurt", "cheese", "butter"], categoryKey: "dairy", iconKey: "milk" },
  { includes: ["flour", "rice", "oat", "pasta", "noodle", "quinoa"], categoryKey: "pantry", iconKey: "wheat" },
  { includes: ["oil", "vinegar", "broth", "stock", "water", "sauce"], categoryKey: "pantry", iconKey: "droplets" },
  { includes: ["bread", "bun", "tortilla"], categoryKey: "bakery", iconKey: "sandwich" },
  { includes: ["frozen"], categoryKey: "frozen", iconKey: "package" },
  { includes: ["salt", "pepper", "cumin", "paprika", "oregano", "spice"], categoryKey: "spices", iconKey: "pot" },
];

export function inferIngredientAffordance(name: string): IngredientAffordance {
  const normalized = name.trim().toLowerCase();

  const match = CATEGORY_KEYWORDS.find((rule) =>
    rule.includes.some((keyword) => normalized.includes(keyword))
  );

  const categoryKey = match?.categoryKey ?? "other";
  const iconKey = match?.iconKey ?? "package";

  return {
    categoryKey,
    categoryLabel: CATEGORY_LABELS[categoryKey],
    iconKey,
    iconLabel: ICON_LABELS[iconKey],
  };
}

export function resolveIngredientAffordance(
  ingredientName: string,
  categoryKey: string | null | undefined,
  iconKey: string | null | undefined
): IngredientAffordance {
  const inferred = inferIngredientAffordance(ingredientName);
  const safeCategory = (categoryKey && categoryKey in CATEGORY_LABELS
    ? categoryKey
    : inferred.categoryKey) as IngredientCategoryKey;
  const safeIcon = (iconKey && iconKey in ICON_LABELS
    ? iconKey
    : inferred.iconKey) as IngredientIconKey;

  return {
    categoryKey: safeCategory,
    categoryLabel: CATEGORY_LABELS[safeCategory],
    iconKey: safeIcon,
    iconLabel: ICON_LABELS[safeIcon],
  };
}

export const INGREDIENT_ICON_COMPONENTS: Record<IngredientIconKey, LucideIcon> = {
  leaf: Leaf,
  apple: Apple,
  beef: Beef,
  egg: Egg,
  milk: Milk,
  wheat: Wheat,
  droplets: Droplets,
  package: Package,
  pot: CookingPot,
  sandwich: Sandwich,
};
