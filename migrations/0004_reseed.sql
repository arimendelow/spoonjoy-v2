-- Reseed: Clear existing data and insert full dataset with real food images
-- Order matters for foreign keys

DELETE FROM "StepOutputUse";
DELETE FROM "Ingredient";
DELETE FROM "RecipeStep";
DELETE FROM "ShoppingListItem";
DELETE FROM "ShoppingList";
DELETE FROM "RecipeInCookbook";
DELETE FROM "Cookbook";
DELETE FROM "Recipe";
DELETE FROM "OAuth";
DELETE FROM "User";

-- ============================================================================
-- ENSURE ALL UNITS EXIST
-- ============================================================================
INSERT OR IGNORE INTO "Unit" ("id", "name", "updatedAt") VALUES
  ('unit_bunch', 'bunch', datetime('now')),
  ('unit_liter', 'liter', datetime('now')),
  ('unit_slice', 'slice', datetime('now')),
  ('unit_pound', 'pound', datetime('now')),
  ('unit_ounce', 'ounce', datetime('now')),
  ('unit_kilogram', 'kilogram', datetime('now')),
  ('unit_jar', 'jar', datetime('now')),
  ('unit_can', 'can', datetime('now')),
  ('unit_package', 'package', datetime('now')),
  ('unit_half', 'half', datetime('now'));

-- ============================================================================
-- ENSURE ALL INGREDIENT REFS EXIST
-- ============================================================================
INSERT OR IGNORE INTO "IngredientRef" ("id", "name", "updatedAt") VALUES
  ('ir_jalapeno', 'jalapeno', datetime('now')),
  ('ir_chicken_thigh', 'chicken thigh', datetime('now')),
  ('ir_coconut_milk', 'coconut milk', datetime('now')),
  ('ir_fish_sauce', 'fish sauce', datetime('now')),
  ('ir_green_beans', 'green beans', datetime('now')),
  ('ir_zucchini', 'zucchini', datetime('now')),
  ('ir_mushroom', 'mushroom', datetime('now')),
  ('ir_shallot', 'shallot', datetime('now')),
  ('ir_chicken_broth', 'chicken broth', datetime('now')),
  ('ir_parmesan_cheese', 'parmesan cheese', datetime('now')),
  ('ir_butter', 'butter', datetime('now')),
  ('ir_lemon', 'lemon', datetime('now')),
  ('ir_salmon_fillet', 'salmon fillet', datetime('now')),
  ('ir_sugar', 'sugar', datetime('now')),
  ('ir_brown_sugar', 'brown sugar', datetime('now')),
  ('ir_vanilla_extract', 'vanilla extract', datetime('now')),
  ('ir_egg', 'egg', datetime('now')),
  ('ir_baking_soda', 'baking soda', datetime('now')),
  ('ir_bread', 'bread', datetime('now')),
  ('ir_asparagus', 'asparagus', datetime('now')),
  ('ir_parsley', 'parsley', datetime('now')),
  ('ir_paprika', 'paprika', datetime('now')),
  ('ir_cayenne_pepper', 'cayenne pepper', datetime('now')),
  ('ir_white_wine', 'white wine', datetime('now')),
  ('ir_thyme', 'thyme', datetime('now')),
  ('ir_carrot', 'carrot', datetime('now'));
-- ============================================================================
-- USERS
-- ============================================================================

