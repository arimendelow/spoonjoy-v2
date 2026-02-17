-- Seed data for Spoonjoy v2
-- Run with: npx wrangler d1 execute spoonjoy-local --local --file=./migrations/seed.sql

-- ============================================================================
-- DEMO USER
-- Email: demo@spoonjoy.com
-- Password: demo1234
-- ============================================================================

INSERT OR IGNORE INTO "User" (
    "id", "email", "username", "hashedPassword", "salt", "photoUrl", "createdAt", "updatedAt"
) VALUES (
    'demo_user_001',
    'demo@spoonjoy.com',
    'demo_chef',
    '$2b$10$OsXoQzgl8Hk47gxH.bZqVu/18ydWWtF8oJs.c8WjaqxgU1HoLrI4i',
    '$2b$10$OsXoQzgl8Hk47gxH.bZqVu',
    'https://api.dicebear.com/7.x/initials/svg?seed=DC&backgroundColor=f4a261&fontFamily=Georgia',
    datetime('now'),
    datetime('now')
);

-- ============================================================================
-- UNITS
-- ============================================================================

INSERT OR IGNORE INTO "Unit" ("id", "name", "updatedAt") VALUES
    ('unit_cup', 'cup', datetime('now')),
    ('unit_tbsp', 'tablespoon', datetime('now')),
    ('unit_tsp', 'teaspoon', datetime('now')),
    ('unit_gram', 'gram', datetime('now')),
    ('unit_ml', 'milliliter', datetime('now')),
    ('unit_piece', 'piece', datetime('now')),
    ('unit_whole', 'whole', datetime('now')),
    ('unit_clove', 'clove', datetime('now')),
    ('unit_sprig', 'sprig', datetime('now')),
    ('unit_pinch', 'pinch', datetime('now'));

-- ============================================================================
-- INGREDIENT REFERENCES
-- ============================================================================

INSERT OR IGNORE INTO "IngredientRef" ("id", "name", "updatedAt") VALUES
    ('ing_flour', 'flour', datetime('now')),
    ('ing_salt', 'salt', datetime('now')),
    ('ing_olive_oil', 'olive oil', datetime('now')),
    ('ing_tomato', 'tomato', datetime('now')),
    ('ing_garlic', 'garlic', datetime('now')),
    ('ing_basil', 'basil', datetime('now')),
    ('ing_mozzarella', 'mozzarella cheese', datetime('now')),
    ('ing_chicken', 'chicken breast', datetime('now')),
    ('ing_soy_sauce', 'soy sauce', datetime('now')),
    ('ing_sesame_oil', 'sesame oil', datetime('now')),
    ('ing_honey', 'honey', datetime('now')),
    ('ing_ginger', 'ginger', datetime('now')),
    ('ing_veg_oil', 'vegetable oil', datetime('now')),
    ('ing_bell_pepper', 'bell pepper', datetime('now')),
    ('ing_broccoli', 'broccoli', datetime('now')),
    ('ing_rice', 'rice', datetime('now')),
    ('ing_scallion', 'scallion', datetime('now')),
    ('ing_black_pepper', 'black pepper', datetime('now')),
    ('ing_avocado', 'avocado', datetime('now')),
    ('ing_lime', 'lime', datetime('now')),
    ('ing_onion', 'onion', datetime('now')),
    ('ing_jalapeno', 'jalapeno', datetime('now')),
    ('ing_cilantro', 'cilantro', datetime('now')),
    ('ing_cumin', 'cumin', datetime('now'));

-- ============================================================================
-- RECIPE 1: Classic Margherita Pizza
-- ============================================================================

INSERT OR IGNORE INTO "Recipe" (
    "id", "title", "description", "servings", "chefId", "createdAt", "updatedAt"
) VALUES (
    'recipe_pizza_001',
    'Classic Margherita Pizza',
    'A traditional Italian pizza with fresh tomatoes, mozzarella, and basil. Simple ingredients, perfect execution.',
    '2 pizzas',
    'demo_user_001',
    datetime('now'),
    datetime('now')
);

-- Pizza Steps
INSERT OR IGNORE INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
    ('step_pizza_1', 'recipe_pizza_001', 1, 'Make the dough', 'In a large bowl, combine flour, salt, and yeast. Add warm water and olive oil. Mix until a shaggy dough forms, then knead for 10 minutes until smooth and elastic. Let rise for 1 hour.', datetime('now')),
    ('step_pizza_2', 'recipe_pizza_001', 2, 'Prepare the sauce', 'Crush San Marzano tomatoes by hand. Add minced garlic, a drizzle of olive oil, salt, and fresh basil. Let sit for 30 minutes to develop flavor.', datetime('now')),
    ('step_pizza_3', 'recipe_pizza_001', 3, 'Shape and top', 'Punch down the dough and divide in half. Stretch each piece into a 12-inch circle. Spread sauce evenly, leaving a 1-inch border. Top with torn mozzarella.', datetime('now')),
    ('step_pizza_4', 'recipe_pizza_001', 4, 'Bake', 'Bake in a preheated 500F oven for 10-12 minutes until the crust is golden and cheese is bubbling. Finish with fresh basil leaves and a drizzle of olive oil.', datetime('now'));

