import { z } from "zod";
import { item } from "@/lib/api/crudRoute";
import { ApiError, handleError, ok, parseId, readJson } from "@/lib/api/respond";
import { getStockRestante } from "@/lib/calcStock";
import * as crud from "@/lib/services/crud";

export const { GET, DELETE } = item("entrega");

const idArticuloSchema = z.coerce.number().int().positive();

/**
 * Editar una entrega solo exige stock si cambia de articulo: si es el mismo
 * de siempre, esta entrega ya esta descontada de su stock actual.
 */
export async function PUT(request, context) {
  let id;
  try {
    id = parseId((await context.params).id);
    const raw = await readJson(request);
    const idArticulo = idArticuloSchema.safeParse(raw.id_articulo);

    if (idArticulo.success) {
      const previa = await crud.getOne("entrega", id);
      if (previa.id_articulo !== idArticulo.data) {
        const stock = await getStockRestante(idArticulo.data);
        if (stock <= 0) {
          throw new ApiError("VALIDATION", "Hay campos con errores", {
            id_articulo: "No hay stock disponible para este artículo",
          });
        }
      }
    }

    return ok(await crud.update("entrega", id, raw), { message: "Entrega actualizada" });
  } catch (error) {
    return handleError(error, { label: "entrega", id });
  }
}
