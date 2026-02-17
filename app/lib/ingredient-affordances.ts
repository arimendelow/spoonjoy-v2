import {
  Apple,
  Beef,
  Carrot,
  Citrus,
  CookingPot,
  Droplets,
  Drumstick,
  Egg,
  Fish,
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
  | "carrot"
  | "citrus"
  | "apple"
  | "drumstick"
  | "beef"
  | "fish"
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
  leaf: "Leafy greens",
  carrot: "Vegetable",
  citrus: "Citrus",
  apple: "Fruit",
  drumstick: "Chicken",
  beef: "Red meat",
  fish: "Seafood",
  egg: "Egg",
  milk: "Dairy",
  wheat: "Grain",
  droplets: "Liquid",
  package: "Packaged",
  pot: "Spice",
  sandwich: "Bread",
};

const GENERIC_ICON_KEYS: IngredientIconKey[] = ["package"];

const CATEGORY_KEYWORDS: Array<{
  includes: string[];
  categoryKey: IngredientCategoryKey;
  iconKey: IngredientIconKey;
}> = [
  { includes: ["basil", "cilantro", "parsley", "lettuce", "spinach", "kale", "arugula", "herb"], categoryKey: "produce", iconKey: "leaf" },
  { includes: ["lime", "lemon", "orange", "grapefruit", "citrus"], categoryKey: "produce", iconKey: "citrus" },
  { includes: ["carrot", "onion", "garlic", "tomato", "potato", "broccoli", "cauliflower", "zucchini", "cucumber", "celery"], categoryKey: "produce", iconKey: "carrot" },
  { includes: ["apple", "banana", "berry", "avocado", "mango"], categoryKey: "produce", iconKey: "apple" },

  { includes: ["chicken", "thigh", "drumstick", "wing"], categoryKey: "protein", iconKey: "drumstick" },
  { includes: ["beef", "steak", "ground beef", "pork", "lamb", "sausage", "turkey"], categoryKey: "protein", iconKey: "beef" },
  { includes: ["salmon", "tuna", "cod", "fish", "shrimp", "prawn"], categoryKey: "protein", iconKey: "fish" },
  { includes: ["egg"], categoryKey: "protein", iconKey: "egg" },
  { includes: ["tofu", "tempeh", "beans", "lentil", "chickpea"], categoryKey: "protein", iconKey: "package" },

  { includes: ["coconut milk"], categoryKey: "pantry", iconKey: "package" },
  { includes: ["flour", "rice", "oat", "pasta", "noodle", "quinoa", "sugar"], categoryKey: "pantry", iconKey: "wheat" },
  { includes: ["oil", "vinegar", "broth", "stock", "water", "soy sauce", "tamari", "sauce"], categoryKey: "pantry", iconKey: "droplets" },
  { includes: ["can", "canned", "jar", "coconut cream"], categoryKey: "pantry", iconKey: "package" },

  { includes: ["milk", "cream", "yogurt", "cheese", "butter", "half and half"], categoryKey: "dairy", iconKey: "milk" },

  { includes: ["bread", "bun", "tortilla", "bagel", "pita"], categoryKey: "bakery", iconKey: "sandwich" },
  { includes: ["frozen"], categoryKey: "frozen", iconKey: "package" },
  { includes: ["salt", "pepper", "cumin", "paprika", "oregano", "thyme", "spice", "seasoning"], categoryKey: "spices", iconKey: "pot" },
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
  const submittedIcon = (iconKey && iconKey in ICON_LABELS ? iconKey : null) as IngredientIconKey | null;
  const safeIcon = submittedIcon && !GENERIC_ICON_KEYS.includes(submittedIcon)
    ? submittedIcon
    : inferred.iconKey;

  return {
    categoryKey: safeCategory,
    categoryLabel: CATEGORY_LABELS[safeCategory],
    iconKey: safeIcon,
    iconLabel: ICON_LABELS[safeIcon],
  };
}

export const INGREDIENT_ICON_COMPONENTS: Record<IngredientIconKey, LucideIcon> = {
  leaf: Leaf,
  carrot: Carrot,
  citrus: Citrus,
  apple: Apple,
  drumstick: Drumstick,
  beef: Beef,
  fish: Fish,
  egg: Egg,
  milk: Milk,
  wheat: Wheat,
  droplets: Droplets,
  package: Package,
  pot: CookingPot,
  sandwich: Sandwich,
};
