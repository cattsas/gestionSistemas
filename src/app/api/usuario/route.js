import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/getSession";
import { ApiError, handleError, ok, readJson } from "@/lib/api/respond";
import { collection } from "@/lib/api/crudRoute";
import { create } from "@/lib/services/crud";

// bcryptjs es JS puro, pero la ruta consulta la base: runtime Node, no Edge.
export const runtime = "nodejs";

export const { GET } = collection("usuario");

/**
 * Crear un usuario reautentica a quien esta logueado: la contrasena que se
 * confirma es la propia, no la del usuario nuevo, igual que al borrar.
 */
export async function POST(request) {
  try {
    const { confirmarPass, ...body } = await readJson(request);

    const session = await getSession();
    if (!session) throw new ApiError("UNAUTHENTICATED", "Sesión requerida");

    const actual = await prisma.usuario.findUnique({ where: { id: Number(session.sub) } });
    const valido = actual && (await bcrypt.compare(confirmarPass ?? "", actual.pass));

    if (!valido) {
      throw new ApiError("VALIDATION", "Contraseña incorrecta", {
        confirmarPass: "Contraseña incorrecta",
      });
    }

    return ok(await create("usuario", body), { status: 201 });
  } catch (error) {
    return handleError(error, { label: "usuario" });
  }
}
