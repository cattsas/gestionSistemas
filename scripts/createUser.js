/**
 * Alta de usuarios desde la consola del servidor.
 *
 *   npm run user:create -- <usuario> [password]
 *
 * Existe porque POST /api/usuario requiere sesion: si no queda ninguna
 * credencial valida, este es el unico camino de recuperacion. Si no se pasa
 * password, se genera una aleatoria y se imprime una sola vez.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

const prisma = new PrismaClient();

async function main() {
  const [usuario, passArg] = process.argv.slice(2);

  if (!usuario) {
    console.error("Uso: npm run user:create -- <usuario> [password]");
    process.exit(1);
  }

  if (usuario.length > 30) {
    console.error("El nombre de usuario no puede superar los 30 caracteres.");
    process.exit(1);
  }

  const existente = await prisma.usuario.findUnique({ where: { usuario } });
  if (existente) {
    console.error(`El usuario "${usuario}" ya existe.`);
    process.exit(1);
  }

  const pass = passArg || crypto.randomBytes(12).toString("base64url");
  if (pass.length < 8) {
    console.error("La password debe tener al menos 8 caracteres.");
    process.exit(1);
  }

  await prisma.usuario.create({
    data: { usuario, pass: await bcrypt.hash(pass, 10) },
  });

  console.log(`\nUsuario "${usuario}" creado.`);
  if (!passArg) {
    console.log(`Password generada: ${pass}`);
    console.log("Guardala: no se vuelve a mostrar.\n");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Error:", error.message);
    await prisma.$disconnect();
    process.exit(1);
  });
