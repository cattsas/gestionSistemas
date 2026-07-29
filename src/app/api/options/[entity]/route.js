/**
 * Opciones { value, label } de una entidad, para poblar los <select> de las
 * claves foraneas. Reemplaza a /api/enums, que solo cubria los dos enums y
 * mantenia un diccionario a mano.
 */
import { getEntity } from "@/lib/entities";
import { listOptions } from "@/lib/services/crud";
import { fail, handleError, ok } from "@/lib/api/respond";

export async function GET(request, context) {
  const { entity } = await context.params;

  if (!getEntity(entity)) {
    return fail("NOT_FOUND", `La entidad "${entity}" no existe`);
  }

  try {
    return ok(await listOptions(entity));
  } catch (error) {
    return handleError(error, { label: entity });
  }
}