INSERT INTO "User" ("id", "email", "username", "hashedPassword", "salt", "photoUrl", "createdAt", "updatedAt") VALUES
  ('user_demo', 'demo@spoonjoy.com', 'demo_chef', '$2b$10$OsXoQzgl8Hk47gxH.bZqVu/18ydWWtF8oJs.c8WjaqxgU1HoLrI4i', '$2b$10$OsXoQzgl8Hk47gxH.bZqVu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo', datetime('now'), datetime('now')),
  ('user_julia', 'chef.julia@example.com', 'chef_julia', '$2b$10$OsXoQzgl8Hk47gxH.bZqVu/18ydWWtF8oJs.c8WjaqxgU1HoLrI4i', '$2b$10$OsXoQzgl8Hk47gxH.bZqVu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=julia', datetime('now'), datetime('now')),
  ('user_marco', 'marco.rossi@example.com', 'marco_rossi', '$2b$10$OsXoQzgl8Hk47gxH.bZqVu/18ydWWtF8oJs.c8WjaqxgU1HoLrI4i', '$2b$10$OsXoQzgl8Hk47gxH.bZqVu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=marco', datetime('now'), datetime('now')),
  ('user_sarah', 'sarah.chen@example.com', 'sarah_chen', '$2b$10$OsXoQzgl8Hk47gxH.bZqVu/18ydWWtF8oJs.c8WjaqxgU1HoLrI4i', '$2b$10$OsXoQzgl8Hk47gxH.bZqVu', 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', datetime('now'), datetime('now'));

-- ============================================================================
-- RECIPES (with real Unsplash food photography)
-- ============================================================================

INSERT INTO "Recipe" ("id", "title", "description", "servings", "imageUrl", "chefId", "createdAt", "updatedAt") VALUES
  ('r_pizza', 'Classic Margherita Pizza', 'A traditional Italian pizza with fresh tomatoes, mozzarella, and basil. Simple ingredients, perfect execution.', '2 pizzas', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80', 'user_demo', datetime('now'), datetime('now')),
  ('r_stirfry', 'Chicken Stir-Fry with Vegetables', 'A quick and healthy weeknight dinner loaded with colorful vegetables and tender chicken in a savory sauce.', '4 servings', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80', 'user_julia', datetime('now'), datetime('now')),
  ('r_risotto', 'Creamy Mushroom Risotto', 'A luxurious Italian rice dish with earthy mushrooms, white wine, and plenty of parmesan cheese.', '4 servings', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=800&q=80', 'user_marco', datetime('now'), datetime('now')),
  ('r_guac', 'Fresh Guacamole', 'Classic Mexican avocado dip with lime, cilantro, and a kick of jalapeno.', '6 servings', 'https://images.unsplash.com/photo-1615870216519-2f9fa575fa5c?w=800&q=80', 'user_sarah', datetime('now'), datetime('now')),
  ('r_salmon', 'Pan-Seared Salmon with Lemon Butter', 'Restaurant-quality salmon with crispy skin and a bright, buttery sauce. Ready in 20 minutes.', '2 servings', 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80', 'user_demo', datetime('now'), datetime('now')),
  ('r_cookies', 'Chocolate Chip Cookies', 'Perfectly chewy cookies with crisp edges and gooey chocolate chips. A timeless classic.', '24 cookies', 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&q=80', 'user_julia', datetime('now'), datetime('now')),
  ('r_curry', 'Thai Green Curry', 'Aromatic coconut curry with tender chicken and vegetables. Restaurant-quality Thai food at home.', '4 servings', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80', 'user_marco', datetime('now'), datetime('now')),
  ('r_benedict', 'Eggs Benedict', 'Brunch classic with poached eggs, Canadian bacon, and silky hollandaise on an English muffin.', '4 servings', 'https://images.unsplash.com/photo-1608039829572-9b0ba489e6ea?w=800&q=80', 'user_sarah', datetime('now'), datetime('now'));

-- ============================================================================
-- RECIPE STEPS
-- ============================================================================

-- Pizza steps
INSERT INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
  ('s_pizza_1', 'r_pizza', 1, 'Make the dough', 'In a large bowl, combine flour, salt, and yeast. Add warm water and olive oil. Mix until a shaggy dough forms, then knead for 10 minutes until smooth and elastic. Let rise for 1 hour.', datetime('now')),
  ('s_pizza_2', 'r_pizza', 2, 'Prepare the sauce', 'Crush San Marzano tomatoes by hand. Add minced garlic, a drizzle of olive oil, salt, and fresh basil. Let sit for 30 minutes to develop flavor.', datetime('now')),
  ('s_pizza_3', 'r_pizza', 3, 'Shape and top', 'Punch down the dough and divide in half. Stretch each piece into a 12-inch circle. Spread sauce evenly, leaving a 1-inch border. Top with torn mozzarella.', datetime('now')),
  ('s_pizza_4', 'r_pizza', 4, 'Bake', 'Bake in a preheated 500°F oven for 10-12 minutes until the crust is golden and cheese is bubbling. Finish with fresh basil leaves and a drizzle of olive oil.', datetime('now'));

-- Stir-fry steps
INSERT INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
  ('s_stir_1', 'r_stirfry', 1, 'Make the sauce', 'Whisk together soy sauce, sesame oil, honey, ginger, and garlic. Set aside.', datetime('now')),
  ('s_stir_2', 'r_stirfry', 2, 'Prep the chicken', 'Cut chicken breast into bite-sized pieces. Season with salt and pepper.', datetime('now')),
  ('s_stir_3', 'r_stirfry', 3, 'Cook the chicken', 'Heat vegetable oil in a large wok over high heat. Add chicken and cook for 5-6 minutes until golden and cooked through. Remove and set aside.', datetime('now')),
  ('s_stir_4', 'r_stirfry', 4, 'Stir-fry vegetables', 'Add more oil to the wok. Stir-fry bell peppers, broccoli, and carrots for 3-4 minutes until crisp-tender.', datetime('now')),
  ('s_stir_5', 'r_stirfry', 5, 'Combine and serve', 'Return chicken to the wok. Pour sauce over everything and toss to coat. Cook for 2 minutes until sauce thickens. Serve over rice with scallions.', datetime('now'));

-- Risotto steps
INSERT INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
  ('s_ris_1', 'r_risotto', 1, 'Prep mushrooms', 'Clean and slice mushrooms. Set aside a few whole ones for garnish.', datetime('now')),
  ('s_ris_2', 'r_risotto', 2, 'Sauté aromatics', 'In a large pan, melt butter and sauté shallots until translucent. Add garlic and cook for 30 seconds until fragrant.', datetime('now')),
  ('s_ris_3', 'r_risotto', 3, 'Toast rice and deglaze', 'Add arborio rice and stir to coat with butter. Toast for 2 minutes. Pour in white wine and stir until absorbed.', datetime('now')),
  ('s_ris_4', 'r_risotto', 4, 'Add broth gradually', 'Add warm chicken broth one ladle at a time, stirring constantly and waiting for each addition to be absorbed before adding more. Continue for 18-20 minutes.', datetime('now')),
  ('s_ris_5', 'r_risotto', 5, 'Cook mushrooms', 'In a separate pan, sauté mushrooms in butter until golden and caramelized, about 8 minutes. Season with salt and thyme.', datetime('now')),
  ('s_ris_6', 'r_risotto', 6, 'Finish and serve', 'Fold mushrooms and parmesan into the risotto. Add butter for extra creaminess. Season to taste and serve immediately with fresh parsley.', datetime('now'));

-- Guacamole steps
INSERT INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
  ('s_guac_1', 'r_guac', 1, 'Prep ingredients', 'Dice onion, mince garlic, seed and mince jalapeno, and chop cilantro. Dice tomatoes.', datetime('now')),
  ('s_guac_2', 'r_guac', 2, 'Mash and mix', 'Cut avocados in half and remove pits. Scoop flesh into a bowl and mash to desired consistency. Add lime juice immediately to prevent browning.', datetime('now')),
  ('s_guac_3', 'r_guac', 3, 'Combine and season', 'Fold in the prepped ingredients. Season with salt and cumin. Taste and adjust seasoning. Serve with tortilla chips.', datetime('now'));

-- Salmon steps
INSERT INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
  ('s_sal_1', 'r_salmon', 1, 'Season salmon', 'Pat salmon fillets dry with paper towels. Season generously with salt, pepper, and paprika on both sides.', datetime('now')),
  ('s_sal_2', 'r_salmon', 2, 'Sear salmon', 'Heat olive oil in a cast iron skillet over high heat. Place salmon skin-side up and sear for 4 minutes until a golden crust forms. Flip and cook 3 more minutes. Remove and rest.', datetime('now')),
  ('s_sal_3', 'r_salmon', 3, 'Make lemon butter sauce', 'Reduce heat to medium. Add butter to the pan and let it foam. Add minced garlic and cook 30 seconds. Squeeze in lemon juice and swirl to combine.', datetime('now')),
  ('s_sal_4', 'r_salmon', 4, 'Plate and serve', 'Place salmon on plates. Spoon lemon butter sauce over each fillet. Garnish with fresh parsley and serve with asparagus or your favorite vegetable.', datetime('now'));

-- Cookies steps
INSERT INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
  ('s_cook_1', 'r_cookies', 1, 'Cream butter and sugars', 'In a large bowl, beat softened butter with white and brown sugar until light and fluffy, about 3 minutes. Add vanilla extract.', datetime('now')),
  ('s_cook_2', 'r_cookies', 2, 'Add eggs', 'Add eggs one at a time, beating well after each addition until fully incorporated.', datetime('now')),
  ('s_cook_3', 'r_cookies', 3, 'Mix dry ingredients', 'In a separate bowl, whisk together flour, baking soda, and salt.', datetime('now')),
  ('s_cook_4', 'r_cookies', 4, 'Combine and add chocolate', 'Gradually add dry ingredients to wet mixture, mixing until just combined. Fold in chocolate chips. Chill dough for 30 minutes.', datetime('now')),
  ('s_cook_5', 'r_cookies', 5, 'Bake', 'Scoop dough into 2-tablespoon balls onto lined baking sheets. Bake at 375°F for 10-12 minutes until edges are golden but centers look slightly underdone. Cool on pan for 5 minutes before transferring.', datetime('now'));

-- Thai curry steps
INSERT INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
  ('s_cur_1', 'r_curry', 1, 'Prep vegetables', 'Slice bell peppers into strips, cut zucchini into half-moons, and prepare green beans.', datetime('now')),
  ('s_cur_2', 'r_curry', 2, 'Bloom curry paste', 'Heat vegetable oil in a wok. Add green curry paste and cook for 1 minute until fragrant.', datetime('now')),
  ('s_cur_3', 'r_curry', 3, 'Add coconut milk and chicken', 'Pour in coconut milk and stir to combine. Add chicken thigh pieces and simmer for 10 minutes.', datetime('now')),
  ('s_cur_4', 'r_curry', 4, 'Add vegetables and season', 'Add prepared vegetables. Season with fish sauce and sugar. Simmer for 5 more minutes until vegetables are tender.', datetime('now')),
  ('s_cur_5', 'r_curry', 5, 'Finish and serve', 'Stir in Thai basil leaves. Serve over jasmine rice with lime wedges.', datetime('now'));

-- Eggs Benedict steps
INSERT INTO "RecipeStep" ("id", "recipeId", "stepNum", "stepTitle", "description", "updatedAt") VALUES
  ('s_ben_1', 'r_benedict', 1, 'Make hollandaise', 'Whisk egg yolks with lemon juice over a double boiler. Slowly drizzle in melted butter while whisking constantly. Season with salt and cayenne.', datetime('now')),
  ('s_ben_2', 'r_benedict', 2, 'Prepare base', 'Toast English muffin halves and warm Canadian bacon in a pan.', datetime('now')),
  ('s_ben_3', 'r_benedict', 3, 'Poach eggs', 'Bring water with a splash of vinegar to a gentle simmer. Create a vortex and slide eggs in one at a time. Cook for 3 minutes for runny yolks.', datetime('now')),
  ('s_ben_4', 'r_benedict', 4, 'Assemble', 'Place bacon on muffin halves. Top with poached egg and spoon hollandaise over. Garnish with chives and paprika.', datetime('now'));

-- ============================================================================
-- INGREDIENTS (linking steps to IngredientRef + Unit)
-- ============================================================================

-- Pizza ingredients
INSERT INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
  ('i_p1_1', 'r_pizza', 1, 500, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='flour'), datetime('now')),
  ('i_p1_2', 'r_pizza', 1, 1, (SELECT id FROM "Unit" WHERE name='teaspoon'), (SELECT id FROM "IngredientRef" WHERE name='salt'), datetime('now')),
  ('i_p1_3', 'r_pizza', 1, 2, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='olive oil'), datetime('now')),
  ('i_p2_1', 'r_pizza', 2, 400, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='tomato'), datetime('now')),
  ('i_p2_2', 'r_pizza', 2, 2, (SELECT id FROM "Unit" WHERE name='clove'), (SELECT id FROM "IngredientRef" WHERE name='garlic'), datetime('now')),
  ('i_p2_3', 'r_pizza', 2, 1, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='olive oil'), datetime('now')),
  ('i_p3_1', 'r_pizza', 3, 200, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='mozzarella cheese'), datetime('now'));

-- Stir-fry ingredients
INSERT INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
  ('i_sf1_1', 'r_stirfry', 1, 3, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='soy sauce'), datetime('now')),
  ('i_sf1_2', 'r_stirfry', 1, 1, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='sesame oil'), datetime('now')),
  ('i_sf1_3', 'r_stirfry', 1, 2, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='honey'), datetime('now')),
  ('i_sf2_1', 'r_stirfry', 2, 500, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='chicken breast'), datetime('now')),
  ('i_sf3_1', 'r_stirfry', 3, 2, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='vegetable oil'), datetime('now')),
  ('i_sf4_1', 'r_stirfry', 4, 2, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='bell pepper'), datetime('now')),
  ('i_sf4_2', 'r_stirfry', 4, 200, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='broccoli'), datetime('now')),
  ('i_sf4_3', 'r_stirfry', 4, 2, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='carrot'), datetime('now')),
  ('i_sf5_1', 'r_stirfry', 5, 300, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='rice'), datetime('now'));

