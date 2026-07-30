/**
 * Vista tipo remito de una compra: cabecera + lineas + total.
 *
 * Vive aparte de crud.js porque no sigue el patron generico de las 9
 * entidades (agrega el nombre del proveedor y del articulo, no sus ids). La
 * usan tanto la API (api/compra/[id]/detalle) como la pagina de "Ver" del
 * dashboard, para no duplicar la consulta.
 */
import prisma from "@/lib/prisma";
import { ApiError } from "@/lib/api/respond";

export async function getCompraDetalle(id) {
  const compra = await prisma.compra.findUnique({
    where: { id },
    include: {
      proveedorRef: true,
      lineas: { include: { articuloRef: true }, orderBy: { id: "asc" } },
    },
  });

  if (!compra) throw new ApiError("NOT_FOUND", `No se encontró la compra con id ${id}`);

  return {
    id: compra.id,
    fecha: compra.fecha.toISOString().slice(0, 10),
    nro_comprobante: compra.nro_comprobante,
    proveedor: compra.proveedorRef?.nombre ?? null,
    importe_total: compra.importe_total,
    lineas: compra.lineas.map((l) => ({
      id: l.id,
      articulo: l.articuloRef?.descripcion ?? null,
      cantidad: l.cantidad,
      precio_unitario: l.precio_unitario,
      precio_total: l.precio_total,
    })),
  };
}
