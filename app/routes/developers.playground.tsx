import { type FormEvent, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { CheckCircle2, KeyRound, LogIn, Play, ShieldOff, Terminal, XCircle } from "lucide-react";
import {
  API_V1_PLAYGROUND_MANIFEST,
  type ApiV1PlaygroundManifest,
  type ApiV1PlaygroundOperation,
  type ApiV1PlaygroundParam,
} from "~/lib/generated/api-v1-playground";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Code, Text } from "~/components/ui/text";
import { CookbookHeader, CookbookPage, CookbookSectionTitle } from "~/components/cookbook/page";

type PlaygroundAuthMode = "session" | "bearer" | "anonymous";

type PlaygroundResponse = {
  status: number;
  statusText: string;
  requestId: string | null;
  body: string;
};

export const PLAYGROUND_OPERATIONS: readonly ApiV1PlaygroundOperation[] = API_V1_PLAYGROUND_MANIFEST.operations;

const AUTH_MODES: Array<{
  id: PlaygroundAuthMode;
  label: string;
  icon: typeof LogIn;
}> = [
  { id: "session", label: "Session", icon: LogIn },
  { id: "bearer", label: "Bearer", icon: KeyRound },
  { id: "anonymous", label: "Anonymous", icon: ShieldOff },
];

function defaultParams(operation: ApiV1PlaygroundOperation): Record<string, string> {
  return Object.fromEntries(operation.params.map((param) => [param.name, param.defaultValue]));
}

function defaultBodies(operations: readonly ApiV1PlaygroundOperation[]): Record<string, string> {
  return Object.fromEntries(
    operations.map((operation) => [operation.id, operation.requestBody?.example ?? ""]),
  );
}

function defaultParamsByOperation(operations: readonly ApiV1PlaygroundOperation[]) {
  return Object.fromEntries(operations.map((operation) => [operation.id, defaultParams(operation)]));
}

function pathParamValue(path: string, param: ApiV1PlaygroundParam, value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? encodeURIComponent(trimmed) : `{${param.name}}`;
}