-- Salmon ingredients
INSERT INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
  ('i_sa1_1', 'r_salmon', 1, 2, (SELECT id FROM "Unit" WHERE name='piece'), (SELECT id FROM "IngredientRef" WHERE name='salmon fillet'), datetime('now')),
  ('i_sa1_2', 'r_salmon', 1, 1, (SELECT id FROM "Unit" WHERE name='teaspoon'), (SELECT id FROM "IngredientRef" WHERE name='salt'), datetime('now')),
  ('i_sa2_1', 'r_salmon', 2, 2, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='olive oil'), datetime('now')),
  ('i_sa3_1', 'r_salmon', 3, 3, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='butter'), datetime('now')),
  ('i_sa3_2', 'r_salmon', 3, 2, (SELECT id FROM "Unit" WHERE name='clove'), (SELECT id FROM "IngredientRef" WHERE name='garlic'), datetime('now')),
  ('i_sa3_3', 'r_salmon', 3, 1, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='lemon'), datetime('now'));

-- Guacamole ingredients
INSERT INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
  ('i_g1_1', 'r_guac', 1, 0.5, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='onion'), datetime('now')),
  ('i_g1_2', 'r_guac', 1, 1, (SELECT id FROM "Unit" WHERE name='clove'), (SELECT id FROM "IngredientRef" WHERE name='garlic'), datetime('now')),
  ('i_g1_3', 'r_guac', 1, 1, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='jalapeno'), datetime('now')),
  ('i_g1_4', 'r_guac', 1, 1, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='tomato'), datetime('now')),
  ('i_g2_1', 'r_guac', 2, 3, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='avocado'), datetime('now')),
  ('i_g2_2', 'r_guac', 2, 2, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='lime'), datetime('now'));

