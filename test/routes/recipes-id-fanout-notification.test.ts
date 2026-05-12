import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { faker } from "@faker-js/faker";
import { db } from "~/lib/db.server";
import { handleRecipeDetailAction } from "~/lib/recipe-detail.server";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";

function uniqueEmail(prefix = "n") {
  return `${prefix}-${faker.string.alphanumeric(8).toLowerCase()}@example.com`;
}

async function sessionCookie(userId: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  const setCookie = await sessionStorage.commitSession(session);
  return setCookie.split(";")[0];
}

const VAPID_ENV = {
  VAPID_PUBLIC_KEY: "pub",
  VAPID_PRIVATE_KEY: "priv",
  VAPID_SUBJECT: "mailto:test@example.com",
};

describe("recipes.$id action — fellow_chef_origin_cook fan-out wiring (route)", () => {
  let spoonerId: string;
  let fellowAId: string;
  let fellowBId: string;
  let spoonerRecipeId: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const spooner = await createUser(
      db,
      uniqueEmail("sp"),
      `sp_${faker.string.alphanumeric(8).toLowerCase()}`,
      "testPassword123",
    );
    const fellowA = await createUser(
      db,
      uniqueEmail("fa"),
      `fa_${faker.string.alphanumeric(8).toLowerCase()}`,
      "testPassword123",
    );
    const fellowB = await createUser(
      db,
      uniqueEmail("fb"),
      `fb_${faker.string.alphanumeric(8).toLowerCase()}`,
      "testPassword123",
    );
    spoonerId = spooner.id;
    fellowAId = fellowA.id;
    fellowBId = fellowB.id;

    // Spooner has previously engaged with fellowA + fellowB recipes (spoons on their work)
    const fellowARecipe = await db.recipe.create({
      data: { title: "A-Recipe", chefId: fellowAId },
    });
    const fellowBRecipe = await db.recipe.create({
      data: { title: "B-Recipe", chefId: fellowBId },
    });
    await db.recipeSpoon.create({
      data: { chefId: spoonerId, recipeId: fellowARecipe.id, note: "old1" },
    });
    await db.recipeSpoon.create({
      data: { chefId: spoonerId, recipeId: fellowBRecipe.id, note: "old2" },
    });

    // Spooner's own new recipe — origin cook target.
    const spoonerRecipe = await db.recipe.create({
      data: { title: "Spooner Origin", chefId: spoonerId },
    });
    spoonerRecipeId = spoonerRecipe.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it("fans out fellow_chef_origin_cook to each fellow chef when an origin-cook spoon is created", async () => {
    const cookie = await sessionCookie(spoonerId);
    const fd = new UndiciFormData();
    fd.append("intent", "createSpoon");
    // Use a photoUrl-style payload via just photoUrl — actually photo file is required for origin cook.
    // We need a photo to satisfy the origin-cook constraint. Use a tiny stub File.
    const photo = new Blob([Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])], {
      type: "image/jpeg",
    });
    fd.append("photo", photo, "spoon.jpg");

    const captured: Promise<unknown>[] = [];
    await handleRecipeDetailAction({
      request: new UndiciRequest(`http://localhost/recipes/${spoonerRecipeId}`, {
        method: "POST",
        headers: { cookie },
        body: fd,
      }) as unknown as Request,
      params: { id: spoonerRecipeId },
      context: {
        cloudflare: {
          env: VAPID_ENV,
          ctx: { waitUntil: (p: Promise<unknown>) => captured.push(p) } as any,
        },
      } as any,
    });
    await Promise.all(captured);

    const events = await db.notificationEvent.findMany({
      where: { kind: "fellow_chef_origin_cook" },
    });
    expect(events).toHaveLength(2);
    const recipients = new Set(events.map((e) => e.recipientId));
    expect(recipients.has(fellowAId)).toBe(true);
    expect(recipients.has(fellowBId)).toBe(true);
  });

  it("does NOT fan out when the spoon is not an origin cook (no fellow notifications)", async () => {
    // Pre-seed a non-deleted spoon so this isn't an origin cook for spooner.
    await db.recipeSpoon.create({
      data: { chefId: spoonerId, recipeId: spoonerRecipeId, note: "seeded" },
    });

    const cookie = await sessionCookie(spoonerId);
    const fd = new UndiciFormData();
    fd.append("intent", "createSpoon");
    fd.append("note", "non-origin cook");

    const captured: Promise<unknown>[] = [];
    await handleRecipeDetailAction({
      request: new UndiciRequest(`http://localhost/recipes/${spoonerRecipeId}`, {
        method: "POST",
        headers: { cookie },
        body: fd,
      }) as unknown as Request,
      params: { id: spoonerRecipeId },
      context: {
        cloudflare: {
          env: VAPID_ENV,
          ctx: { waitUntil: (p: Promise<unknown>) => captured.push(p) } as any,
        },
      } as any,
    });
    await Promise.all(captured);

    const events = await db.notificationEvent.findMany({
      where: { kind: "fellow_chef_origin_cook" },
    });
    expect(events).toHaveLength(0);
  });
});
