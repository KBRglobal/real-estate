import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  // Serve favicon and icons with short cache to allow updates
  app.use(/^\/(favicon|apple-touch-icon)/, express.static(distPath, { maxAge: '1h', etag: true }));

  // Serve hashed assets with long cache (JS/CSS/images in /assets/)
  app.use("/assets", express.static(path.join(distPath, "assets"), { maxAge: '1y', immutable: true }));

  // Serve other static files (robots.txt, manifest, etc.) with short cache
  app.use(express.static(distPath, { maxAge: '1h', etag: true, index: false }));

  // SPA fallback: serve index.html with no cache for all routes
  app.use("*", (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
