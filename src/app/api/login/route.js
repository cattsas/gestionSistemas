import bcrypt from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { COOKIE, cookieOptions, signSession } from "@/lib/auth/session";
import { fail, handleError, ok, readJson } from "@/lib/api/respond";

// bcryptjs es JS puro, pero la ruta consulta la base: runtime Node, no Edge.
export const runtime = "nodejs";

const schema = z.object({
  usuario: z.string().trim().min(1, "Ingrese el usuario"),
  pass: z.string().min(1, "Ingrese la contraseña"),
});

/**
 * Hash descartable contra el que se compara cuando el usuario no existe, para
 * que el tiempo de respuesta no delate si el nombre esta registrado.
 */
const HASH_DUMMY = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8DFPO0lXcVvJXTBLsFmHXhKQGYbEeq";

// Limitador simple por IP. Vive en memoria: alcanza para un sistema interno de
// una sola instancia, pero no sobrevive a un reinicio ni se comparte entre
// procesos.
const intentos = new Map();
const MAX_INTENTOS = 5;
const VENTANA_MS = 15 * 60 * 1000;

function limiteAlcanzado(ip) {
  const ahora = Date.now();
  const registro = intentos.get(ip);

  if (!registro || ahora - registro.desde > VENTANA_MS) {
    intentos.set(ip, { desde: ahora, n: 1 });
    return false;
  }

  registro.n += 1;
  return registro.n > MAX_INTENTOS;
}

export async function POST(request) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "desconocida";

    if (limiteAlcanzado(ip)) {
      return fail("CONFLICT", "Demasiados intentos fallidos. Espere unos minutos.");
    }

    const { usuario, pass } = schema.parse(await readJson(request));

    const user = await prisma.usuario.findUnique({ where: { usuario } });

    // Se compara siempre, exista o no el usuario, para no filtrar por tiempo.
    const valido = await bcrypt.compare(pass, user?.pass ?? HASH_DUMMY);

    // Una sola respuesta para "no existe" y para "contrasena incorrecta": antes
    // eran 404 y 401, lo que permitia enumerar usuarios validos.
    if (!user || !valido) {
      return fail("UNAUTHENTICATED", "Usuario o contraseña incorrectos");
    }

    intentos.delete(ip);

    const respuesta = ok({ usuario: user.usuario });
    respuesta.cookies.set(
      COOKIE,
      await signSession({ sub: user.id, usuario: user.usuario }),
      cookieOptions()
    );
    return respuesta;
  } catch (error) {
    return handleError(error, { label: "login" });
  }
}
