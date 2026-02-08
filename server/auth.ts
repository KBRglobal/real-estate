import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import type { Express, Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { randomUUID, randomBytes } from "crypto";

// Rate limiting for login attempts
interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
}

const loginRateLimits = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_LOGIN_ATTEMPTS = 5;

/**
 * Clean up expired rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of Array.from(loginRateLimits.entries())) {
    if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
      loginRateLimits.delete(ip);
    }
  }
}, 60 * 1000); // Clean up every minute

/**
 * Check if an IP has exceeded login rate limit
 */
function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const entry = loginRateLimits.get(ip);

  if (!entry) {
    return { allowed: true };
  }

  // If the window has expired, reset
  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimits.delete(ip);
    return { allowed: true };
  }

  // Check if attempts exceeded
  if (entry.attempts >= MAX_LOGIN_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - entry.firstAttempt)) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  return { allowed: true };
}

/**
 * Record a login attempt for an IP
 */
function recordLoginAttempt(ip: string): void {
  const now = Date.now();
  const entry = loginRateLimits.get(ip);

  if (!entry || now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    loginRateLimits.set(ip, { attempts: 1, firstAttempt: now });
  } else {
    entry.attempts++;
  }
}

/**
 * Clear rate limit for an IP after successful login
 */
function clearLoginRateLimit(ip: string): void {
  loginRateLimits.delete(ip);
}

// Extend session to include user info
declare module "express-session" {
  interface SessionData {
    userId?: string;
    username?: string;
    role?: string;
  }
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      email: string;
      role: string;
      permissions: Record<string, boolean> | null;
    }
  }
}

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Configure authentication middleware for the Express app
 */
export function configureAuth(app: Express): void {
  // Configure session store with PostgreSQL
  const PgSession = connectPgSimple(session);

  const sessionSecret = process.env.SESSION_SECRET || "ddl-session-secret-change-in-production-" + randomUUID();

  if (!process.env.SESSION_SECRET) {
    console.warn("Warning: SESSION_SECRET not set. Using generated secret (sessions will be invalidated on restart).");
  }

  const databaseUrl = process.env.DATABASE_PUBLIC_URL;

  app.use(
    session({
      store: new PgSession({
        conString: databaseUrl,
        tableName: "user_sessions",
        createTableIfMissing: true,
      }),
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "lax",
      },
      name: "ddl.sid",
    })
  );

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Passport LocalStrategy
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username",
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          const user = await storage.getUserByUsername(username);

          if (!user) {
            return done(null, false, { message: "שם משתמש או סיסמה שגויים" });
          }

          const isValid = await verifyPassword(password, user.password);

          if (!isValid) {
            return done(null, false, { message: "שם משתמש או סיסמה שגויים" });
          }

          // Update last login time
          await storage.updateUser(user.id, { lastLogin: new Date() });

          return done(null, {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || "viewer",
            permissions: user.permissions as Record<string, boolean> | null,
          });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (user) {
        done(null, {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || "viewer",
          permissions: user.permissions as Record<string, boolean> | null,
        });
      } else {
        done(null, false);
      }
    } catch (error) {
      done(error);
    }
  });
}

/**
 * Middleware to require authentication
 * Use this on routes that need protection
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Authentication required" });
}

/**
 * Middleware to require specific role
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.isAuthenticated()) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    next();
  };
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const userRole = req.user?.role;
  if (userRole !== "admin") {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
}

/**
 * Setup authentication routes
 */
export function setupAuthRoutes(app: Express): void {
  // Login route with rate limiting
  app.post("/api/auth/login", (req, res, next) => {
    // Get client IP (support proxy headers)
    const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
      || req.ip
      || req.socket.remoteAddress
      || "unknown";

    // Check rate limit before processing login
    const rateLimitCheck = checkLoginRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      res.setHeader("Retry-After", String(rateLimitCheck.retryAfterSeconds));
      return res.status(429).json({
        error: "Too many login attempts. Please try again later.",
        retryAfterSeconds: rateLimitCheck.retryAfterSeconds
      });
    }

    passport.authenticate("local", (err: Error | null, user: Express.User | false, info: { message?: string }) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        // Record failed attempt
        recordLoginAttempt(clientIp);
        return res.status(401).json({ error: info?.message || "Authentication failed" });
      }
      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((regenErr) => {
        if (regenErr) {
          return next(regenErr);
        }
        req.logIn(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          // Clear rate limit on successful login
          clearLoginRateLimit(clientIp);
          return res.json({
            success: true,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role,
            },
          });
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Session destroy error:", destroyErr);
        }
        res.clearCookie("ddl.sid");
        res.json({ success: true });
      });
    });
  });

  // Get current user
  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          email: req.user.email,
          role: req.user.role,
        },
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Change password route (authenticated users only)
  app.post("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Current and new password are required" });
      }

      // Validate password strength
      if (newPassword.length < 8) {
        return res.status(400).json({
          error: "Password must be at least 8 characters and include uppercase, lowercase, and a number"
        });
      }
      if (!/[A-Z]/.test(newPassword)) {
        return res.status(400).json({
          error: "Password must contain at least one uppercase letter"
        });
      }
      if (!/[a-z]/.test(newPassword)) {
        return res.status(400).json({
          error: "Password must contain at least one lowercase letter"
        });
      }
      if (!/[0-9]/.test(newPassword)) {
        return res.status(400).json({
          error: "Password must contain at least one number"
        });
      }

      const user = await storage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await storage.updateUser(user.id, { password: hashedPassword });

      res.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Failed to change password" });
    }
  });
}

/**
 * Create default admin user if none exists
 * Call this during server startup
 */
export async function ensureAdminUser(): Promise<void> {
  try {
    const existingAdmin = await storage.getUserByUsername("admin");

    if (!existingAdmin) {
      console.log("Creating default admin user...");

      const isProduction = process.env.NODE_ENV === "production";
      let adminPassword: string;

      if (process.env.ADMIN_PASSWORD) {
        // Use the environment variable if set
        adminPassword = process.env.ADMIN_PASSWORD;
      } else if (isProduction) {
        // In production without ADMIN_PASSWORD, generate a secure random password
        console.error("❌ ADMIN_PASSWORD environment variable not set in production!");
        console.error("   Set ADMIN_PASSWORD in your environment to use a consistent password.");
        adminPassword = randomBytes(24).toString("base64");
      } else {
        // In development without ADMIN_PASSWORD, generate a random password
        adminPassword = randomBytes(16).toString("base64url");
        console.warn("⚠️  Warning: ADMIN_PASSWORD not set. Set ADMIN_PASSWORD environment variable for consistent access.");
      }

      const hashedPassword = await hashPassword(adminPassword);

      await storage.createUser({
        username: "admin",
        email: "admin@ddl.co.il",
        password: hashedPassword,
        role: "admin",
        permissions: {
          projects: true,
          leads: true,
          pages: true,
          media: true,
          miniSites: true,
          prospects: true,
          users: true,
          settings: true,
        },
      });

      console.log("Default admin user created (username: admin)");
    }
  } catch (error) {
    console.error("Error ensuring admin user:", error);
  }
}
