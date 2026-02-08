import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";

// Mock the storage module before importing auth
vi.mock("../storage", () => ({
  storage: {
    getUserByUsername: vi.fn(),
    getUser: vi.fn(),
    updateUser: vi.fn(),
    createUser: vi.fn(),
  },
}));

// Mock connect-pg-simple to avoid DB connection
vi.mock("connect-pg-simple", () => ({
  default: vi.fn(() => class MockPgSession {}),
}));

import { hashPassword, verifyPassword, requireAuth, requireAdmin, requireRole } from "../auth";

// Mock express request/response
function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    isAuthenticated: vi.fn().mockReturnValue(false),
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

function createMockResponse(): Response {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as Response;
}

describe("Password Hashing", () => {
  it("should hash a password", async () => {
    const password = "testPassword123";
    const hash = await hashPassword(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    expect(hash.startsWith("$2")).toBe(true); // bcrypt hash prefix
  });

  it("should verify a correct password", async () => {
    const password = "testPassword123";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it("should reject an incorrect password", async () => {
    const password = "testPassword123";
    const wrongPassword = "wrongPassword456";
    const hash = await hashPassword(password);

    const isValid = await verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it("should produce different hashes for the same password", async () => {
    const password = "testPassword123";
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);

    expect(hash1).not.toBe(hash2);
    // But both should verify correctly
    expect(await verifyPassword(password, hash1)).toBe(true);
    expect(await verifyPassword(password, hash2)).toBe(true);
  });
});

describe("requireAuth Middleware", () => {
  it("should call next() when user is authenticated", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(true),
    });
    const res = createMockResponse();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 401 when user is not authenticated", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(false),
    });
    const res = createMockResponse();
    const next = vi.fn();

    requireAuth(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });
});

describe("requireAdmin Middleware", () => {
  it("should call next() when user is admin", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(true),
      user: { id: "1", username: "admin", email: "admin@test.com", role: "admin", permissions: null },
    });
    const res = createMockResponse();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 401 when user is not authenticated", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(false),
    });
    const res = createMockResponse();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Authentication required" });
  });

  it("should return 403 when user is not admin", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(true),
      user: { id: "1", username: "viewer", email: "viewer@test.com", role: "viewer", permissions: null },
    });
    const res = createMockResponse();
    const next = vi.fn();

    requireAdmin(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Admin access required" });
  });
});

describe("requireRole Middleware", () => {
  it("should call next() when user has required role", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(true),
      user: { id: "1", username: "editor", email: "editor@test.com", role: "editor", permissions: null },
    });
    const res = createMockResponse();
    const next = vi.fn();

    const middleware = requireRole("editor", "admin");
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 401 when user is not authenticated", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(false),
    });
    const res = createMockResponse();
    const next = vi.fn();

    const middleware = requireRole("editor");
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should return 403 when user does not have required role", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(true),
      user: { id: "1", username: "viewer", email: "viewer@test.com", role: "viewer", permissions: null },
    });
    const res = createMockResponse();
    const next = vi.fn();

    const middleware = requireRole("editor", "admin");
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Insufficient permissions" });
  });

  it("should allow admin when admin is in the allowed roles", () => {
    const req = createMockRequest({
      isAuthenticated: vi.fn().mockReturnValue(true),
      user: { id: "1", username: "admin", email: "admin@test.com", role: "admin", permissions: null },
    });
    const res = createMockResponse();
    const next = vi.fn();

    const middleware = requireRole("editor", "admin");
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
