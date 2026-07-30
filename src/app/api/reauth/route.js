import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/getSession";
import { ApiError, handleError, ok, readJson } from "@/lib/api/respond";

// bcryptjs es JS puro, pero la ruta consulta la base: runtime Node, no Edge.
export const runtime = "nodejs";

/**
 * Verifica la contrasena de quien esta logueado, sin ningun efecto de lado.
 * La usan los modales que piden reautenticacion antes de crear o borrar un
 * usuario, para no dejar avanzar sin probar identidad. No reemplaza la
 * validacion del servidor en la accion real (POST/DELETE de usuario), que
 * vuelve a pedir y comparar la misma contrasena: este endpoint es solo UX.
 */
export async function POST(request) {
  try {
    const { pass } = await readJson(request);

    const session = await getSession();
    if (!session) throw new ApiError("UNAUTHENTICATED", "Sesión requerida");

    const actual = await prisma.usuario.findUnique({ where: { id: Number(session.sub) } });
    const valido = actual && (await bcrypt.compare(pass ?? "", actual.pass));

    if (!valido) {
      throw new ApiError("VALIDATION", "Contraseña incorrecta", { pass: "Contraseña incorrecta" });
    }

    return ok({ verificado: true });
  } catch (error) {
    return handleError(error, { label: "reauth" });
  }
}
