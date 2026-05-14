import express from "express";
import fs from "node:fs";
import path from "node:path";
import {
  createEntry,
  getApplicationView,
  getHardwareView,
  getInfrastructureView,
  getPlatformView,
  getSidebarView,
  getSoftwareView,
} from "./dashboard-db.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);
const projectRoot = process.cwd();
const distDir = path.resolve(projectRoot, "dist");
const indexHtmlPath = path.resolve(distDir, "index.html");

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/resources/:resource", (request, response) => {
  const { resource } = request.params;

  try {
    let payload;

    switch (resource) {
      case "applications":
        payload = getApplicationView();
        break;
      case "leftsidebar":
      case "rightsidebar":
        payload = getSidebarView(resource);
        break;
      case "infrastructure":
        payload = getInfrastructureView();
        break;
      case "platform":
        payload = getPlatformView();
        break;
      case "software":
        payload = getSoftwareView();
        break;
      case "hardware":
        payload = getHardwareView();
        break;
      default:
        response.status(404).json({ error: `Unknown resource: ${resource}` });
        return;
    }

    response.json(payload);
  } catch (caughtError) {
    response.status(500).json({
      error: caughtError instanceof Error ? caughtError.message : "Failed to load resource",
    });
  }
});

app.post("/api/entries", (request, response) => {
  try {
    const entry = createEntry(request.body ?? {});
    response.status(201).json(entry);
  } catch (caughtError) {
    response.status(400).json({
      error: caughtError instanceof Error ? caughtError.message : "Failed to create entry",
    });
  }
});

if (fs.existsSync(distDir) && fs.existsSync(indexHtmlPath)) {
  app.use(express.static(distDir));

  app.get(/^(?!\/api).*/, (_request, response) => {
    response.sendFile(indexHtmlPath);
  });
} else {
  app.get(/^(?!\/api).*/, (_request, response) => {
    response
      .status(200)
      .type("text")
      .send("Frontend bundle not found. Run npm run build or start the Vite dev server.");
  });
}

app.listen(port, () => {
  console.log(`Dashboard API listening on http://localhost:${port}`);
});