-- Cookies ingredients
INSERT INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
  ('i_c1_1', 'r_cookies', 1, 225, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='butter'), datetime('now')),
  ('i_c1_2', 'r_cookies', 1, 100, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='sugar'), datetime('now')),
  ('i_c1_3', 'r_cookies', 1, 150, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='brown sugar'), datetime('now')),
  ('i_c1_4', 'r_cookies', 1, 2, (SELECT id FROM "Unit" WHERE name='teaspoon'), (SELECT id FROM "IngredientRef" WHERE name='vanilla extract'), datetime('now')),
  ('i_c2_1', 'r_cookies', 2, 2, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='egg'), datetime('now')),
  ('i_c3_1', 'r_cookies', 3, 280, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='flour'), datetime('now')),
  ('i_c3_2', 'r_cookies', 3, 1, (SELECT id FROM "Unit" WHERE name='teaspoon'), (SELECT id FROM "IngredientRef" WHERE name='baking soda'), datetime('now')),
  ('i_c3_3', 'r_cookies', 3, 1, (SELECT id FROM "Unit" WHERE name='teaspoon'), (SELECT id FROM "IngredientRef" WHERE name='salt'), datetime('now'));

-- Risotto ingredients
INSERT INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
  ('i_r1_1', 'r_risotto', 1, 400, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='mushroom'), datetime('now')),
  ('i_r2_1', 'r_risotto', 2, 3, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='butter'), datetime('now')),
  ('i_r2_2', 'r_risotto', 2, 2, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='shallot'), datetime('now')),
  ('i_r2_3', 'r_risotto', 2, 2, (SELECT id FROM "Unit" WHERE name='clove'), (SELECT id FROM "IngredientRef" WHERE name='garlic'), datetime('now')),
  ('i_r3_1', 'r_risotto', 3, 300, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='rice'), datetime('now')),
  ('i_r4_1', 'r_risotto', 4, 1, (SELECT id FROM "Unit" WHERE name='liter'), (SELECT id FROM "IngredientRef" WHERE name='chicken broth'), datetime('now')),
  ('i_r5_1', 'r_risotto', 5, 2, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='butter'), datetime('now')),
  ('i_r6_1', 'r_risotto', 6, 100, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='parmesan cheese'), datetime('now'));

