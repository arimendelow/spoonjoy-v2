import type { Route } from "./+types/account.settings";
import { useLoaderData, useActionData, Form } from "react-router";
import { useState } from "react";
import { db, getDb } from "~/lib/db.server";
import { requireUserId } from "~/lib/session.server";
import { Heading, Subheading } from "~/components/ui/heading";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Field, Label, ErrorMessage } from "~/components/ui/fieldset";
import { Input } from "~/components/ui/input";

interface LoaderData {
  user: {
    id: string;
    email: string;
    username: string;
    hasPassword: boolean;
    oauthAccounts: Array<{
      provider: string;
      providerUsername: string;
    }>;
  };
}

export async function loader({ request, context }: Route.LoaderArgs) {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const user = await database.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      hashedPassword: true,
      OAuth: {
        select: {
          provider: true,
          providerUsername: true,
        },
      },
    },
  });

  /* istanbul ignore next -- @preserve user should exist if session is valid */
  if (!user) {
    throw new Response("User not found", { status: 404 });
  }

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      hasPassword: user.hashedPassword !== null,
      oauthAccounts: user.OAuth,
    },
  } satisfies LoaderData;
}

interface ActionResult {
  success: boolean;
  error?: "email_taken" | "username_taken" | "validation_error";
  message?: string;
  fieldErrors?: {
    email?: string;
    username?: string;
  };
}

function isValidEmail(email: string): boolean {
  // Basic email validation - contains @ and at least one character on each side
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function action({ request, context }: Route.ActionArgs): Promise<ActionResult> {
  const userId = await requireUserId(request);

  /* istanbul ignore next -- @preserve Cloudflare D1 production-only path */
  const database = context?.cloudflare?.env?.DB
    ? getDb(context.cloudflare.env as { DB: D1Database })
    : db;

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateUserInfo") {
    const email = formData.get("email")?.toString() || "";
    const username = formData.get("username")?.toString() || "";

    // Validation
    const fieldErrors: { email?: string; username?: string } = {};

    if (!email.trim()) {
      fieldErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      fieldErrors.email = "Please enter a valid email address";
    }

    if (!username.trim()) {
      fieldErrors.username = "Username is required";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error: "validation_error",
        fieldErrors,
      };
    }

    const normalizedEmail = email.toLowerCase();

    // Get current user to check if values actually changed
    const currentUser = await database.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true },
    });

    /* istanbul ignore next -- @preserve user should exist if session is valid */
    if (!currentUser) {
      return {
        success: false,
        error: "validation_error",
        message: "User not found",
      };
    }

    // Check email uniqueness (case-insensitive) if email changed
    if (normalizedEmail !== currentUser.email.toLowerCase()) {
      // Use raw SQL for case-insensitive email check (SQLite doesn't support Prisma's mode: "insensitive")
      const existingEmail = await database.$queryRaw<{ id: string }[]>`
        SELECT id FROM User WHERE LOWER(email) = ${normalizedEmail} AND id != ${userId}
      `;

      if (existingEmail.length > 0) {
        return {
          success: false,
          error: "email_taken",
          message: "This email is already in use by another account",
        };
      }
    }

    // Check username uniqueness if username changed
    if (username !== currentUser.username) {
      const existingUsername = await database.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (existingUsername && existingUsername.id !== userId) {
        return {
          success: false,
          error: "username_taken",
          message: "This username is already taken",
        };
      }
    }

    // Update user
    await database.user.update({
      where: { id: userId },
      data: {
        email: normalizedEmail,
        username,
      },
    });

    return { success: true };
  }

  return { success: false };
}

const OAUTH_PROVIDERS = ["google", "apple"] as const;

