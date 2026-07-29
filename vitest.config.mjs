import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Vitest no lee .env por su cuenta. Se carga aca porque este archivo se
 * evalua antes que globalSetup, que necesita TEST_DATABASE_URL.
 * Se parsea a mano para no depender de dotenv ni de una transitiva de vite.
 */
function cargarEnv(archivo = ".env") {
  if (!existsSync(archivo)) return;

  for (const linea of readFileSync(archivo, "utf8").split("\n")) {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) continue;

    const corte = limpia.indexOf("=");
    if (corte === -1) continue;

    const clave = limpia.slice(0, corte).trim();
    const valor = limpia.slice(corte + 1).trim().replace(/^["']|["']$/g, "");
    // Lo que ya venga del entorno (por ejemplo, en CI) tiene prioridad.
    process.env[clave] ??= valor;
  }
}

cargarEnv();

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: true,
    globalSetup: ["./tests/setup/global.js"],
    setupFiles: ["./tests/setup/env.js"],
    // Los tests comparten una unica base: en paralelo se pisan entre si.
    poolOptions: { threads: { singleThread: true } },
    fileParallelism: false,
    include: ["tests/**/*.test.js"],
  },
});