-- Thai curry ingredients
INSERT INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
  ('i_tc1_1', 'r_curry', 1, 2, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='bell pepper'), datetime('now')),
  ('i_tc1_2', 'r_curry', 1, 1, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='zucchini'), datetime('now')),
  ('i_tc1_3', 'r_curry', 1, 100, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='green beans'), datetime('now')),
  ('i_tc2_1', 'r_curry', 2, 2, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='vegetable oil'), datetime('now')),
  ('i_tc3_1', 'r_curry', 3, 400, (SELECT id FROM "Unit" WHERE name='milliliter'), (SELECT id FROM "IngredientRef" WHERE name='coconut milk'), datetime('now')),
  ('i_tc3_2', 'r_curry', 3, 500, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='chicken thigh'), datetime('now')),
  ('i_tc4_1', 'r_curry', 4, 2, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='fish sauce'), datetime('now')),
  ('i_tc5_1', 'r_curry', 5, 300, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='rice'), datetime('now'));

-- Eggs Benedict ingredients
INSERT INTO "Ingredient" ("id", "recipeId", "stepNum", "quantity", "unitId", "ingredientRefId", "updatedAt") VALUES
  ('i_eb1_1', 'r_benedict', 1, 3, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='egg'), datetime('now')),
  ('i_eb1_2', 'r_benedict', 1, 1, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='lemon'), datetime('now')),
  ('i_eb1_3', 'r_benedict', 1, 170, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='butter'), datetime('now')),
  ('i_eb2_1', 'r_benedict', 2, 4, (SELECT id FROM "Unit" WHERE name='slice'), (SELECT id FROM "IngredientRef" WHERE name='bread'), datetime('now')),
  ('i_eb3_1', 'r_benedict', 3, 4, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='egg'), datetime('now'));

