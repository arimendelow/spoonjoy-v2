import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest, FormData as UndiciFormData, File as UndiciFile } from "undici";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

// Import loader and component from the route
import AccountSettings, { loader, action } from "~/routes/account.settings";

describe("Account Settings Route", () => {
  let testUserId: string;
  let testUserEmail: string;
  let testUsername: string;

  beforeEach(async () => {
    await cleanupDatabase();
    testUserEmail = faker.internet.email();
    testUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
    const user = await createUser(db, testUserEmail, testUsername, "testPassword123");
    testUserId = user.id;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("loader", () => {
    it("should redirect to login when user is not logged in", async () => {
      const request = new UndiciRequest("http://localhost:3000/account/settings");

      await expect(
        loader({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should return user data when logged in", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/account/settings", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.user).toBeDefined();
      expect(result.user.id).toBe(testUserId);
      expect(result.user.email).toBe(testUserEmail.toLowerCase());
      expect(result.user.username).toBe(testUsername);
    });

    it("should return user OAuth accounts when logged in", async () => {
      // Create an OAuth account for the user
      await db.oAuth.create({
        data: {
          provider: "google",
          providerUserId: "google-123",
          providerUsername: "testuser@gmail.com",
          userId: testUserId,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/account/settings", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.user.oauthAccounts).toBeDefined();
      expect(result.user.oauthAccounts).toHaveLength(1);
      expect(result.user.oauthAccounts[0].provider).toBe("google");
      expect(result.user.oauthAccounts[0].providerUsername).toBe("testuser@gmail.com");
    });

    it("should indicate if user has a password set", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/account/settings", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.user.hasPassword).toBe(true);
    });

    it("should indicate if OAuth-only user has no password", async () => {
      // Create an OAuth-only user (no password)
      const oauthEmail = faker.internet.email();
      const oauthUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const oauthUser = await db.user.create({
        data: {
          email: oauthEmail.toLowerCase(),
          username: oauthUsername,
          hashedPassword: null,
          salt: null,
        },
      });

      await db.oAuth.create({
        data: {
          provider: "apple",
          providerUserId: "apple-456",
          providerUsername: "Apple User",
          userId: oauthUser.id,
        },
      });

      const session = await sessionStorage.getSession();
      session.set("userId", oauthUser.id);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const headers = new Headers();
      headers.set("Cookie", cookieValue);

      const request = new UndiciRequest("http://localhost:3000/account/settings", { headers });

      const result = await loader({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.user.hasPassword).toBe(false);
    });
  });

  describe("component", () => {
    it("should render account settings page with heading", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      expect(await screen.findByRole("heading", { name: /account settings/i })).toBeInTheDocument();
    });

    it("should render user info section", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      // User info section should show email and username
      expect(screen.getByTestId("user-info-section")).toBeInTheDocument();
      expect(screen.getByText(testUserEmail.toLowerCase())).toBeInTheDocument();
      expect(screen.getByText(testUsername)).toBeInTheDocument();
    });

    it("should render profile photo section", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      expect(screen.getByTestId("profile-photo-section")).toBeInTheDocument();
    });

    it("should render OAuth providers section", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      expect(screen.getByTestId("oauth-providers-section")).toBeInTheDocument();
    });

    it("should render password section", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      expect(screen.getByTestId("password-section")).toBeInTheDocument();
    });

    it("should display linked OAuth accounts", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [
            { provider: "google", providerUsername: "testuser@gmail.com" },
            { provider: "apple", providerUsername: "Apple User" },
          ],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      // Should show both linked accounts
      expect(screen.getByText(/google/i)).toBeInTheDocument();
      expect(screen.getByText("testuser@gmail.com")).toBeInTheDocument();
      expect(screen.getByText(/apple/i)).toBeInTheDocument();
      expect(screen.getByText("Apple User")).toBeInTheDocument();
    });

    it("should show option to link OAuth providers when not linked", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      // Should show buttons to link Google and Apple
      expect(screen.getByRole("button", { name: /link google/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /link apple/i })).toBeInTheDocument();
    });

    it("should show option to unlink OAuth provider when linked", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [{ provider: "google", providerUsername: "testuser@gmail.com" }],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      // Should show unlink button for linked Google account
      expect(screen.getByRole("button", { name: /unlink google/i })).toBeInTheDocument();
    });

    it("should show password change option when user has password", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      expect(screen.getByRole("button", { name: /change password/i })).toBeInTheDocument();
    });

    it("should show option to set password when OAuth-only user has no password", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: false,
          oauthAccounts: [{ provider: "google", providerUsername: "testuser@gmail.com" }],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      expect(screen.getByRole("button", { name: /set password/i })).toBeInTheDocument();
    });

    it("should show mixed link/unlink buttons when one provider is linked and one is not", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [{ provider: "google", providerUsername: "testuser@gmail.com" }],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      // Google is linked - should show Unlink
      expect(screen.getByRole("button", { name: /unlink google/i })).toBeInTheDocument();
      // Apple is not linked - should show Link
      expect(screen.getByRole("button", { name: /link apple/i })).toBeInTheDocument();
    });

    it("should have accessible button labels for screen readers", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [{ provider: "google", providerUsername: "testuser@gmail.com" }],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });

      // Verify aria-labels are set correctly
      const unlinkButton = screen.getByRole("button", { name: /unlink google/i });
      expect(unlinkButton).toHaveAttribute("aria-label", "Unlink Google");

      const linkButton = screen.getByRole("button", { name: /link apple/i });
      expect(linkButton).toHaveAttribute("aria-label", "Link Apple");
    });

    it("should render all sections with proper semantic headings", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });

      // Verify all section subheadings are present
      expect(screen.getByText("User Information")).toBeInTheDocument();
      expect(screen.getByText("Profile Photo")).toBeInTheDocument();
      expect(screen.getByText("Connected Accounts")).toBeInTheDocument();
      expect(screen.getByText("Password")).toBeInTheDocument();
    });

    it("should render edit button in user info section", async () => {
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    });

    it("should show edit form when edit button is clicked", async () => {
      const user = userEvent.setup();
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // Edit form should now be visible with input fields
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    });

    it("should pre-fill edit form with current user data", async () => {
      const user = userEvent.setup();
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement;
      const usernameInput = screen.getByLabelText(/username/i) as HTMLInputElement;

      expect(emailInput.value).toBe(testUserEmail.toLowerCase());
      expect(usernameInput.value).toBe(testUsername);
    });

    it("should hide edit form when cancel button is clicked", async () => {
      const user = userEvent.setup();
      const mockData = {
        user: {
          id: testUserId,
          email: testUserEmail.toLowerCase(),
          username: testUsername,
          hasPassword: true,
          oauthAccounts: [],
        },
      };

      const Stub = createTestRoutesStub([
        {
          path: "/account/settings",
          Component: AccountSettings,
          loader: () => mockData,
        },
      ]);

      render(<Stub initialEntries={["/account/settings"]} />);

      await screen.findByRole("heading", { name: /account settings/i });
      const editButton = screen.getByRole("button", { name: /edit/i });
      await user.click(editButton);

      // Cancel should return to view mode
      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      // Should be back to view mode - edit button visible again
      expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
      // Save button should not be visible
      expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    });
  });

  describe("action - user info editing", () => {
    it("should successfully update email", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const newEmail = faker.internet.email();
      const formData = new FormData();
      formData.append("email", newEmail);
      formData.append("username", testUsername);
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(true);

      // Verify email was updated in database
      const updatedUser = await db.user.findUnique({ where: { id: testUserId } });
      expect(updatedUser?.email).toBe(newEmail.toLowerCase());
    });

    it("should successfully update username", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const newUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const formData = new FormData();
      formData.append("email", testUserEmail);
      formData.append("username", newUsername);
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(true);

      // Verify username was updated in database
      const updatedUser = await db.user.findUnique({ where: { id: testUserId } });
      expect(updatedUser?.username).toBe(newUsername);
    });

    it("should successfully update both email and username", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const newEmail = faker.internet.email();
      const newUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      const formData = new FormData();
      formData.append("email", newEmail);
      formData.append("username", newUsername);
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(true);

      // Verify both fields were updated in database
      const updatedUser = await db.user.findUnique({ where: { id: testUserId } });
      expect(updatedUser?.email).toBe(newEmail.toLowerCase());
      expect(updatedUser?.username).toBe(newUsername);
    });

    it("should return error when email is already taken", async () => {
      // Create another user with a different email
      const existingEmail = faker.internet.email();
      const existingUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      await createUser(db, existingEmail, existingUsername, "testPassword123");

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const formData = new FormData();
      formData.append("email", existingEmail); // Try to use existing email
      formData.append("username", testUsername);
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("email_taken");
      expect(result.message).toContain("email");
    });

    it("should return error when username is already taken", async () => {
      // Create another user with a different username
      const existingEmail = faker.internet.email();
      const existingUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      await createUser(db, existingEmail, existingUsername, "testPassword123");

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const formData = new FormData();
      formData.append("email", testUserEmail);
      formData.append("username", existingUsername); // Try to use existing username
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("username_taken");
      expect(result.message).toContain("username");
    });

    it("should perform case-insensitive email uniqueness check", async () => {
      // Create another user with email in different case
      const existingEmail = faker.internet.email().toUpperCase();
      const existingUsername = faker.internet.username() + "_" + faker.string.alphanumeric(8);
      await createUser(db, existingEmail, existingUsername, "testPassword123");

      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const formData = new FormData();
      formData.append("email", existingEmail.toLowerCase()); // Same email, different case
      formData.append("username", testUsername);
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("email_taken");
    });

    it("should allow updating to same email (no change)", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const formData = new FormData();
      formData.append("email", testUserEmail); // Same email
      formData.append("username", testUsername); // Same username
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(true);
    });

    it("should return error when email is empty", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const formData = new FormData();
      formData.append("email", "");
      formData.append("username", testUsername);
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("validation_error");
      expect(result.fieldErrors?.email).toBeDefined();
    });

    it("should return error when username is empty", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const formData = new FormData();
      formData.append("email", testUserEmail);
      formData.append("username", "");
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("validation_error");
      expect(result.fieldErrors?.username).toBeDefined();
    });

    it("should return error when email format is invalid", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const formData = new FormData();
      formData.append("email", "not-a-valid-email");
      formData.append("username", testUsername);
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe("validation_error");
      expect(result.fieldErrors?.email).toBeDefined();
    });

    it("should redirect to login when not authenticated", async () => {
      const formData = new FormData();
      formData.append("email", faker.internet.email());
      formData.append("username", faker.internet.username());
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      await expect(
        action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any)
      ).rejects.toSatisfy((error: any) => {
        expect(error).toBeInstanceOf(Response);
        expect(error.status).toBe(302);
        expect(error.headers.get("Location")).toContain("/login");
        return true;
      });
    });

    it("should normalize email to lowercase", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const newEmail = "TEST.USER@EXAMPLE.COM";
      const formData = new FormData();
      formData.append("email", newEmail);
      formData.append("username", testUsername);
      formData.append("intent", "updateUserInfo");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(true);

      // Verify email was normalized to lowercase
      const updatedUser = await db.user.findUnique({ where: { id: testUserId } });
      expect(updatedUser?.email).toBe(newEmail.toLowerCase());
    });

    it("should return success false for unknown intent", async () => {
      const session = await sessionStorage.getSession();
      session.set("userId", testUserId);
      const setCookieHeader = await sessionStorage.commitSession(session);
      const cookieValue = setCookieHeader.split(";")[0];

      const formData = new FormData();
      formData.append("intent", "unknownIntent");

      const headers = new Headers();
      headers.set("Cookie", cookieValue);
      headers.set("Content-Type", "application/x-www-form-urlencoded");

      const request = new UndiciRequest("http://localhost:3000/account/settings", {
        method: "POST",
        headers,
        body: new URLSearchParams(formData as any).toString(),
      });

      const result = await action({
        request,
        context: { cloudflare: { env: null } },
        params: {},
      } as any);

      expect(result.success).toBe(false);
    });
  });

  describe("profile photo", () => {
    // Default avatar URL - chef RJ from spoonjoy v1
    const DEFAULT_AVATAR_URL =
      "https://res.cloudinary.com/dpjmyc4uz/image/upload/v1674541350/chef-rj.png";

    describe("loader - photo data", () => {
      it("should return user photoUrl when user has a custom photo", async () => {
        // Update user with custom photo URL
        const customPhotoUrl = "https://example.com/custom-photo.jpg";
        await db.user.update({
          where: { id: testUserId },
          data: { photoUrl: customPhotoUrl },
        });

        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const headers = new Headers();
        headers.set("Cookie", cookieValue);

        const request = new UndiciRequest("http://localhost:3000/account/settings", { headers });

        const result = await loader({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.user.photoUrl).toBe(customPhotoUrl);
      });

      it("should return null photoUrl when user has no custom photo", async () => {
        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const headers = new Headers();
        headers.set("Cookie", cookieValue);

        const request = new UndiciRequest("http://localhost:3000/account/settings", { headers });

        const result = await loader({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.user.photoUrl).toBeNull();
      });
    });

    describe("component - default avatar display", () => {
      it("should display default avatar (chef RJ) when user has no photo", async () => {
        const mockData = {
          user: {
            id: testUserId,
            email: testUserEmail.toLowerCase(),
            username: testUsername,
            hasPassword: true,
            oauthAccounts: [],
            photoUrl: null,
          },
        };

        const Stub = createTestRoutesStub([
          {
            path: "/account/settings",
            Component: AccountSettings,
            loader: () => mockData,
          },
        ]);

        render(<Stub initialEntries={["/account/settings"]} />);

        await screen.findByRole("heading", { name: /account settings/i });
        const profilePhotoSection = screen.getByTestId("profile-photo-section");

        // Should display the Avatar component with default chef RJ image
        const avatarImg = profilePhotoSection.querySelector("img");
        expect(avatarImg).toBeInTheDocument();
        expect(avatarImg).toHaveAttribute("src", DEFAULT_AVATAR_URL);
        expect(avatarImg).toHaveAttribute("alt", expect.stringMatching(/profile|avatar|photo/i));
      });

      it("should display user's custom photo when they have one", async () => {
        const customPhotoUrl = "https://example.com/my-photo.jpg";
        const mockData = {
          user: {
            id: testUserId,
            email: testUserEmail.toLowerCase(),
            username: testUsername,
            hasPassword: true,
            oauthAccounts: [],
            photoUrl: customPhotoUrl,
          },
        };

        const Stub = createTestRoutesStub([
          {
            path: "/account/settings",
            Component: AccountSettings,
            loader: () => mockData,
          },
        ]);

        render(<Stub initialEntries={["/account/settings"]} />);

        await screen.findByRole("heading", { name: /account settings/i });
        const profilePhotoSection = screen.getByTestId("profile-photo-section");

        // Should display the custom photo
        const avatarImg = profilePhotoSection.querySelector("img");
        expect(avatarImg).toBeInTheDocument();
        expect(avatarImg).toHaveAttribute("src", customPhotoUrl);
      });

      it("should use Avatar component from UI library for displaying photo", async () => {
        const mockData = {
          user: {
            id: testUserId,
            email: testUserEmail.toLowerCase(),
            username: testUsername,
            hasPassword: true,
            oauthAccounts: [],
            photoUrl: null,
          },
        };

        const Stub = createTestRoutesStub([
          {
            path: "/account/settings",
            Component: AccountSettings,
            loader: () => mockData,
          },
        ]);

        render(<Stub initialEntries={["/account/settings"]} />);

        await screen.findByRole("heading", { name: /account settings/i });
        const profilePhotoSection = screen.getByTestId("profile-photo-section");

        // Avatar component uses data-slot="avatar"
        const avatar = profilePhotoSection.querySelector('[data-slot="avatar"]');
        expect(avatar).toBeInTheDocument();
      });
    });

    describe("component - photo upload UI", () => {
      it("should display upload button in profile photo section", async () => {
        const mockData = {
          user: {
            id: testUserId,
            email: testUserEmail.toLowerCase(),
            username: testUsername,
            hasPassword: true,
            oauthAccounts: [],
            photoUrl: null,
          },
        };

        const Stub = createTestRoutesStub([
          {
            path: "/account/settings",
            Component: AccountSettings,
            loader: () => mockData,
          },
        ]);

        render(<Stub initialEntries={["/account/settings"]} />);

        await screen.findByRole("heading", { name: /account settings/i });
        expect(screen.getByRole("button", { name: /upload photo/i })).toBeInTheDocument();
      });

      it("should display change photo button when user already has a photo", async () => {
        const mockData = {
          user: {
            id: testUserId,
            email: testUserEmail.toLowerCase(),
            username: testUsername,
            hasPassword: true,
            oauthAccounts: [],
            photoUrl: "https://example.com/existing-photo.jpg",
          },
        };

        const Stub = createTestRoutesStub([
          {
            path: "/account/settings",
            Component: AccountSettings,
            loader: () => mockData,
          },
        ]);

        render(<Stub initialEntries={["/account/settings"]} />);

        await screen.findByRole("heading", { name: /account settings/i });
        expect(screen.getByRole("button", { name: /change photo/i })).toBeInTheDocument();
      });

      it("should display remove photo button when user has a custom photo", async () => {
        const mockData = {
          user: {
            id: testUserId,
            email: testUserEmail.toLowerCase(),
            username: testUsername,
            hasPassword: true,
            oauthAccounts: [],
            photoUrl: "https://example.com/existing-photo.jpg",
          },
        };

        const Stub = createTestRoutesStub([
          {
            path: "/account/settings",
            Component: AccountSettings,
            loader: () => mockData,
          },
        ]);

        render(<Stub initialEntries={["/account/settings"]} />);

        await screen.findByRole("heading", { name: /account settings/i });
        expect(screen.getByRole("button", { name: /remove photo/i })).toBeInTheDocument();
      });

      it("should not display remove photo button when user has default avatar", async () => {
        const mockData = {
          user: {
            id: testUserId,
            email: testUserEmail.toLowerCase(),
            username: testUsername,
            hasPassword: true,
            oauthAccounts: [],
            photoUrl: null,
          },
        };

        const Stub = createTestRoutesStub([
          {
            path: "/account/settings",
            Component: AccountSettings,
            loader: () => mockData,
          },
        ]);

        render(<Stub initialEntries={["/account/settings"]} />);

        await screen.findByRole("heading", { name: /account settings/i });
        expect(screen.queryByRole("button", { name: /remove photo/i })).not.toBeInTheDocument();
      });

      it("should have file input for photo upload (hidden, triggered by button)", async () => {
        const mockData = {
          user: {
            id: testUserId,
            email: testUserEmail.toLowerCase(),
            username: testUsername,
            hasPassword: true,
            oauthAccounts: [],
            photoUrl: null,
          },
        };

        const Stub = createTestRoutesStub([
          {
            path: "/account/settings",
            Component: AccountSettings,
            loader: () => mockData,
          },
        ]);

        render(<Stub initialEntries={["/account/settings"]} />);

        await screen.findByRole("heading", { name: /account settings/i });
        const profilePhotoSection = screen.getByTestId("profile-photo-section");

        // File input should exist (may be hidden)
        const fileInput = profilePhotoSection.querySelector('input[type="file"]');
        expect(fileInput).toBeInTheDocument();
        expect(fileInput).toHaveAttribute("accept", expect.stringMatching(/image/i));
      });
    });

    describe("action - photo upload", () => {
      it("should successfully upload a photo", async () => {
        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const formData = new UndiciFormData();
        formData.append("intent", "uploadPhoto");
        // Simulate file upload with a mock file
        const mockFile = new UndiciFile(["fake image data"], "test-photo.jpg", { type: "image/jpeg" });
        formData.append("photo", mockFile);

        const headers = new Headers();
        headers.set("Cookie", cookieValue);

        const request = new UndiciRequest("http://localhost:3000/account/settings", {
          method: "POST",
          headers,
          body: formData,
          duplex: "half",
        });

        const result = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.success).toBe(true);
        expect(result.photoUrl).toBeDefined();
        expect(typeof result.photoUrl).toBe("string");
      });

      it("should return error when no photo file is provided", async () => {
        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const formData = new FormData();
        formData.append("intent", "uploadPhoto");
        // No photo file attached

        const headers = new Headers();
        headers.set("Cookie", cookieValue);
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        const request = new UndiciRequest("http://localhost:3000/account/settings", {
          method: "POST",
          headers,
          body: new URLSearchParams(formData as any).toString(),
        });

        const result = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.success).toBe(false);
        expect(result.error).toBe("no_file");
        expect(result.message).toContain("photo");
      });

      it("should return error when file is not an image", async () => {
        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const formData = new UndiciFormData();
        formData.append("intent", "uploadPhoto");
        // Simulate non-image file
        const mockFile = new UndiciFile(["fake text data"], "test-file.txt", { type: "text/plain" });
        formData.append("photo", mockFile);

        const headers = new Headers();
        headers.set("Cookie", cookieValue);

        const request = new UndiciRequest("http://localhost:3000/account/settings", {
          method: "POST",
          headers,
          body: formData,
          duplex: "half",
        });

        const result = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.success).toBe(false);
        expect(result.error).toBe("invalid_file_type");
        expect(result.message).toContain("image");
      });

      it("should return error when file is too large", async () => {
        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const formData = new UndiciFormData();
        formData.append("intent", "uploadPhoto");
        // Simulate a file larger than 5MB (simulated via size property in test)
        // Note: actual file creation would be expensive, so we'll check the implementation handles size
        const largeFileData = new Uint8Array(6 * 1024 * 1024); // 6MB
        const mockFile = new UndiciFile([largeFileData], "large-photo.jpg", { type: "image/jpeg" });
        formData.append("photo", mockFile);

        const headers = new Headers();
        headers.set("Cookie", cookieValue);

        const request = new UndiciRequest("http://localhost:3000/account/settings", {
          method: "POST",
          headers,
          body: formData,
          duplex: "half",
        });

        const result = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.success).toBe(false);
        expect(result.error).toBe("file_too_large");
        expect(result.message).toContain("5MB");
      });

      it("should update user photoUrl in database after successful upload", async () => {
        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const formData = new UndiciFormData();
        formData.append("intent", "uploadPhoto");
        const mockFile = new UndiciFile(["fake image data"], "test-photo.jpg", { type: "image/jpeg" });
        formData.append("photo", mockFile);

        const headers = new Headers();
        headers.set("Cookie", cookieValue);

        const request = new UndiciRequest("http://localhost:3000/account/settings", {
          method: "POST",
          headers,
          body: formData,
          duplex: "half",
        });

        const result = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.success).toBe(true);

        // Verify photoUrl was updated in database
        const updatedUser = await db.user.findUnique({ where: { id: testUserId } });
        expect(updatedUser?.photoUrl).toBe(result.photoUrl);
      });
    });

    describe("action - photo removal", () => {
      it("should successfully remove photo and reset to default", async () => {
        // First, set a custom photo
        await db.user.update({
          where: { id: testUserId },
          data: { photoUrl: "https://example.com/custom-photo.jpg" },
        });

        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const formData = new FormData();
        formData.append("intent", "removePhoto");

        const headers = new Headers();
        headers.set("Cookie", cookieValue);
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        const request = new UndiciRequest("http://localhost:3000/account/settings", {
          method: "POST",
          headers,
          body: new URLSearchParams(formData as any).toString(),
        });

        const result = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.success).toBe(true);

        // Verify photoUrl was reset to null in database
        const updatedUser = await db.user.findUnique({ where: { id: testUserId } });
        expect(updatedUser?.photoUrl).toBeNull();
      });

      it("should return success even if user already has no photo", async () => {
        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const formData = new FormData();
        formData.append("intent", "removePhoto");

        const headers = new Headers();
        headers.set("Cookie", cookieValue);
        headers.set("Content-Type", "application/x-www-form-urlencoded");

        const request = new UndiciRequest("http://localhost:3000/account/settings", {
          method: "POST",
          headers,
          body: new URLSearchParams(formData as any).toString(),
        });

        const result = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.success).toBe(true);
      });
    });

    describe("action - photo change (replace existing)", () => {
      it("should successfully replace existing photo with new one", async () => {
        // First, set a custom photo
        await db.user.update({
          where: { id: testUserId },
          data: { photoUrl: "https://example.com/old-photo.jpg" },
        });

        const session = await sessionStorage.getSession();
        session.set("userId", testUserId);
        const setCookieHeader = await sessionStorage.commitSession(session);
        const cookieValue = setCookieHeader.split(";")[0];

        const formData = new UndiciFormData();
        formData.append("intent", "uploadPhoto");
        const mockFile = new UndiciFile(["new image data"], "new-photo.png", { type: "image/png" });
        formData.append("photo", mockFile);

        const headers = new Headers();
        headers.set("Cookie", cookieValue);

        const request = new UndiciRequest("http://localhost:3000/account/settings", {
          method: "POST",
          headers,
          body: formData,
          duplex: "half",
        });

        const result = await action({
          request,
          context: { cloudflare: { env: null } },
          params: {},
        } as any);

        expect(result.success).toBe(true);

        // Verify photoUrl was changed to a new URL
        const updatedUser = await db.user.findUnique({ where: { id: testUserId } });
        expect(updatedUser?.photoUrl).not.toBe("https://example.com/old-photo.jpg");
        expect(updatedUser?.photoUrl).toBe(result.photoUrl);
      });
    });
  });
});