-- Pizza Ingredients
INSERT OR IGNORE INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
    ('ing_p1_flour', 'recipe_pizza_001', 1, 500, 'unit_gram', 'ing_flour', datetime('now')),
    ('ing_p1_salt', 'recipe_pizza_001', 1, 1, 'unit_tsp', 'ing_salt', datetime('now')),
    ('ing_p1_oil', 'recipe_pizza_001', 1, 2, 'unit_tbsp', 'ing_olive_oil', datetime('now')),
    ('ing_p2_tomato', 'recipe_pizza_001', 2, 400, 'unit_gram', 'ing_tomato', datetime('now')),
    ('ing_p2_garlic', 'recipe_pizza_001', 2, 2, 'unit_clove', 'ing_garlic', datetime('now')),
    ('ing_p2_oil', 'recipe_pizza_001', 2, 1, 'unit_tbsp', 'ing_olive_oil', datetime('now')),
    ('ing_p2_basil', 'recipe_pizza_001', 2, 5, 'unit_sprig', 'ing_basil', datetime('now')),
    ('ing_p2_salt', 'recipe_pizza_001', 2, 0.5, 'unit_tsp', 'ing_salt', datetime('now')),
    ('ing_p3_mozz', 'recipe_pizza_001', 3, 200, 'unit_gram', 'ing_mozzarella', datetime('now')),
    ('ing_p4_basil', 'recipe_pizza_001', 4, 4, 'unit_sprig', 'ing_basil', datetime('now')),
    ('ing_p4_oil', 'recipe_pizza_001', 4, 1, 'unit_tbsp', 'ing_olive_oil', datetime('now'));

-- Pizza StepOutputUse: Step 3 uses output from steps 1 and 2
INSERT OR IGNORE INTO "StepOutputUse" ("id", "recipeId", "outputStepNum", "inputStepNum", "updatedAt") VALUES
    ('sou_pizza_1_3', 'recipe_pizza_001', 1, 3, datetime('now')),
    ('sou_pizza_2_3', 'recipe_pizza_001', 2, 3, datetime('now')),
    ('sou_pizza_3_4', 'recipe_pizza_001', 3, 4, datetime('now'));

-- ============================================================================
-- RECIPE 2: Chicken Stir-Fry
-- ============================================================================

INSERT OR IGNORE INTO "Recipe" (
    "id", "title", "description", "servings", "chefId", "createdAt", "updatedAt"
) VALUES (
    'recipe_stirfry_001',
    'Chicken Stir-Fry with Vegetables',
    'A quick and healthy weeknight dinner loaded with colorful vegetables and tender chicken in a savory sauce.',
    '4 servings',
    'demo_user_001',
    datetime('now'),
    datetime('now')
);

-- Stir-Fry Steps
INSERT OR IGNORE INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
    ('step_sf_1', 'recipe_stirfry_001', 1, 'Make the sauce', 'Whisk together soy sauce, sesame oil, honey, ginger, and garlic. Set aside.', datetime('now')),
    ('step_sf_2', 'recipe_stirfry_001', 2, 'Prep the chicken', 'Cut chicken breast into bite-sized pieces. Season with salt and pepper.', datetime('now')),
    ('step_sf_3', 'recipe_stirfry_001', 3, 'Cook the chicken', 'Heat vegetable oil in a large wok over high heat. Add chicken and cook for 5-6 minutes until golden and cooked through. Remove and set aside.', datetime('now')),
    ('step_sf_4', 'recipe_stirfry_001', 4, 'Stir-fry vegetables', 'Add more oil to the wok. Stir-fry bell peppers and broccoli for 3-4 minutes until crisp-tender.', datetime('now')),
    ('step_sf_5', 'recipe_stirfry_001', 5, 'Combine and serve', 'Return chicken to the wok. Pour sauce over everything and toss to coat. Cook for 2 minutes until sauce thickens. Serve over rice with scallions.', datetime('now'));

