import { z } from "zod";
import { collection } from "@/lib/api/crudRoute";
import { ApiError, handleError, ok, readJson } from "@/lib/api/respond";
import { getStockRestante } from "@/lib/calcStock";
import * as crud from "@/lib/services/crud";

export const { GET } = collection("entrega");

const idArticuloSchema = z.coerce.number().int().positive();

/**
 * Cada entrega resta 1 al stock del articulo: no se puede entregar uno que
 * ya esta en 0 (o negativo). Si id_articulo ni siquiera es valido, se deja
 * pasar sin chequear stock: el error de forma lo da la validacion generica.
 */
export async function POST(request) {
  try {
    const raw = await readJson(request);
    const idArticulo = idArticuloSchema.safeParse(raw.id_articulo);

    if (idArticulo.success) {
      const stock = await getStockRestante(idArticulo.data);
      if (stock <= 0) {
        throw new ApiError("VALIDATION", "Hay campos con errores", {
          id_articulo: "No hay stock disponible para este artículo",
        });
      }
    }

    return ok(await crud.create("entrega", raw), { status: 201 });
  } catch (error) {
    return handleError(error, { label: "entrega" });
  }
}
