/**
 * Se ejecuta antes de importar cualquier test.
 *
 * src/lib/prisma.js instancia el cliente al importarse leyendo DATABASE_URL,
 * asi que hay que apuntarla a la base de tests ANTES de que eso ocurra.
 */
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
process.env.AUTH_SECRET ??= "secreto-solo-para-tests-no-usar-en-produccion";
process.env.COOKIE_SECURE = "false";

if (!process.env.DATABASE_URL?.includes("test")) {
  throw new Error(
    `Los tests truncan todas las tablas y DATABASE_URL no apunta a una base de test: ${process.env.DATABASE_URL}`
  );
}