export function playgroundPath(operation: ApiV1PlaygroundOperation, params: Record<string, string>) {
  let path = operation.path;
  const search = new URLSearchParams();

  for (const param of operation.params) {
    const value = params[param.name]?.trim();
    if (param.in === "path") {
      path = path.replace(`{${param.name}}`, pathParamValue(path, param, value));
      continue;
    }
    if (value) search.set(param.name, value);
  }

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

function shellQuote(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export function curlFor(
  path: string,
  operation: ApiV1PlaygroundOperation,
  authMode: PlaygroundAuthMode,
  bodyText: string,
) {
  if (authMode === "session" && operation.auth === "authenticated") {
    return [
      "# Session mode is browser-only: the playground sends your signed-in Spoonjoy cookie.",
      "# Press Send Request here, or switch to Bearer mode for a terminal curl after copying a token.",
    ].join("\n");
  }

  const lines = [`curl ${shellQuote(`https://spoonjoy.app${path}`)}`];
  if (operation.method !== "GET") lines.push(`  -X ${operation.method}`);
  lines.push("  -H 'X-Request-Id: pg_example'");
  if (authMode === "bearer") lines.push("  -H 'Authorization: Bearer sj_token'");
  if (bodyText.trim()) {
    lines.push("  -H 'Content-Type: application/json'");
    lines.push(`  --data ${shellQuote(bodyText.trim())}`);
  }

  const command = lines.join(" \\\n");
  if (authMode === "session") {
    return `# The playground sends your signed-in Spoonjoy session cookie; this curl runs anonymously.\n${command}`;
  }
  return command;
}

function prettyJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export function playgroundRequestId(
  cryptoLike: Pick<Crypto, "randomUUID"> | null | undefined = globalThis.crypto,
  now = Date.now(),
) {
  if (cryptoLike && "randomUUID" in cryptoLike) {
    return `pg_${cryptoLike.randomUUID()}`;
  }
  return `pg_${now}`;
}

export function playgroundFetchOptions(
  operation: ApiV1PlaygroundOperation,
  authMode: PlaygroundAuthMode,
  token: string,
  bodyText: string,
  requestId = playgroundRequestId(),
): RequestInit {
  const headers: Record<string, string> = { "X-Request-Id": requestId };
  if (authMode === "bearer" && token.trim()) headers.Authorization = `Bearer ${token.trim()}`;
  const trimmedBody = bodyText.trim();
  if (trimmedBody && operation.method !== "GET") {
    headers["Content-Type"] = operation.requestBody!.contentType;
  }

  return {
    method: operation.method,
    credentials: authMode === "session" ? "same-origin" : "omit",
    headers,
    ...(trimmedBody && operation.method !== "GET" ? { body: trimmedBody } : {}),
  };
}

export async function playgroundResponseFromFetchResult(result: Response): Promise<PlaygroundResponse> {
  const text = await result.text();
  let body = text;
  try {
    body = prettyJson(JSON.parse(text) as unknown);
  } catch {
    body = text || "(empty response)";
  }
  return {
    status: result.status,
    statusText: result.statusText || (result.ok ? "OK" : "ERROR"),
    requestId: result.headers.get("X-Request-Id"),
    body,
  };
}

export function playgroundNetworkError(error: unknown): PlaygroundResponse {
  return {
    status: 0,
    statusText: "NETWORK ERROR",
    requestId: null,
    body: error instanceof Error ? error.message : "Request failed",
  };
}

export function playgroundOperationGroups(operations: readonly ApiV1PlaygroundOperation[] = PLAYGROUND_OPERATIONS) {
  const groups: Array<{ tag: string; operations: ApiV1PlaygroundOperation[] }> = [];
  for (const operation of operations) {
    let group = groups.find((candidate) => candidate.tag === operation.tag);
    if (!group) {
      group = { tag: operation.tag, operations: [] };
      groups.push(group);
    }
    group.operations.push(operation);
  }
  return groups;
}

export function meta() {
  return [
    { title: "Spoonjoy API Playground | Spoonjoy" },
    {
      name: "description",
      content: "Try Spoonjoy API v1 requests from the generated developer playground.",
    },
  ];
}

export function loader(): { manifest: ApiV1PlaygroundManifest } {
  return {
    manifest: API_V1_PLAYGROUND_MANIFEST,
  };
}

function methodColor(method: string) {
  if (method === "GET") return "green";
  if (method === "POST") return "amber";
  if (method === "PATCH") return "blue";
  return "red";
}

function authCopy(mode: PlaygroundAuthMode) {
  if (mode === "session") return "Uses your current Spoonjoy login for same-origin API calls.";
  if (mode === "bearer") return "Uses the bearer token you paste for external-client testing.";
  return "Omits cookies and Authorization for public-only requests.";
}

export default function DeveloperPlayground() {
  const { manifest } = useLoaderData<typeof loader>();
  const operations: readonly ApiV1PlaygroundOperation[] = manifest.operations;
  const operationGroups = useMemo(() => playgroundOperationGroups(operations), [operations]);
  const [selectedId, setSelectedId] = useState<string>(operations[0].id);
  const selected = operations.find((operation) => operation.id === selectedId)!;
  const [paramsByOperation, setParamsByOperation] = useState<Record<string, Record<string, string>>>(() => (
    defaultParamsByOperation(operations)
  ));
  const [bodiesByOperation, setBodiesByOperation] = useState<Record<string, string>>(() => defaultBodies(operations));
  const [authMode, setAuthMode] = useState<PlaygroundAuthMode>("session");
  const [token, setToken] = useState("");
  const [response, setResponse] = useState<PlaygroundResponse | null>(null);
  const [isSending, setIsSending] = useState(false);

  const params = paramsByOperation[selected.id]!;
  const bodyText = bodiesByOperation[selected.id]!;
  const path = useMemo(() => playgroundPath(selected, params), [selected, params]);
  const curl = curlFor(path, selected, authMode, bodyText);

  function updateParam(name: string, value: string) {
    setParamsByOperation((current) => ({
      ...current,
      [selected.id]: {
        ...current[selected.id]!,
        [name]: value,
      },
    }));
  }

  function updateBody(value: string) {
    setBodiesByOperation((current) => ({
      ...current,
      [selected.id]: value,
    }));
  }

  async function sendRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    try {
      const result = await fetch(path, playgroundFetchOptions(selected, authMode, token, bodyText));
      setResponse(await playgroundResponseFromFetchResult(result));
    } catch (error) {
      setResponse(playgroundNetworkError(error));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <CookbookPage className="sj-developer-playground">
      <CookbookHeader eyebrow={`API ${manifest.version}`} title="Spoonjoy API Playground" action={(
        <Button href="/developers" plain>
          <Terminal data-slot="icon" aria-hidden="true" />
          Docs
        </Button>
      )}>
        <Text className="text-lg/8">
          Generated from the live v1 OpenAPI surface. Sign into Spoonjoy and the playground uses that session for
          private, scoped, and mutating calls.
        </Text>
      </CookbookHeader>

      <form onSubmit={sendRequest} className="grid gap-6 border-t border-[var(--sj-border-strong)] py-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <section aria-label="Operations" className="grid max-h-[46rem] content-start gap-5 overflow-y-auto pr-1">
          {operationGroups.map((group) => (
            <div key={group.tag} className="grid gap-2">
              <p className="font-sj-ui text-xs font-bold uppercase tracking-[0.16em] text-[var(--sj-ink-soft)]">{group.tag}</p>
              {group.operations.map((operation) => (
                <button
                  key={operation.id}
                  type="button"
                  onClick={() => setSelectedId(operation.id)}
                  className={`grid gap-2 border p-4 text-left transition ${
                    operation.id === selected.id
                      ? "border-[var(--sj-brass)] bg-[color-mix(in_srgb,var(--sj-brass)_12%,var(--sj-panel-solid))]"
                      : "border-[var(--sj-border)] bg-[var(--sj-panel-solid)] hover:border-[var(--sj-border-strong)]"
                  }`}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-sj-ui text-sm/5 font-bold text-[var(--sj-ink)]">{operation.label}</span>
                    <Badge color={methodColor(operation.method) as "amber" | "blue" | "green" | "red"}>
                      {operation.method}
                    </Badge>
                  </span>
                  <span className="break-words font-mono text-xs/5 text-[var(--sj-ink-soft)]">{operation.path}</span>
                </button>
              ))}
            </div>
          ))}
        </section>

        <section className="grid gap-5">
          <div className="border border-[var(--sj-border-strong)] bg-[var(--sj-panel-solid)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CookbookSectionTitle className="my-0">{selected.label}</CookbookSectionTitle>
                <p className="mt-2 break-words font-mono text-sm/6 text-[var(--sj-ink-soft)]">{selected.path}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge color={methodColor(selected.method) as "amber" | "blue" | "green" | "red"}>
                  {selected.method}
                </Badge>
                <Badge color={selected.auth === "authenticated" ? "amber" : "zinc"}>
                  {selected.auth === "authenticated" ? "Authenticated chef" : "Auth optional"}
                </Badge>
                {selected.scopes.map((scope) => <Badge key={scope} color="zinc">{scope}</Badge>)}
              </div>
            </div>

            <div className="mt-5 grid gap-3 border-y border-[var(--sj-border)] py-5">
              <p className="font-sj-ui text-sm font-semibold text-[var(--sj-ink)]">Auth</p>
              <div className="grid gap-2 sm:grid-cols-3">
                {AUTH_MODES.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAuthMode(id)}
                    className={`flex min-h-11 items-center justify-center gap-2 border px-3 font-sj-ui text-sm font-semibold transition ${
                      authMode === id
                        ? "border-[var(--sj-brass)] bg-[color-mix(in_srgb,var(--sj-brass)_12%,var(--sj-panel-solid))] text-[var(--sj-ink)]"
                        : "border-[var(--sj-border)] bg-[var(--sj-paper)] text-[var(--sj-ink-soft)] hover:border-[var(--sj-border-strong)]"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-sm/6 text-[var(--sj-ink-soft)]">{authCopy(authMode)}</p>
              {authMode === "bearer" ? (
                <input
                  aria-label="Bearer token"
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  type="password"
                  autoComplete="off"
                  placeholder="sj_..."
                  className="min-h-11 border border-[var(--sj-border)] bg-[var(--sj-paper)] px-3 font-mono text-sm text-[var(--sj-ink)] outline-none focus:border-[var(--sj-brass)]"
                />
              ) : null}
            </div>

            {selected.params.length ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {selected.params.map((param) => (
                  <label key={`${param.in}-${param.name}`} className="grid gap-2 font-sj-ui text-sm font-semibold text-[var(--sj-ink)]">
                    {param.label}
                    <input
                      value={params[param.name]}
                      onChange={(event) => updateParam(param.name, event.target.value)}
                      placeholder={param.placeholder}
                      className="min-h-11 border border-[var(--sj-border)] bg-[var(--sj-paper)] px-3 text-base font-normal text-[var(--sj-ink)] outline-none focus:border-[var(--sj-brass)]"
                    />
                    <span className="font-mono text-xs font-normal text-[var(--sj-ink-soft)]">
                      {param.in}{param.required ? " required" : ""}
                    </span>
                  </label>
                ))}
              </div>
            ) : null}

            {selected.requestBody ? (
              <label className="mt-5 grid gap-2 font-sj-ui text-sm font-semibold text-[var(--sj-ink)]">
                JSON body
                <textarea
                  aria-label="JSON body"
                  value={bodyText}
                  onChange={(event) => updateBody(event.target.value)}
                  spellCheck={false}
                  rows={10}
                  className="min-h-48 resize-y border border-[var(--sj-border)] bg-[var(--sj-paper)] px-3 py-3 font-mono text-sm/6 font-normal text-[var(--sj-ink)] outline-none focus:border-[var(--sj-brass)]"
                />
              </label>
            ) : null}

            <div className="mt-5 grid gap-3">
              <p className="break-words font-mono text-sm/6 text-[var(--sj-ink)]">
                <Code>{path}</Code>
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap border border-[var(--sj-border)] bg-[var(--sj-photo-charcoal)] p-4 font-mono text-xs/5 text-[var(--sj-on-photo)]">
                {curl}
              </pre>
            </div>

            <div className="mt-5">
              <Button type="submit" disabled={isSending}>
                <Play data-slot="icon" aria-hidden="true" />
                {isSending ? "Sending" : "Send Request"}
              </Button>
            </div>
          </div>

          <section className="border border-[var(--sj-border-strong)] bg-[var(--sj-photo-charcoal)] p-5 text-[var(--sj-on-photo)]" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CookbookSectionTitle className="my-0 text-[var(--sj-on-photo)]">Response</CookbookSectionTitle>
              {response ? (
                <span className="inline-flex items-center gap-2 font-sj-ui text-sm font-semibold">
                  {response.status >= 200 && response.status < 300 ? (
                    <CheckCircle2 className="size-4 text-[var(--sj-on-photo-warm)]" aria-hidden="true" />
                  ) : (
                    <XCircle className="size-4 text-[var(--sj-tomato)]" aria-hidden="true" />
                  )}
                  {response.status} {response.statusText}
                </span>
              ) : null}
            </div>
            {response?.requestId ? (
              <p className="mt-3 font-mono text-xs/5 text-[var(--sj-on-photo-muted)]">Request ID: {response.requestId}</p>
            ) : null}
            <pre className="mt-4 min-h-64 overflow-x-auto whitespace-pre-wrap font-mono text-xs/5 text-[var(--sj-on-photo-muted)]">
              {response ? response.body : "No response yet."}
            </pre>
          </section>
        </section>
      </form>
    </CookbookPage>
  );
}
