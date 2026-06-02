import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { faker } from "@faker-js/faker";
import { Request as UndiciRequest } from "undici";
import { action } from "~/routes/api.v1.$";
import { createApiCredential } from "~/lib/api-auth.server";
import { getLocalDb } from "~/lib/db.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { createTestUser } from "../utils";

function routeArgs(request: Request, splat: string) {
  return { request, params: { "*": splat }, context: { cloudflare: { env: null } } } as any;
}

function mutationRequest(method: "POST" | "PATCH" | "DELETE", path: string, token: string, requestId: string, body: unknown) {
  return new UndiciRequest(`http://localhost/api/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    },
    body: JSON.stringify(body),
  }) as unknown as Request;
}

async function readJson(response: Response) {
  return await response.json() as any;
}

function expectEnvelopeHeaders(response: Response, requestId: string) {
  expect(response.headers.get("Content-Type")).toContain("application/json");
  expect(response.headers.get("X-Request-Id")).toBe(requestId);
  expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
  expect(response.headers.get("Access-Control-Allow-Headers")).toBe("Authorization, Content-Type, X-Request-Id");
  expect(response.headers.get("Access-Control-Allow-Methods")).toBe("GET, POST, PATCH, DELETE, OPTIONS");
  expect(response.headers.get("Access-Control-Expose-Headers")).toBe("X-Request-Id");
}

function expectSuccess(payload: any, requestId: string) {
  expect(payload).toMatchObject({ ok: true, requestId });
}

function expectMutation(payload: any, clientMutationId: string) {
  expect(payload.data.mutation).toEqual({ clientMutationId, replayed: false });
}

async function createFixture(db: Awaited<ReturnType<typeof getLocalDb>>) {
  const user = await db.user.create({ data: createTestUser() });
  const credential = await createApiCredential(db, user.id, "Shopping conflict writer", { scopes: ["shopping_list:write"] });
  const list = await db.shoppingList.create({ data: { authorId: user.id } });
  return { user, credential, list };
}

async function addItem(token: string, name = `Conflict Eggs ${faker.string.alphanumeric(6)}`) {
  const response = await action(routeArgs(
    mutationRequest("POST", "shopping-list/items", token, "req_conflict_add", {
      clientMutationId: `add-${faker.string.alphanumeric(8)}`,
      name,
      quantity: 1,
    }),
    "shopping-list/items",
  ));
  const payload = await readJson(response);
  expect(response.status).toBe(201);
  expectSuccess(payload, "req_conflict_add");
  return payload.data.item;
}

describe("API v1 shopping-list conflict and error semantics", () => {
  let db: Awaited<ReturnType<typeof getLocalDb>>;

  beforeEach(async () => {
    await cleanupDatabase();
    db = await getLocalDb();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it("uses server write order for check/delete conflicts and ignores client timestamps", async () => {
    const fixture = await createFixture(db);
    const item = await addItem(fixture.credential.token);

    const checked = await action(routeArgs(
      mutationRequest("PATCH", `shopping-list/items/${item.id}`, fixture.credential.token, "req_conflict_check", {
        clientMutationId: "conflict-check",
        checked: true,
        updatedAt: "1900-01-01T00:00:00.000Z",
        checkedAt: "1900-01-01T00:00:00.000Z",
      }),
      `shopping-list/items/${item.id}`,
    ));
    const checkedPayload = await readJson(checked);

    expect(checked.status).toBe(200);
    expectEnvelopeHeaders(checked, "req_conflict_check");
    expectSuccess(checkedPayload, "req_conflict_check");
    expect(checkedPayload.data.item).toMatchObject({
      id: item.id,
      checked: true,
      checkedAt: expect.any(String),
      deletedAt: null,
    });
    expect(checkedPayload.data.item.checkedAt).not.toBe("1900-01-01T00:00:00.000Z");
    expectMutation(checkedPayload, "conflict-check");

    const removed = await action(routeArgs(
      mutationRequest("DELETE", `shopping-list/items/${item.id}`, fixture.credential.token, "req_conflict_remove", {
        clientMutationId: "conflict-remove",
        updatedAt: "1900-01-01T00:00:00.000Z",
        deletedAt: "1900-01-01T00:00:00.000Z",
      }),
      `shopping-list/items/${item.id}`,
    ));
    const removedPayload = await readJson(removed);

    expect(removed.status).toBe(200);
    expectEnvelopeHeaders(removed, "req_conflict_remove");
    expectSuccess(removedPayload, "req_conflict_remove");
    expect(removedPayload.data).toMatchObject({
      removed: true,
      item: { id: item.id, checked: true, deletedAt: expect.any(String) },
      shoppingList: { items: [] },
    });
    expect(removedPayload.data.item.deletedAt).not.toBe("1900-01-01T00:00:00.000Z");
    expectMutation(removedPayload, "conflict-remove");

    const restored = await action(routeArgs(
      mutationRequest("PATCH", `shopping-list/items/${item.id}`, fixture.credential.token, "req_conflict_restore", {
        clientMutationId: "conflict-restore",
        checked: false,
        updatedAt: "1900-01-01T00:00:00.000Z",
        checkedAt: "1900-01-01T00:00:00.000Z",
        deletedAt: "1900-01-01T00:00:00.000Z",
      }),
      `shopping-list/items/${item.id}`,
    ));
    const restoredPayload = await readJson(restored);

    expect(restored.status).toBe(200);
    expectEnvelopeHeaders(restored, "req_conflict_restore");
    expectSuccess(restoredPayload, "req_conflict_restore");
    expect(restoredPayload.data.item).toMatchObject({
      id: item.id,
      checked: false,
      checkedAt: null,
      deletedAt: null,
    });
    expect(restoredPayload.data.shoppingList.items.map((active: { id: string }) => active.id)).toContain(item.id);
    expectMutation(restoredPayload, "conflict-restore");
  });

  it("returns machine-readable missing item and malformed JSON errors", async () => {
    const fixture = await createFixture(db);
    const missingId = `missing-${faker.string.alphanumeric(8)}`;

    const missingPatch = await action(routeArgs(
      mutationRequest("PATCH", `shopping-list/items/${missingId}`, fixture.credential.token, "req_conflict_missing_patch", {
        clientMutationId: "conflict-missing-patch",
        checked: true,
      }),
      `shopping-list/items/${missingId}`,
    ));
    const missingPatchPayload = await readJson(missingPatch);

    expect(missingPatch.status).toBe(404);
    expectEnvelopeHeaders(missingPatch, "req_conflict_missing_patch");
    expect(missingPatchPayload).toMatchObject({
      ok: false,
      requestId: "req_conflict_missing_patch",
      error: {
        code: "not_found",
        status: 404,
        details: { resource: "shopping_list_item", itemId: missingId },
      },
    });

    const invalidDelete = await action(routeArgs(
      mutationRequest("DELETE", "shopping-list/items/not-a-real-item", fixture.credential.token, "req_conflict_invalid_delete", {
        clientMutationId: "conflict-invalid-delete",
      }),
      "shopping-list/items/not-a-real-item",
    ));
    const invalidDeletePayload = await readJson(invalidDelete);

    expect(invalidDelete.status).toBe(404);
    expectEnvelopeHeaders(invalidDelete, "req_conflict_invalid_delete");
    expect(invalidDeletePayload).toMatchObject({
      ok: false,
      requestId: "req_conflict_invalid_delete",
      error: {
        code: "not_found",
        status: 404,
        details: { resource: "shopping_list_item", itemId: "not-a-real-item" },
      },
    });

    const malformed = await action(routeArgs(new UndiciRequest("http://localhost/api/v1/shopping-list/items", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${fixture.credential.token}`,
        "Content-Type": "application/json",
        "X-Request-Id": "req_conflict_malformed_json",
      },
      body: "{\"clientMutationId\":",
    }) as unknown as Request, "shopping-list/items"));

    expect(malformed.status).toBe(400);
    expectEnvelopeHeaders(malformed, "req_conflict_malformed_json");
    await expect(readJson(malformed)).resolves.toMatchObject({
      ok: false,
      requestId: "req_conflict_malformed_json",
      error: { code: "invalid_json", status: 400 },
    });
  });
});
