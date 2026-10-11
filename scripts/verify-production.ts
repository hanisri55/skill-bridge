import { initDb, query, closeDb } from "../server/db";
import fs from "fs";
import path from "path";

async function verifyProductionArtifacts() {
  console.log("\x1b[34m--- Verifying Production Distribution Artifacts ---\x1b[0m");

  const distDir = path.resolve(process.cwd(), "dist");
  const indexJs = path.join(distDir, "index.js");
  const schemaSql = path.join(distDir, "schema.sql");
  const publicIndex = path.join(distDir, "public", "index.html");

  if (!fs.existsSync(indexJs)) throw new Error("Missing dist/index.js");
  if (!fs.existsSync(schemaSql)) throw new Error("Missing dist/schema.sql");
  if (!fs.existsSync(publicIndex)) throw new Error("Missing dist/public/index.html");

  console.log("✔ dist/index.js exists (" + Math.round(fs.statSync(indexJs).size / 1024) + " KB)");
  console.log("✔ dist/schema.sql exists (" + Math.round(fs.statSync(schemaSql).size / 1024) + " KB)");
  console.log("✔ dist/public/index.html exists (" + Math.round(fs.statSync(publicIndex).size / 1024) + " KB)");

  // Test database connection and health query
  await initDb();
  const res = await query("SELECT 1 as test");
  if (res.rows[0]?.test !== 1 && res.rows[0]?.test !== "1") {
    throw new Error("Health check query failed");
  }
  console.log("✔ Database connection and health check query verified");

  await closeDb();
  console.log("\x1b[32m✔ Production artifacts and health check fully verified!\x1b[0m\n");
}

verifyProductionArtifacts().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