-- ============================================================================
-- STEP OUTPUT USES
-- ============================================================================

INSERT INTO "StepOutputUse" ("id", "recipeId", "outputStepNum", "inputStepNum", "updatedAt") VALUES
  ('sou_p1', 'r_pizza', 1, 3, datetime('now')),
  ('sou_p2', 'r_pizza', 2, 3, datetime('now')),
  ('sou_p3', 'r_pizza', 3, 4, datetime('now')),
  ('sou_sf1', 'r_stirfry', 2, 3, datetime('now')),
  ('sou_sf2', 'r_stirfry', 1, 5, datetime('now')),
  ('sou_sf3', 'r_stirfry', 3, 5, datetime('now')),
  ('sou_sf4', 'r_stirfry', 4, 5, datetime('now')),
  ('sou_r1', 'r_risotto', 2, 3, datetime('now')),
  ('sou_r2', 'r_risotto', 3, 4, datetime('now')),
  ('sou_r3', 'r_risotto', 1, 5, datetime('now')),
  ('sou_r4', 'r_risotto', 4, 6, datetime('now')),
  ('sou_r5', 'r_risotto', 5, 6, datetime('now')),
  ('sou_g1', 'r_guac', 1, 3, datetime('now')),
  ('sou_g2', 'r_guac', 2, 3, datetime('now')),
  ('sou_sa1', 'r_salmon', 1, 2, datetime('now')),
  ('sou_sa2', 'r_salmon', 2, 4, datetime('now')),
  ('sou_sa3', 'r_salmon', 3, 4, datetime('now')),
  ('sou_c1', 'r_cookies', 1, 2, datetime('now')),
  ('sou_c2', 'r_cookies', 2, 4, datetime('now')),
  ('sou_c3', 'r_cookies', 3, 4, datetime('now')),
  ('sou_c4', 'r_cookies', 4, 5, datetime('now')),
  ('sou_tc1', 'r_curry', 2, 3, datetime('now')),
  ('sou_tc2', 'r_curry', 1, 4, datetime('now')),
  ('sou_tc3', 'r_curry', 3, 4, datetime('now')),
  ('sou_tc4', 'r_curry', 4, 5, datetime('now')),
  ('sou_eb1', 'r_benedict', 1, 4, datetime('now')),
  ('sou_eb2', 'r_benedict', 2, 4, datetime('now')),
  ('sou_eb3', 'r_benedict', 3, 4, datetime('now'));

