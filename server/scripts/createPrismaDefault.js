import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { build } from "esbuild";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prismaClientDir = join(process.cwd(), "node_modules", ".prisma", "client");
const targetDefault = join(prismaClientDir, "default.js");
const targetClient = join(prismaClientDir, "client.js");
const clientTs = join(prismaClientDir, "client.ts");

async function ensureClientJs() {
  await mkdir(prismaClientDir, { recursive: true });
  const buildResult = await build({
    entryPoints: [clientTs],
    outfile: targetClient,
    bundle: true,
    platform: "node",
    format: "cjs",
    logLevel: "silent",
    sourcemap: false,
    write: true,
    // esbuild emits import_meta placeholders for ESM features; the generated
    // CommonJS bundle already emits `var import_meta = {};`. Since Node expects
    // a valid `import.meta.url` for Prisma's __dirname calculation, override
    // the placeholder with a runtime-safe value after bundling rather than
    // relying on esbuild to provide one.
  });

  const clientCode =
    buildResult.outputFiles?.[0]?.text ??
    (await (await import("node:fs/promises")).readFile(targetClient, "utf8"));
  const patched = clientCode.replace(
    "var import_meta = {};",
    "var import_meta = { url: require('node:url').pathToFileURL(__filename).href };",
  );
  await writeFile(targetClient, patched, "utf8");
}

async function ensureDefault() {
  await writeFile(targetDefault, 'module.exports = require("./client");\n', "utf8");
}

async function main() {
  await ensureClientJs();
  await ensureDefault();
}

main().catch((error) => {
  console.error("Failed to ensure Prisma client artifacts", error);
  process.exit(1);
});
