import { randomBytes } from "crypto";
import type { Request, Response, NextFunction } from "express";

const CSRF_TOKEN_HEADER = "x-csrf-token";
const CSRF_COOKIE_NAME = "csrf-token";
const TOKEN_LENGTH = 32;

/**
 * Generate a secure CSRF token
 */
function generateToken(): string {
  return randomBytes(TOKEN_LENGTH).toString("hex");
}

/**
 * CSRF protection middleware using double-submit cookie pattern
 *
 * How it works:
 * 1. Server sets a random CSRF token in a cookie
 * 2. Client must include the same token in a header for mutating requests
 * 3. Server validates that cookie token matches header token
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Get or generate CSRF token
  let token = req.cookies?.[CSRF_COOKIE_NAME];

  if (!token) {
    token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Must be accessible to JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  // For GET, HEAD, OPTIONS - no validation needed, just ensure token is set
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // For mutating requests, validate CSRF token
  const headerToken = req.headers[CSRF_TOKEN_HEADER];

  // Skip CSRF for API routes that are public (like lead creation from forms)
  // Note: When middleware is mounted with app.use("/api", csrfProtection),
  // req.path will be relative to /api mount point, e.g. "/leads" not "/api/leads"
  const publicRoutes = [
    "/leads", // Public lead submission from contact forms
    "/auth/login", // Login doesn't need CSRF (session not yet established)
    "/chat", // AI chat widget - public endpoint with streaming
  ];

  if (req.method === "POST" && publicRoutes.includes(req.path)) {
    return next();
  }

  if (!headerToken || headerToken !== token) {
    res.status(403).json({
      error: "CSRF token validation failed",
      code: "CSRF_INVALID"
    });
    return;
  }

  next();
}

/**
 * Endpoint to get a fresh CSRF token
 * Client should call this on app initialization
 */
export function csrfTokenEndpoint(req: Request, res: Response): void {
  let token = req.cookies?.[CSRF_COOKIE_NAME];

  if (!token) {
    token = generateToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });
  }

  res.json({ token });
}
