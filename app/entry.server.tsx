import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter } from "react-router";
import { renderToPipeableStream } from "react-dom/server";
import { isbot } from "isbot";
import type { AppLoadContext, EntryContext } from "react-router";

const ABORT_DELAY = 5000;

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  loadContext: AppLoadContext
) {
  return isbot(request.headers.get("user-agent") || "")
    ? handleBotRequest(
        request,
        responseStatusCode,
        responseHeaders,
        entryContext
      )
    : handleBrowserRequest(
        request,
        responseStatusCode,
        responseHeaders,
        entryContext
      );
}

function handleBotRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={entryContext} url={request.url} />,
      {
        onAllReady() {
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          responseStatusCode = 500;
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

function handleBrowserRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext
) {
  return new Promise((resolve, reject) => {
    const { pipe, abort } = renderToPipeableStream(
      <ServerRouter context={entryContext} url={request.url} />,
      {
        onShellReady() {
          const body = new PassThrough();
          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            })
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          console.error(error);
        },
      }
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

// Node.js PassThrough stream
class PassThrough {
  private chunks: Uint8Array[] = [];
  private closed = false;
  private onData: ((chunk: Uint8Array) => void) | null = null;
  private onEnd: (() => void) | null = null;

  write(chunk: string | Uint8Array) {
    if (this.closed) return;

    const uint8Array = typeof chunk === "string"
      ? new TextEncoder().encode(chunk)
      : chunk;

    if (this.onData) {
      this.onData(uint8Array);
    } else {
      this.chunks.push(uint8Array);
    }
  }

  end() {
    this.closed = true;
    if (this.onEnd) {
      this.onEnd();
    }
  }

  on(event: "data" | "end", callback: any) {
    if (event === "data") {
      this.onData = callback;
      this.chunks.forEach(chunk => callback(chunk));
      this.chunks = [];
    } else if (event === "end") {
      this.onEnd = callback;
      if (this.closed) {
        callback();
      }
    }
  }
}
