import express, { type Request, Response, NextFunction } from "express";
import compression from "compression";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { configureAuth, setupAuthRoutes, ensureAdminUser } from "./auth";
import { csrfProtection, csrfTokenEndpoint } from "./csrf";

/**
 * Validate required environment variables at startup
 * Shows clear Hebrew messages for missing configuration
 */
function validateStartupEnvironment(): void {
  console.log("\n🔍 בודק הגדרות סביבה...\n");

  const errors: string[] = [];
  const warnings: string[] = [];

  // Required: Database (Railway)
  if (!process.env.DATABASE_PUBLIC_URL) {
    errors.push("❌ DATABASE_PUBLIC_URL - חיבור למסד נתונים Railway לא מוגדר");
  } else {
    console.log("✅ DATABASE_PUBLIC_URL - מסד נתונים Railway מוגדר");
  }

  // Required for AI features: Google API Key (Gemini)
  if (!process.env.GOOGLE_API_KEY) {
    warnings.push("⚠️  GOOGLE_API_KEY - מפתח Google Gemini לא מוגדר (עיבוד PDF לא יעבוד)");
    console.log("⚠️  GOOGLE_API_KEY - לא מוגדר (עיבוד PDF לא יעבוד ללא מפתח)");
  } else {
    console.log("✅ GOOGLE_API_KEY - מוגדר");
  }

  // Security: Session Secret
  const isProduction = process.env.NODE_ENV === "production";
  if (!process.env.SESSION_SECRET) {
    if (isProduction) {
      errors.push("❌ SESSION_SECRET - סוד ה-session לא מוגדר (חובה בסביבת production)");
    } else {
      warnings.push("⚠️  SESSION_SECRET - לא מוגדר (sessions יאופסו בכל הפעלה מחדש)");
      console.log("⚠️  SESSION_SECRET - לא מוגדר (sessions יאופסו בכל הפעלה מחדש)");
    }
  } else {
    console.log("✅ SESSION_SECRET - מוגדר");
  }

  // Security: Admin Password
  if (!process.env.ADMIN_PASSWORD) {
    if (isProduction) {
      errors.push("❌ ADMIN_PASSWORD - סיסמת אדמין לא מוגדרת (חובה בסביבת production)");
    } else {
      warnings.push("⚠️  ADMIN_PASSWORD - לא מוגדר (ישתמש בסיסמת ברירת מחדל)");
      console.log("⚠️  ADMIN_PASSWORD - לא מוגדר (ישתמש בסיסמת ברירת מחדל)");
    }
  } else {
    console.log("✅ ADMIN_PASSWORD - מוגדר");
  }

  // Show summary
  console.log("\n" + "─".repeat(50));

  if (errors.length > 0) {
    console.error("\n🚨 שגיאות קריטיות - השרת לא יפעל כראוי:\n");
    errors.forEach(e => console.error(`   ${e}`));
    console.error("\nעיין בקובץ .env.example לדוגמאות הגדרה\n");
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  אזהרות - חלק מהתכונות לא יפעלו:\n");
    warnings.forEach(w => console.warn(`   ${w}`));
    console.log("");
  }

  if (errors.length === 0 && warnings.length === 0) {
    console.log("\n✅ כל ההגדרות תקינות!\n");
  }

  console.log("─".repeat(50) + "\n");
}

// Run startup validation
validateStartupEnvironment();

const app = express();
const httpServer = createServer(app);

// Health check endpoint (before any middleware)
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Compress responses
app.use(compression());

// Trust proxy for rate limiting and X-Forwarded-For headers
app.set("trust proxy", 1);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());

// Security headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'", "https:", "wss:"],
        frameSrc: ["'self'", "https://www.youtube.com", "https://player.vimeo.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Allow embedding images from CDN
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting configuration
const createRateLimiter = (windowMs: number, max: number, message: string) =>
  rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    // Use default keyGenerator which properly handles IPv6
    // Express trust proxy setting handles X-Forwarded-For
  });

// Strict rate limit for leads (5 per minute)
const leadsRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  5,
  "יותר מדי בקשות. נסה שוב בעוד דקה."
);

// Strict rate limit for login (10 per minute)
const loginRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  10,
  "יותר מדי ניסיונות התחברות. נסה שוב בעוד דקה."
);

// General API rate limit (100 per minute)
const apiRateLimiter = createRateLimiter(
  60 * 1000, // 1 minute
  100,
  "יותר מדי בקשות. נסה שוב בעוד דקה."
);

// Apply rate limiters to specific routes
app.use("/api/leads", leadsRateLimiter);
app.use("/api/auth/login", loginRateLimiter);
app.use("/api", apiRateLimiter);

// Configure authentication
configureAuth(app);
setupAuthRoutes(app);

// CSRF protection for API routes (after auth is configured)
app.get("/api/csrf-token", csrfTokenEndpoint);
app.use("/api", csrfProtection);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Ensure admin user exists
  await ensureAdminUser();

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = process.env.NODE_ENV === "production"
      ? "Internal Server Error"
      : (err.message || "Internal Server Error");

    console.error(err);
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Default to 3001 for local development
  // this serves both the API and the client.
  const port = parseInt(process.env.PORT || "3001", 10);
  httpServer.listen(
    {
      port,
      host: process.env.HOST || "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