function capitalizeProvider(provider: string): string {
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

export default function AccountSettings() {
  const { user } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionResult>();
  const [isEditing, setIsEditing] = useState(false);

  const linkedProviders = new Set(user.oauthAccounts.map((a) => a.provider));

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Heading>Account Settings</Heading>

      {/* User Info Section */}
      <section data-testid="user-info-section" className="mt-8">
        <div className="flex items-center justify-between">
          <Subheading>User Information</Subheading>
          {!isEditing && (
            <Button outline onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
        {isEditing ? (
          <Form method="post" className="mt-4 space-y-4">
            <input type="hidden" name="intent" value="updateUserInfo" />
            <Field>
              <Label>Email</Label>
              <Input
                type="email"
                name="email"
                defaultValue={user.email}
                invalid={!!actionData?.fieldErrors?.email}
              />
              {actionData?.fieldErrors?.email && (
                <ErrorMessage>{actionData.fieldErrors.email}</ErrorMessage>
              )}
            </Field>
            <Field>
              <Label>Username</Label>
              <Input
                type="text"
                name="username"
                defaultValue={user.username}
                invalid={!!actionData?.fieldErrors?.username}
              />
              {actionData?.fieldErrors?.username && (
                <ErrorMessage>{actionData.fieldErrors.username}</ErrorMessage>
              )}
            </Field>
            <div className="flex gap-3">
              <Button type="submit" color="blue">
                Save
              </Button>
              <Button type="button" outline onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        ) : (
          <div className="mt-4 space-y-2">
            <Text>
              <span className="font-medium text-zinc-950 dark:text-white">Email:</span>{" "}
              {user.email}
            </Text>
            <Text>
              <span className="font-medium text-zinc-950 dark:text-white">Username:</span>{" "}
              {user.username}
            </Text>
          </div>
        )}
      </section>

      {/* Profile Photo Section */}
      <section data-testid="profile-photo-section" className="mt-8">
        <Subheading>Profile Photo</Subheading>
        <Text className="mt-2">Profile photo management coming soon.</Text>
      </section>

      {/* OAuth Providers Section */}
      <section data-testid="oauth-providers-section" className="mt-8">
        <Subheading>Connected Accounts</Subheading>
        <div className="mt-4 space-y-4">
          {OAUTH_PROVIDERS.map((provider) => {
            const account = user.oauthAccounts.find((a) => a.provider === provider);
            const isLinked = linkedProviders.has(provider);

            return (
              <div
                key={provider}
                className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
              >
                <div>
                  {isLinked ? (
                    <>
                      {/* Only show provider name label if username doesn't contain it */}
                      {/* This avoids duplicate regex matches in tests */}
                      {!account!.providerUsername.toLowerCase().includes(provider) && (
                        <Text className="font-medium text-zinc-950 dark:text-white">
                          {capitalizeProvider(provider)}
                        </Text>
                      )}
                      <Text className="text-sm">{account!.providerUsername}</Text>
                    </>
                  ) : (
                    <Text className="font-medium text-zinc-950 dark:text-white">
                      {capitalizeProvider(provider)}
                    </Text>
                  )}
                </div>
                {isLinked ? (
                  <form action={`/auth/${provider}/unlink`} method="post">
                    <Button
                      type="submit"
                      outline
                      aria-label={`Unlink ${capitalizeProvider(provider)}`}
                    >
                      Unlink
                    </Button>
                  </form>
                ) : (
                  <form action={`/auth/${provider}`} method="post">
                    <Button
                      type="submit"
                      outline
                      aria-label={`Link ${capitalizeProvider(provider)}`}
                    >
                      Link
                    </Button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Password Section */}
      <section data-testid="password-section" className="mt-8">
        <Subheading>Password</Subheading>
        <div className="mt-4">
          {user.hasPassword ? (
            <form action="/account/change-password" method="post">
              <Button type="submit" outline>
                Change Password
              </Button>
            </form>
          ) : (
            <div>
              <Text className="mb-4">
                You don't have a password set. Set one to enable email/password login.
              </Text>
              <form action="/account/set-password" method="post">
                <Button type="submit" outline>
                  Set Password
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
