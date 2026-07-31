import prisma from "@/lib/prisma";
import { requireEntity } from "@/lib/entities";
import { buildInclude, serializeRow } from "@/lib/entities/helpers";
import { ApiError } from "@/lib/api/respond";
import { enrich } from "./enrichers";

/**
 * Carga manual de stock sobre un articulo ya existente, identificado por su
 * codigo (id). A diferencia de un alta, no toca descripcion/categoria/
 * proveedor: quien carga stock esta confirmando un articulo del catalogo,
 * no editandolo.
 */
export async function sumarStock(id, cantidad) {
  const entity = requireEntity("articulo");

  const row = await prisma.$transaction(async (tx) => {
    const previo = await tx.articulo.findUnique({ where: { id } });
    if (!previo) {
      throw new ApiError("VALIDATION", "Hay campos con errores", {
        id: "No existe un artículo con ese código",
      });
    }
    await tx.articulo.update({
      where: { id },
      data: { stock_inicial: { increment: cantidad } },
    });
    return tx.articulo.findUnique({ where: { id }, include: buildInclude(entity) });
  });

  const [serialized] = await enrich("articulo", [serializeRow(entity, row)]);
  return serialized;
}
