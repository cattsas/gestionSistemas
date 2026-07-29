/**
 * Vista tipo remito de una compra: cabecera + lineas + total.
 *
 * Antes vivia en /api/compra/[id], que por eso consultaba el modelo `lista` en
 * lugar de `compra` y dejaba a la compra sin un GET-by-id real.
 */
import prisma from "@/lib/prisma";
import { ApiError, handleError, ok, parseId } from "@/lib/api/respond";

export async function GET(request, context) {
  let id;
  try {
    id = parseId((await context.params).id);

    const compra = await prisma.compra.findUnique({
      where: { id },
      include: {
        proveedorRef: true,
        lineas: { include: { articuloRef: true }, orderBy: { id: "asc" } },
      },
    });

    if (!compra) throw new ApiError("NOT_FOUND", `No se encontró la compra con id ${id}`);

    return ok({
      id: compra.id,
      fecha: compra.fecha.toISOString().slice(0, 10),
      proveedor: compra.proveedorRef?.nombre ?? null,
      importe_total: compra.importe_total,
      lineas: compra.lineas.map((l) => ({
        id: l.id,
        articulo: l.articuloRef?.descripcion ?? null,
        cantidad: l.cantidad,
        precio_unitario: l.precio_unitario,
        precio_total: l.precio_total,
      })),
    });
  } catch (error) {
    return handleError(error, { label: "compra", id });
  }
}
