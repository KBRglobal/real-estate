import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { csrfProtection, csrfTokenEndpoint } from "../csrf";

function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    method: "GET",
    path: "/api/test",
    cookies: {},
    headers: {},
    ...overrides,
  } as unknown as Request;
}

function createMockResponse(): Response & { cookieData: Record<string, any> } {
  const cookieData: Record<string, any> = {};
  const res: Partial<Response> & { cookieData: Record<string, any> } = {
    cookieData,
    cookie: vi.fn((name: string, value: string, options?: any) => {
      cookieData[name] = { value, options };
      return res;
    }),
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response & { cookieData: Record<string, any> };
}

describe("CSRF Protection", () => {
  describe("csrfProtection middleware", () => {
    it("should allow GET requests without CSRF token", () => {
      const req = createMockRequest({ method: "GET" });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should allow HEAD requests without CSRF token", () => {
      const req = createMockRequest({ method: "HEAD" });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should allow OPTIONS requests without CSRF token", () => {
      const req = createMockRequest({ method: "OPTIONS" });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should generate and set a CSRF token cookie when none exists", () => {
      const req = createMockRequest({ method: "GET", cookies: {} });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.cookieData["csrf-token"]).toBeDefined();
      expect(res.cookieData["csrf-token"].value).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it("should not regenerate token if one exists in cookie", () => {
      const existingToken = "a".repeat(64);
      const req = createMockRequest({
        method: "GET",
        cookies: { "csrf-token": existingToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(res.cookie).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it("should allow POST to public lead creation endpoint without CSRF", () => {
      const req = createMockRequest({
        method: "POST",
        path: "/api/leads",
        cookies: { "csrf-token": "sometoken" },
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should allow POST to login endpoint without CSRF", () => {
      const req = createMockRequest({
        method: "POST",
        path: "/api/auth/login",
        cookies: { "csrf-token": "sometoken" },
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should reject POST request with missing CSRF token in header", () => {
      const token = "valid-token-123";
      const req = createMockRequest({
        method: "POST",
        path: "/api/projects",
        cookies: { "csrf-token": token },
        headers: {},
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "CSRF token validation failed",
        code: "CSRF_INVALID",
      });
    });

    it("should reject POST request with mismatched CSRF token", () => {
      const cookieToken = "cookie-token-123";
      const headerToken = "header-token-456";
      const req = createMockRequest({
        method: "POST",
        path: "/api/projects",
        cookies: { "csrf-token": cookieToken },
        headers: { "x-csrf-token": headerToken },
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should allow POST request with valid matching CSRF token", () => {
      const token = "valid-token-123";
      const req = createMockRequest({
        method: "POST",
        path: "/api/projects",
        cookies: { "csrf-token": token },
        headers: { "x-csrf-token": token },
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should reject PUT request without CSRF token", () => {
      const token = "valid-token-123";
      const req = createMockRequest({
        method: "PUT",
        path: "/api/projects/1",
        cookies: { "csrf-token": token },
        headers: {},
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should reject DELETE request without CSRF token", () => {
      const token = "valid-token-123";
      const req = createMockRequest({
        method: "DELETE",
        path: "/api/projects/1",
        cookies: { "csrf-token": token },
        headers: {},
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it("should allow DELETE request with valid CSRF token", () => {
      const token = "valid-token-123";
      const req = createMockRequest({
        method: "DELETE",
        path: "/api/projects/1",
        cookies: { "csrf-token": token },
        headers: { "x-csrf-token": token },
      });
      const res = createMockResponse();
      const next = vi.fn();

      csrfProtection(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe("csrfTokenEndpoint", () => {
    it("should return existing token from cookie", () => {
      const existingToken = "existing-token-abc";
      const req = createMockRequest({
        cookies: { "csrf-token": existingToken },
      });
      const res = createMockResponse();

      csrfTokenEndpoint(req, res);

      expect(res.json).toHaveBeenCalledWith({ token: existingToken });
      expect(res.cookie).not.toHaveBeenCalled();
    });

    it("should generate new token if none exists", () => {
      const req = createMockRequest({ cookies: {} });
      const res = createMockResponse();

      csrfTokenEndpoint(req, res);

      expect(res.cookie).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
      const jsonCall = vi.mocked(res.json).mock.calls[0][0];
      expect(jsonCall.token).toHaveLength(64);
    });

    it("should set cookie with correct options", () => {
      const req = createMockRequest({ cookies: {} });
      const res = createMockResponse();

      csrfTokenEndpoint(req, res);

      const cookieCall = res.cookieData["csrf-token"];
      expect(cookieCall.options.httpOnly).toBe(false);
      expect(cookieCall.options.sameSite).toBe("lax");
      expect(cookieCall.options.maxAge).toBe(24 * 60 * 60 * 1000);
    });
  });
});
