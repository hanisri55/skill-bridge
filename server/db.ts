import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { PGlite } from "@electric-sql/pglite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pgliteInstance: PGlite | null = null;
let pgPool: pg.Pool | null = null;

export async function initDb(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    console.log("[DB] Connecting to external PostgreSQL instance...");
    const isProduction = process.env.NODE_ENV === "production";
    const useSsl =
      isProduction ||
      databaseUrl.includes("supabase") ||
      databaseUrl.includes("sslmode=require") ||
      databaseUrl.includes("render");

    pgPool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
    });
  } else {
    const dataDir = path.resolve(__dirname, "..", "data", "postgres");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    console.log(`[DB] Initializing local PostgreSQL instance (data: ${dataDir})...`);
    pgliteInstance = new PGlite(dataDir);
  }

  // Run schema migrations safely (supports multi-statement SQL scripts)
  const possibleSchemaPaths = [
    path.resolve(__dirname, "schema.sql"),
    path.resolve(__dirname, "..", "server", "schema.sql"),
    path.resolve(process.cwd(), "server", "schema.sql"),
    path.resolve(process.cwd(), "dist", "schema.sql"),
  ];
  const schemaPath = possibleSchemaPaths.find((p) => fs.existsSync(p));

  if (schemaPath) {
    const schemaSql = fs.readFileSync(schemaPath, "utf-8");
    if (pgliteInstance) {
      await pgliteInstance.exec(schemaSql);
    } else if (pgPool) {
      await pgPool.query(schemaSql);
    }
    console.log(`[DB] PostgreSQL schema verified / created successfully (from ${schemaPath}).`);
  } else {
    console.warn("[DB] Warning: schema.sql not found at standard paths. Assuming schema is already provisioned.");
  }
}

export async function query<T = any>(
  text: string,
  params: any[] = []
): Promise<{ rows: T[]; rowCount: number }> {
  if (pgPool) {
    const res = await pgPool.query(text, params);
    return { rows: res.rows as T[], rowCount: res.rowCount ?? 0 };
  }

  if (!pgliteInstance) {
    await initDb();
  }

  const res = await pgliteInstance!.query<T>(text, params);
  return { rows: res.rows, rowCount: res.rows.length };
}

export async function closeDb(): Promise<void> {
  if (pgPool) {
    await pgPool.end();
  }
  if (pgliteInstance) {
    await pgliteInstance.close();
  }
}
