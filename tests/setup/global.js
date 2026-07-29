import { execSync } from "node:child_process";

/** Deja el esquema de la base de tests al dia una sola vez por corrida. */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("Falta TEST_DATABASE_URL en el entorno");

  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
