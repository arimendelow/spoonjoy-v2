import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import { applyStorageSchemaMigration } from "~/lib/client-storage-schema";

applyStorageSchemaMigration();

// Initialize PostHog on the client
const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
const posthogHost = import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

if (posthogKey) {
  posthog.init(posthogKey, {
    api_host: posthogHost,
    capture_pageview: false, // We'll capture manually via React Router
    capture_pageleave: true,
    session_recording: {
      maskTextSelector: "*", // Mask all text for privacy
      maskAllInputs: true, // Mask form inputs
    },
  });
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <PostHogProvider client={posthog}>
        <HydratedRouter />
      </PostHogProvider>
    </StrictMode>
  );
});
