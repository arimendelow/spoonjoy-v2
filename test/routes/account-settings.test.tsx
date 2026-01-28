import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Request as UndiciRequest } from "undici";
import { render, screen } from "@testing-library/react";
import { createTestRoutesStub } from "../utils";
import { db } from "~/lib/db.server";
import { createUser } from "~/lib/auth.server";
import { sessionStorage } from "~/lib/session.server";
import { cleanupDatabase } from "../helpers/cleanup";
import { faker } from "@faker-js/faker";

// Import loader and component from the route
import AccountSettings, { loader } from "~/routes/account.settings";

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
  });
});
