import { z } from "zod";
import { collection } from "@/lib/api/crudRoute";
import { ApiError, handleError, ok, readJson } from "@/lib/api/respond";
import * as crud from "@/lib/services/crud";
import { sumarStock } from "@/lib/services/articulo";

export const { GET } = collection("articulo");

const idSchema = z.coerce.number().int().positive();
const cantidadSchema = z.coerce.number().int().nonnegative();

/**
 * El alta de articulo tiene doble proposito: si el codigo (id) ingresado ya
 * existe, no crea una fila nueva, le suma stock a la que ya esta (sin tocar
 * descripcion/categoria/proveedor). Si el codigo no existe, es un error: para
 * dar de alta un articulo nuevo hay que dejarlo vacio.
 */
export async function POST(request) {
  try {
    const raw = await readJson(request);
    const idIngresado = raw.id === "" || raw.id == null ? null : raw.id;

    if (idIngresado != null) {
      const id = idSchema.safeParse(idIngresado);
      if (!id.success) {
        throw new ApiError("VALIDATION", "Hay campos con errores", { id: "Código inválido" });
      }

      const cantidad = cantidadSchema.safeParse(raw.stock_inicial ?? 0);
      if (!cantidad.success) {
        throw new ApiError("VALIDATION", "Hay campos con errores", {
          stock_inicial: "Debe ser 0 o mayor",
        });
      }

      return ok(await sumarStock(id.data, cantidad.data), { message: "Stock actualizado" });
    }

    return ok(await crud.create("articulo", raw), { status: 201 });
  } catch (error) {
    return handleError(error, { label: "artículo" });
  }
}