-- Stir-Fry Ingredients
INSERT OR IGNORE INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
    ('ing_sf1_soy', 'recipe_stirfry_001', 1, 3, 'unit_tbsp', 'ing_soy_sauce', datetime('now')),
    ('ing_sf1_sesame', 'recipe_stirfry_001', 1, 1, 'unit_tbsp', 'ing_sesame_oil', datetime('now')),
    ('ing_sf1_honey', 'recipe_stirfry_001', 1, 2, 'unit_tbsp', 'ing_honey', datetime('now')),
    ('ing_sf1_ginger', 'recipe_stirfry_001', 1, 1, 'unit_tbsp', 'ing_ginger', datetime('now')),
    ('ing_sf1_garlic', 'recipe_stirfry_001', 1, 3, 'unit_clove', 'ing_garlic', datetime('now')),
    ('ing_sf2_chicken', 'recipe_stirfry_001', 2, 500, 'unit_gram', 'ing_chicken', datetime('now')),
    ('ing_sf2_salt', 'recipe_stirfry_001', 2, 0.5, 'unit_tsp', 'ing_salt', datetime('now')),
    ('ing_sf2_pepper', 'recipe_stirfry_001', 2, 0.25, 'unit_tsp', 'ing_black_pepper', datetime('now')),
    ('ing_sf3_oil', 'recipe_stirfry_001', 3, 2, 'unit_tbsp', 'ing_veg_oil', datetime('now')),
    ('ing_sf4_oil', 'recipe_stirfry_001', 4, 1, 'unit_tbsp', 'ing_veg_oil', datetime('now')),
    ('ing_sf4_pepper', 'recipe_stirfry_001', 4, 2, 'unit_whole', 'ing_bell_pepper', datetime('now')),
    ('ing_sf4_broccoli', 'recipe_stirfry_001', 4, 200, 'unit_gram', 'ing_broccoli', datetime('now')),
    ('ing_sf5_rice', 'recipe_stirfry_001', 5, 300, 'unit_gram', 'ing_rice', datetime('now')),
    ('ing_sf5_scallion', 'recipe_stirfry_001', 5, 3, 'unit_whole', 'ing_scallion', datetime('now'));

-- Stir-Fry StepOutputUse
INSERT OR IGNORE INTO "StepOutputUse" ("id", "recipeId", "outputStepNum", "inputStepNum", "updatedAt") VALUES
    ('sou_sf_2_3', 'recipe_stirfry_001', 2, 3, datetime('now')),
    ('sou_sf_1_5', 'recipe_stirfry_001', 1, 5, datetime('now')),
    ('sou_sf_3_5', 'recipe_stirfry_001', 3, 5, datetime('now')),
    ('sou_sf_4_5', 'recipe_stirfry_001', 4, 5, datetime('now'));

-- ============================================================================
-- RECIPE 3: Fresh Guacamole
-- ============================================================================

INSERT OR IGNORE INTO "Recipe" (
    "id", "title", "description", "servings", "chefId", "createdAt", "updatedAt"
) VALUES (
    'recipe_guac_001',
    'Fresh Guacamole',
    'Classic Mexican avocado dip with lime, cilantro, and a kick of jalapeno.',
    '6 servings',
    'demo_user_001',
    datetime('now'),
    datetime('now')
);

-- Guacamole Steps
INSERT OR IGNORE INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
    ('step_guac_1', 'recipe_guac_001', 1, 'Prep ingredients', 'Dice onion, mince garlic, seed and mince jalapeno, and chop cilantro. Dice tomatoes.', datetime('now')),
    ('step_guac_2', 'recipe_guac_001', 2, 'Mash and mix', 'Cut avocados in half and remove pits. Scoop flesh into a bowl and mash to desired consistency. Add lime juice immediately to prevent browning.', datetime('now')),
    ('step_guac_3', 'recipe_guac_001', 3, 'Combine and season', 'Fold in the prepped ingredients. Season with salt and cumin. Taste and adjust seasoning. Serve with tortilla chips.', datetime('now'));

-- Guacamole Ingredients
INSERT OR IGNORE INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
    ('ing_g1_onion', 'recipe_guac_001', 1, 0.5, 'unit_whole', 'ing_onion', datetime('now')),
    ('ing_g1_garlic', 'recipe_guac_001', 1, 1, 'unit_clove', 'ing_garlic', datetime('now')),
    ('ing_g1_jalapeno', 'recipe_guac_001', 1, 1, 'unit_whole', 'ing_jalapeno', datetime('now')),
    ('ing_g1_cilantro', 'recipe_guac_001', 1, 0.25, 'unit_cup', 'ing_cilantro', datetime('now')),
    ('ing_g1_tomato', 'recipe_guac_001', 1, 1, 'unit_whole', 'ing_tomato', datetime('now')),
    ('ing_g2_avocado', 'recipe_guac_001', 2, 3, 'unit_whole', 'ing_avocado', datetime('now')),
    ('ing_g2_lime', 'recipe_guac_001', 2, 2, 'unit_whole', 'ing_lime', datetime('now')),
    ('ing_g3_salt', 'recipe_guac_001', 3, 0.5, 'unit_tsp', 'ing_salt', datetime('now')),
    ('ing_g3_cumin', 'recipe_guac_001', 3, 0.25, 'unit_tsp', 'ing_cumin', datetime('now'));

-- Guacamole StepOutputUse: Step 3 uses output from steps 1 and 2
INSERT OR IGNORE INTO "StepOutputUse" ("id", "recipeId", "outputStepNum", "inputStepNum", "updatedAt") VALUES
    ('sou_guac_1_3', 'recipe_guac_001', 1, 3, datetime('now')),
    ('sou_guac_2_3', 'recipe_guac_001', 2, 3, datetime('now'));
