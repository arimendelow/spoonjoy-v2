import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Request as UndiciRequest } from "undici";
import { faker } from "@faker-js/faker";
import { db } from "~/lib/db.server";
import { action } from "~/routes/recipes.$id.fork";
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

describe("recipes.$id.fork action — fork_of_my_recipe trigger wiring", () => {
  let ownerId: string;
  let forkerId: string;
  let recipeId: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const owner = await createUser(
      db,
      uniqueEmail("owner"),
      `owner_${faker.string.alphanumeric(8).toLowerCase()}`,
      "testPassword123",
    );
    const forker = await createUser(
      db,
      uniqueEmail("forker"),
      `forker_${faker.string.alphanumeric(8).toLowerCase()}`,
      "testPassword123",
    );
    ownerId = owner.id;
    forkerId = forker.id;
    const recipe = await db.recipe.create({
      data: { title: "Bread", chefId: ownerId },
    });
    recipeId = recipe.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it("writes a NotificationEvent for the source-chef when another user forks the recipe", async () => {
    const cookie = await sessionCookie(forkerId);
    const captured: Promise<unknown>[] = [];

    await action({
      request: new UndiciRequest(`http://localhost/recipes/${recipeId}/fork`, {
        method: "POST",
        headers: { cookie },
      }) as unknown as Request,
      params: { id: recipeId },
      context: {
        cloudflare: {
          env: VAPID_ENV,
          ctx: { waitUntil: (p: Promise<unknown>) => captured.push(p) } as any,
        },
      } as any,
    }).catch((err) => {
      // forkRecipe action throws a redirect Response on success
      if (!(err instanceof Response)) throw err;
    });

    await Promise.all(captured);

    const events = await db.notificationEvent.findMany({
      where: { recipientId: ownerId, kind: "fork_of_my_recipe" },
    });
    expect(events).toHaveLength(1);
    const payload = JSON.parse(events[0].payload);
    expect(payload.sourceRecipeId).toBe(recipeId);
    expect(payload.recipeTitle).toBe("Bread");
    expect(payload.forkerUsername).toBeDefined();
  });

  it("does NOT enqueue on self-fork by the source-chef", async () => {
    const cookie = await sessionCookie(ownerId);
    const captured: Promise<unknown>[] = [];

    const response = await action({
      request: new UndiciRequest(`http://localhost/recipes/${recipeId}/fork`, {
        method: "POST",
        headers: { cookie },
      }) as unknown as Request,
      params: { id: recipeId },
      context: {
        cloudflare: {
          env: VAPID_ENV,
          ctx: { waitUntil: (p: Promise<unknown>) => captured.push(p) } as any,
        },
      } as any,
    });

    // Action returns redirect Response on success.
    expect(response).toBeInstanceOf(Response);

    await Promise.all(captured);

    const events = await db.notificationEvent.count();
    expect(events).toBe(0);
  });

  it("awaits the notification task inline when no waitUntil is provided", async () => {
    const cookie = await sessionCookie(forkerId);

    await action({
      request: new UndiciRequest(`http://localhost/recipes/${recipeId}/fork`, {
        method: "POST",
        headers: { cookie },
      }) as unknown as Request,
      params: { id: recipeId },
      context: {
        cloudflare: { env: VAPID_ENV },
      } as any,
    });

    const events = await db.notificationEvent.findMany({
      where: { recipientId: ownerId },
    });
    expect(events).toHaveLength(1);
  });

  it("does not break the fork response when VAPID env is missing", async () => {
    const cookie = await sessionCookie(forkerId);
    const captured: Promise<unknown>[] = [];

    const response = await action({
      request: new UndiciRequest(`http://localhost/recipes/${recipeId}/fork`, {
        method: "POST",
        headers: { cookie },
      }) as unknown as Request,
      params: { id: recipeId },
      context: {
        cloudflare: {
          env: null,
          ctx: { waitUntil: (p: Promise<unknown>) => captured.push(p) } as any,
        },
      } as any,
    });

    await Promise.all(captured);

    // The fork action returns a redirect Response on success.
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(302);

    // No notification event written when VAPID is missing.
    const events = await db.notificationEvent.count();
    expect(events).toBe(0);
  });
});
