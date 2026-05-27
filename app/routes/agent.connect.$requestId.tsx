import type { Route } from "./+types/agent.connect.$requestId";
import { Form, data, redirect, useLoaderData } from "react-router";
import { getRequestDb } from "~/lib/route-platform.server";
import { getUserId } from "~/lib/session.server";
import {
  approveAgentConnectionRequest,
  denyAgentConnectionRequest,
  getAgentConnectionRequest,
  type AgentConnectionPublicStatus,
} from "~/lib/agent-connection.server";
import { Button } from "~/components/ui/button";
import { Heading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";

type LoaderData = {
  status: AgentConnectionPublicStatus | "missing";
  agentName: string;
  userCode: string | null;
  userEmail: string | null;
  expiresAt: string | null;
};

function loginRedirect(request: Request): string {
  const url = new URL(request.url);
  const path = `${url.pathname}${url.search}`;
  return `/login?redirectTo=${encodeURIComponent(path)}`;
}

function connectionTitle(status: LoaderData["status"]): string {
  if (status === "pending") return "Connect Spoonjoy";
  if (status === "approved" || status === "claimed") return "Spoonjoy Connected";
  if (status === "denied") return "Connection Denied";
  return "Connection Expired";
}

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const db = await getRequestDb(context);
  const connection = await getAgentConnectionRequest(db, params.requestId);
  if (!connection) {
    return {
      status: "missing",
      agentName: "this agent",
      userCode: null,
      userEmail: null,
      expiresAt: null,
    } satisfies LoaderData;
  }

  const userId = await getUserId(request, context.cloudflare?.env);
  if (!userId && connection.status === "pending") {
    throw redirect(loginRedirect(request));
  }

  const user = userId
    ? await db.user.findUnique({ where: { id: userId }, select: { email: true } })
    : null;

  return {
    status: connection.status as AgentConnectionPublicStatus,
    agentName: connection.agentName,
    userCode: connection.userCode,
    userEmail: user?.email ?? null,
    expiresAt: connection.expiresAt.toISOString(),
  } satisfies LoaderData;
}

export async function action({ request, context, params }: Route.ActionArgs) {
  const userId = await getUserId(request, context.cloudflare?.env);
  if (!userId) throw redirect(loginRedirect(request));

  const formData = await request.formData();
  const intent = formData.get("intent")?.toString();
  const db = await getRequestDb(context);

  if (intent === "approve") {
    await approveAgentConnectionRequest(db, params.requestId, userId);
    throw redirect(`/agent/connect/${params.requestId}`);
  }

  if (intent === "deny") {
    await denyAgentConnectionRequest(db, params.requestId);
    throw redirect(`/agent/connect/${params.requestId}`);
  }

  return data({ error: "Choose approve or deny" }, { status: 400 });
}

export default function AgentConnect() {
  const connection = useLoaderData<typeof loader>();
  const actionable = connection.status === "pending";

  return (
    <main className="mx-auto flex min-h-[70svh] w-full max-w-xl flex-col justify-center px-6 py-12">
      <p className="font-sj-ui text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sj-ink-soft)]">
        Agent access
      </p>
      <Heading className="mt-3">{connectionTitle(connection.status)}</Heading>
      <Text className="mt-5 text-lg/7">
        {actionable
          ? `${connection.agentName} wants permission to view and edit your Spoonjoy kitchen.`
          : connection.status === "approved" || connection.status === "claimed"
            ? `${connection.agentName} can now use Spoonjoy on your behalf.`
            : connection.status === "denied"
              ? `${connection.agentName} was not given access to your Spoonjoy kitchen.`
              : "This Spoonjoy connection link is no longer available."}
      </Text>

      {connection.userCode && (
        <div className="mt-8 border-y border-[var(--sj-border)] py-5">
          <p className="font-sj-ui text-xs font-semibold uppercase tracking-[0.18em] text-[var(--sj-ink-soft)]">
            Code
          </p>
          <p className="mt-2 font-sj-ui text-2xl font-semibold tracking-[0.12em] text-[var(--sj-ink)]">
            {connection.userCode}
          </p>
        </div>
      )}

      {connection.userEmail && actionable && (
        <Text className="mt-5">
          You are approving as {connection.userEmail}.
        </Text>
      )}

      {actionable && (
        <Form method="post" className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button type="submit" name="intent" value="approve">
            Approve Access
          </Button>
          <Button type="submit" name="intent" value="deny" plain>
            Deny
          </Button>
        </Form>
      )}
    </main>
  );
}
