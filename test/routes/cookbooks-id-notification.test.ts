import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { faker } from "@faker-js/faker";
import { db } from "~/lib/db.server";
import { action } from "~/routes/cookbooks.$id";
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

async function postAddRecipe(
  cookbookId: string,
  recipeId: string,
  cookie: string,
  ctxOverrides?: {
    env?: unknown;
    waitUntil?: (p: Promise<unknown>) => void;
  },
) {
  const fd = new UndiciFormData();
  fd.append("intent", "addRecipe");
  fd.append("recipeId", recipeId);
  const ctx: any = {
    cloudflare: {
      env: ctxOverrides?.env === undefined ? VAPID_ENV : ctxOverrides.env,
    },
  };
  if (ctxOverrides?.waitUntil) {
    ctx.cloudflare.ctx = { waitUntil: ctxOverrides.waitUntil };
  }
  return action({
    request: new UndiciRequest(`http://localhost/cookbooks/${cookbookId}`, {
      method: "POST",
      headers: { cookie },
      body: fd,
    }) as unknown as Request,
    params: { id: cookbookId },
    context: ctx,
  } as any);
}

describe("cookbooks.$id action — cookbook_save_of_mine trigger wiring", () => {
  let ownerId: string;
  let saverId: string;
  let recipeId: string;
  let cookbookId: string;

  beforeEach(async () => {
    await cleanupDatabase();
    const owner = await createUser(
      db,
      uniqueEmail("owner"),
      `owner_${faker.string.alphanumeric(8).toLowerCase()}`,
      "testPassword123",
    );
    const saver = await createUser(
      db,
      uniqueEmail("saver"),
      `saver_${faker.string.alphanumeric(8).toLowerCase()}`,
      "testPassword123",
    );
    ownerId = owner.id;
    saverId = saver.id;
    const recipe = await db.recipe.create({
      data: { title: "Stew", chefId: ownerId },
    });
    recipeId = recipe.id;
    const cookbook = await db.cookbook.create({
      data: { title: `Cookbook ${faker.string.alphanumeric(6)}`, authorId: saverId },
    });
    cookbookId = cookbook.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it("writes a NotificationEvent for the recipe owner when another user saves to their cookbook", async () => {
    const cookie = await sessionCookie(saverId);
    const captured: Promise<unknown>[] = [];

    await postAddRecipe(cookbookId, recipeId, cookie, {
      waitUntil: (p) => captured.push(p),
    });

    await Promise.all(captured);

    const events = await db.notificationEvent.findMany({
      where: { recipientId: ownerId, kind: "cookbook_save_of_mine" },
    });
    expect(events).toHaveLength(1);
    const payload = JSON.parse(events[0].payload);
    expect(payload.recipeId).toBe(recipeId);
    expect(payload.recipeTitle).toBe("Stew");
    expect(payload.actorUsername).toBeDefined();
  });

  it("does NOT enqueue when the actor IS the recipe owner", async () => {
    // owner saves their own recipe to their own cookbook
    const cookbook = await db.cookbook.create({
      data: { title: `Owner Cookbook ${faker.string.alphanumeric(6)}`, authorId: ownerId },
    });
    const cookie = await sessionCookie(ownerId);
    const captured: Promise<unknown>[] = [];

    await postAddRecipe(cookbook.id, recipeId, cookie, {
      waitUntil: (p) => captured.push(p),
    });

    await Promise.all(captured);

    const events = await db.notificationEvent.count();
    expect(events).toBe(0);
  });

  it("does NOT enqueue a second notification on idempotent re-add (P2002)", async () => {
    const cookie = await sessionCookie(saverId);
    const captured: Promise<unknown>[] = [];

    await postAddRecipe(cookbookId, recipeId, cookie, {
      waitUntil: (p) => captured.push(p),
    });
    await postAddRecipe(cookbookId, recipeId, cookie, {
      waitUntil: (p) => captured.push(p),
    });

    await Promise.all(captured);

    const events = await db.notificationEvent.count({
      where: { recipientId: ownerId, kind: "cookbook_save_of_mine" },
    });
    expect(events).toBe(1);
  });

  it("awaits the notification task inline when no waitUntil is provided", async () => {
    const cookie = await sessionCookie(saverId);

    await postAddRecipe(cookbookId, recipeId, cookie);

    const events = await db.notificationEvent.findMany({
      where: { recipientId: ownerId },
    });
    expect(events).toHaveLength(1);
  });

  it("does not break the response when VAPID env is missing", async () => {
    const cookie = await sessionCookie(saverId);
    const captured: Promise<unknown>[] = [];

    const response = await postAddRecipe(cookbookId, recipeId, cookie, {
      env: null,
      waitUntil: (p) => captured.push(p),
    });

    await Promise.all(captured);

    // The action's data response shape: { success: true }
    const data = (response as { data?: unknown })?.data ?? response;
    expect(data).toMatchObject({ success: true });
    const events = await db.notificationEvent.count();
    expect(events).toBe(0);
  });
});
