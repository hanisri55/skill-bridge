import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const tsxBin = path.join(rootDir, "node_modules", ".bin", "tsx");
const viteBin = path.join(rootDir, "node_modules", ".bin", "vite");

console.log("\x1b[32m[SkillBridge AI]\x1b[0m Launching unified full-stack development environment...");
console.log("\x1b[36m[Backend]\x1b[0m Initializing Express + PostgreSQL server on http://localhost:3001");
console.log("\x1b[35m[Frontend]\x1b[0m Initializing Vite server on http://localhost:3000 (proxying /api -> 3001)\n");

const nodeBinDir = path.resolve(rootDir, "..", "node", "bin");
const customPath = `${nodeBinDir}:${process.env.PATH || ""}`;

// Spawn Backend
const backend = spawn(tsxBin, ["watch", "server/index.ts"], {
  cwd: rootDir,
  env: { ...process.env, PATH: customPath, PORT: "3001" },
  shell: true,
});

backend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[36m[Backend]\x1b[0m ${data}`);
});

backend.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[31m[Backend Error]\x1b[0m ${data}`);
});

// Spawn Frontend
const frontend = spawn(viteBin, ["--host"], {
  cwd: rootDir,
  env: { ...process.env, PATH: customPath },
  shell: true,
});

frontend.stdout.on("data", (data) => {
  process.stdout.write(`\x1b[35m[Frontend]\x1b[0m ${data}`);
});

frontend.stderr.on("data", (data) => {
  process.stderr.write(`\x1b[33m[Frontend]\x1b[0m ${data}`);
});

function cleanup() {
  console.log("\n\x1b[32m[SkillBridge AI]\x1b[0m Shutting down full-stack development services...");
  try {
    backend.kill();
    frontend.kill();
  } catch {}
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

backend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.log(`\x1b[31m[Backend]\x1b[0m Exited with code ${code}`);
  }
});

frontend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.log(`\x1b[33m[Frontend]\x1b[0m Exited with code ${code}`);
  }
});
