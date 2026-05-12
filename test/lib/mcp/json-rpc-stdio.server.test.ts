import { describe, expect, it } from "vitest";
import { createJsonRpcLineSession } from "~/lib/mcp/json-rpc-stdio.server";
import type { JsonRpcToolRouter } from "~/lib/mcp/json-rpc.server";

function createIo() {
  const events: string[] = [];
  return {
    events,
    io: {
      write(line: string) {
        events.push(`write:${line}`);
      },
      async disconnect() {
        events.push("disconnect");
      },
    },
  };
}

describe("createJsonRpcLineSession", () => {
  it("waits for in-flight JSON-RPC calls before disconnecting", async () => {
    let resolveCall!: () => void;
    const router: JsonRpcToolRouter = {
      listTools: () => ({ tools: [] }),
      callTool: () => new Promise((resolve) => {
        resolveCall = () => resolve({ ok: true });
      }),
    };
    const { events, io } = createIo();
    const session = createJsonRpcLineSession(router, io);

    session.onLine(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "slow" } }));
    const closing = session.close();
    await Promise.resolve();

    expect(events).toEqual([]);

    resolveCall();
    await closing;

    expect(events).toHaveLength(2);
    expect(events[0]).toContain('"id":1');
    expect(events[0]).toContain('"ok":true');
    expect(events[1]).toBe("disconnect");
  });

  it("processes incoming lines in order", async () => {
    let resolveCall!: () => void;
    const router: JsonRpcToolRouter = {
      listTools: () => ({ tools: [{ name: "fast" }] }),
      callTool: () => new Promise((resolve) => {
        resolveCall = () => resolve({ ok: true });
      }),
    };
    const { events, io } = createIo();
    const session = createJsonRpcLineSession(router, io);

    session.onLine(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "slow" } }));
    session.onLine(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }));
    await Promise.resolve();

    expect(events).toEqual([]);

    resolveCall();
    await session.close();

    expect(events).toHaveLength(3);
    expect(events[0]).toContain('"id":1');
    expect(events[1]).toContain('"id":2');
    expect(events[2]).toBe("disconnect");
  });

  it("writes an internal error response when response serialization fails", async () => {
    const router: JsonRpcToolRouter = {
      listTools: () => ({ invalidForJson: BigInt(1) }),
      callTool: async () => ({ ok: true }),
    };
    const { events, io } = createIo();
    const session = createJsonRpcLineSession(router, io);

    session.onLine(JSON.stringify({ jsonrpc: "2.0", id: "tools", method: "tools/list" }));
    await session.close();

    expect(events).toHaveLength(2);
    expect(events[0]).toContain('"id":null');
    expect(events[0]).toContain('"code":-32603');
    expect(events[0]).toContain("Do not know how to serialize a BigInt");
    expect(events[1]).toBe("disconnect");
  });

  it("ignores new lines after close begins", async () => {
    const router: JsonRpcToolRouter = {
      listTools: () => ({ tools: [] }),
      callTool: async () => ({ ok: true }),
    };
    const { events, io } = createIo();
    const session = createJsonRpcLineSession(router, io);

    await session.close();
    session.onLine(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }));

    expect(events).toEqual(["disconnect"]);
  });
});
