import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/getSession";
import { ApiError, handleError, ok, parseId, readJson } from "@/lib/api/respond";
import { item } from "@/lib/api/crudRoute";
import { remove } from "@/lib/services/crud";

// bcryptjs es JS puro, pero la ruta consulta la base: runtime Node, no Edge.
export const runtime = "nodejs";

export const { GET, PUT } = item("usuario");

/**
 * Borrar un usuario reautentica a quien esta logueado: hay que probar que sos
 * vos con tu propia contrasena, no la del usuario que se borra. Por eso no
 * usa el factory generico como GET/PUT.
 */
export async function DELETE(request, context) {
  let id;
  try {
    id = parseId((await context.params).id);
    const { pass } = await readJson(request);

    const session = await getSession();
    if (!session) throw new ApiError("UNAUTHENTICATED", "Sesión requerida");

    if (Number(session.sub) === id) {
      throw new ApiError("CONFLICT", "No podés eliminar tu propio usuario");
    }

    const actual = await prisma.usuario.findUnique({ where: { id: Number(session.sub) } });
    const valido = actual && (await bcrypt.compare(pass ?? "", actual.pass));

    if (!valido) {
      throw new ApiError("VALIDATION", "Contraseña incorrecta", { pass: "Contraseña incorrecta" });
    }

    return ok(await remove("usuario", id), { message: "Usuario eliminado" });
  } catch (error) {
    return handleError(error, { label: "usuario", id });
  }
}
