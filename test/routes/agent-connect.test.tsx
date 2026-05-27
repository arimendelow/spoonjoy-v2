import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData } from "undici";
import { cleanup as cleanupDom, render, screen } from "@testing-library/react";
import { faker } from "@faker-js/faker";
import AgentConnect, { action, loader } from "~/routes/agent.connect.$requestId";
import { startAgentConnection } from "~/lib/agent-connection.server";
import { getLocalDb } from "~/lib/db.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { createTestRoutesStub } from "../utils";

function routeArgs(request: Request, requestId: string) {
  return {
    request,
    params: { requestId },
    context: { cloudflare: { env: null } },
  } as any;
}

async function sessionCookie(userId: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return (await sessionStorage.commitSession(session)).split(";")[0];
}

function formRequest(url: string, intent: string, cookie?: string) {
  const formData = new UndiciFormData();
  formData.set("intent", intent);
  const headers = new Headers();
  if (cookie) headers.set("Cookie", cookie);
  return new UndiciRequest(url, { method: "POST", body: formData, headers });
}

function renderWithData(data: unknown) {
  const Stub = createTestRoutesStub([
    {
      path: "/",
      Component: AgentConnect,
      loader: () => data,
    },
  ]);
  render(<Stub initialEntries={["/"]} />);
}

describe("agent connect route", () => {
  let db: Awaited<ReturnType<typeof getLocalDb>>;
  let userId: string;
  let userEmail: string;
  const activeNow = new Date("2099-05-26T12:00:00Z");

  beforeEach(async () => {
    await cleanupDatabase();
    db = await getLocalDb();
    userEmail = `${faker.string.alphanumeric(8).toLowerCase()}@example.com`;
    const user = await db.user.create({
      data: { email: userEmail, username: faker.internet.username() },
    });
    userId = user.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it("redirects pending unauthenticated approvals to login with the connection URL preserved", async () => {
    const started = await startAgentConnection(db, { now: activeNow });
    const request = new UndiciRequest(`http://localhost/agent/connect/${started.request.id}?code=${started.request.userCode}`);

    await expect(loader(routeArgs(request, started.request.id))).rejects.toSatisfy((response: Response) => {
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(
        `/login?redirectTo=${encodeURIComponent(`/agent/connect/${started.request.id}?code=${started.request.userCode}`)}`,
      );
      return true;
    });
  });

  it("loads a pending connection for the signed-in approver and returns missing links safely", async () => {
    const started = await startAgentConnection(db, {
      agentName: "slugger",
      now: activeNow,
    });
    const cookie = await sessionCookie(userId);
    const request = new UndiciRequest(`http://localhost/agent/connect/${started.request.id}`, {
      headers: { Cookie: cookie },
    });

    await expect(loader(routeArgs(request, started.request.id))).resolves.toMatchObject({
      status: "pending",
      agentName: "slugger",
      userCode: started.request.userCode,
      userEmail,
    });

    await expect(loader(routeArgs(new UndiciRequest("http://localhost/agent/connect/missing"), "missing")))
      .resolves.toMatchObject({ status: "missing", userCode: null, userEmail: null, expiresAt: null });
  });

  it("lets unauthenticated users view already-finished connection links without loading a user", async () => {
    const started = await startAgentConnection(db, {
      agentName: "slugger",
      now: activeNow,
    });
    await db.agentConnectionRequest.update({
      where: { id: started.request.id },
      data: { status: "denied", deniedAt: activeNow },
    });

    await expect(loader(routeArgs(
      new UndiciRequest(`http://localhost/agent/connect/${started.request.id}`),
      started.request.id,
    ))).resolves.toMatchObject({
      status: "denied",
      agentName: "slugger",
      userCode: started.request.userCode,
      userEmail: null,
    });
  });

  it("approves, denies, rejects bad intents, and redirects unauthenticated actions", async () => {
    const approveTarget = await startAgentConnection(db, { now: activeNow });
    const denyTarget = await startAgentConnection(db, { now: activeNow });
    const cookie = await sessionCookie(userId);

    await expect(action(routeArgs(
      formRequest(`http://localhost/agent/connect/${approveTarget.request.id}`, "approve", cookie),
      approveTarget.request.id,
    ))).rejects.toSatisfy((response: Response) => {
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(`/agent/connect/${approveTarget.request.id}`);
      return true;
    });
    await expect(db.agentConnectionRequest.findUnique({ where: { id: approveTarget.request.id } }))
      .resolves.toMatchObject({ status: "approved", approvedById: userId });

    await expect(action(routeArgs(
      formRequest(`http://localhost/agent/connect/${denyTarget.request.id}`, "deny", cookie),
      denyTarget.request.id,
    ))).rejects.toSatisfy((response: Response) => {
      expect(response.status).toBe(302);
      return true;
    });
    await expect(db.agentConnectionRequest.findUnique({ where: { id: denyTarget.request.id } }))
      .resolves.toMatchObject({ status: "denied" });

    const invalid = await action(routeArgs(
      formRequest(`http://localhost/agent/connect/${denyTarget.request.id}`, "later", cookie),
      denyTarget.request.id,
    ));
    expect((invalid as any).init.status).toBe(400);
    expect((invalid as any).data.error).toBe("Choose approve or deny");

    await expect(action(routeArgs(
      formRequest(`http://localhost/agent/connect/${denyTarget.request.id}`, "approve"),
      denyTarget.request.id,
    ))).rejects.toSatisfy((response: Response) => {
      expect(response.status).toBe(302);
      expect(response.headers.get("Location")).toBe(`/login?redirectTo=${encodeURIComponent(`/agent/connect/${denyTarget.request.id}`)}`);
      return true;
    });
  });

  it("renders pending, approved, denied, and unavailable connection states", async () => {
    renderWithData({
      status: "pending",
      agentName: "slugger",
      userCode: "ABCD-2345",
      userEmail,
      expiresAt: "2026-05-26T12:10:00.000Z",
    });
    expect(await screen.findByRole("heading", { name: "Connect Spoonjoy" })).toBeInTheDocument();
    expect(screen.getByText(/slugger wants permission/)).toBeInTheDocument();
    expect(screen.getByText("ABCD-2345")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve Access" })).toBeInTheDocument();

    cleanupDom();
    renderWithData({
      status: "approved",
      agentName: "slugger",
      userCode: "EFGH-6789",
      userEmail: null,
      expiresAt: "2026-05-26T12:10:00.000Z",
    });
    expect(await screen.findByRole("heading", { name: "Spoonjoy Connected" })).toBeInTheDocument();
    expect(screen.getByText(/can now use Spoonjoy/)).toBeInTheDocument();

    cleanupDom();
    renderWithData({
      status: "claimed",
      agentName: "slugger",
      userCode: null,
      userEmail: null,
      expiresAt: "2026-05-26T12:10:00.000Z",
    });
    expect(await screen.findByRole("heading", { name: "Spoonjoy Connected" })).toBeInTheDocument();

    cleanupDom();
    renderWithData({
      status: "denied",
      agentName: "slugger",
      userCode: null,
      userEmail: null,
      expiresAt: "2026-05-26T12:10:00.000Z",
    });
    expect(await screen.findByRole("heading", { name: "Connection Denied" })).toBeInTheDocument();

    cleanupDom();
    renderWithData({
      status: "expired",
      agentName: "slugger",
      userCode: null,
      userEmail: null,
      expiresAt: "2026-05-26T12:10:00.000Z",
    });
    expect(await screen.findByRole("heading", { name: "Connection Expired" })).toBeInTheDocument();
  });
});