-- ============================================================================
-- COOKBOOKS
-- ============================================================================

INSERT INTO "Cookbook" ("id", "title", "authorId", "createdAt", "updatedAt") VALUES
  ('cb_italian', 'Italian Favorites', 'user_demo', datetime('now'), datetime('now')),
  ('cb_weeknight', 'Quick Weeknight Dinners', 'user_julia', datetime('now'), datetime('now')),
  ('cb_asian', 'Asian Cuisine', 'user_marco', datetime('now'), datetime('now')),
  ('cb_brunch', 'Brunch Classics', 'user_sarah', datetime('now'), datetime('now')),
  ('cb_sweets', 'Sweet Treats', 'user_julia', datetime('now'), datetime('now')),
  ('cb_party', 'Party Appetizers', 'user_demo', datetime('now'), datetime('now'));

INSERT INTO "RecipeInCookbook" ("id", "cookbookId", "recipeId", "addedById", "createdAt", "updatedAt") VALUES
  ('ric_1', 'cb_italian', 'r_pizza', 'user_demo', datetime('now'), datetime('now')),
  ('ric_2', 'cb_italian', 'r_risotto', 'user_demo', datetime('now'), datetime('now')),
  ('ric_3', 'cb_weeknight', 'r_stirfry', 'user_julia', datetime('now'), datetime('now')),
  ('ric_4', 'cb_weeknight', 'r_salmon', 'user_julia', datetime('now'), datetime('now')),
  ('ric_5', 'cb_asian', 'r_stirfry', 'user_marco', datetime('now'), datetime('now')),
  ('ric_6', 'cb_asian', 'r_curry', 'user_marco', datetime('now'), datetime('now')),
  ('ric_7', 'cb_brunch', 'r_benedict', 'user_sarah', datetime('now'), datetime('now')),
  ('ric_8', 'cb_sweets', 'r_cookies', 'user_julia', datetime('now'), datetime('now')),
  ('ric_9', 'cb_party', 'r_guac', 'user_demo', datetime('now'), datetime('now'));

-- ============================================================================
-- SHOPPING LISTS
-- ============================================================================

INSERT INTO "ShoppingList" ("id", "authorId", "createdAt", "updatedAt") VALUES
  ('sl_demo', 'user_demo', datetime('now'), datetime('now'));

INSERT INTO "ShoppingListItem" ("id", "shoppingListId", "quantity", "unitId", "ingredientRefId", "checked", "checkedAt", "sortIndex", "updatedAt") VALUES
  ('sli_1', 'sl_demo', 500, (SELECT id FROM "Unit" WHERE name='gram'), (SELECT id FROM "IngredientRef" WHERE name='chicken breast'), 0, NULL, 0, datetime('now')),
  ('sli_2', 'sl_demo', 1, (SELECT id FROM "Unit" WHERE name='bunch'), (SELECT id FROM "IngredientRef" WHERE name='broccoli'), 0, NULL, 1, datetime('now')),
  ('sli_3', 'sl_demo', 3, (SELECT id FROM "Unit" WHERE name='tablespoon'), (SELECT id FROM "IngredientRef" WHERE name='soy sauce'), 0, NULL, 2, datetime('now')),
  ('sli_4', 'sl_demo', 2, (SELECT id FROM "Unit" WHERE name='whole'), (SELECT id FROM "IngredientRef" WHERE name='lemon'), 1, datetime('now'), 3, datetime('now'));
