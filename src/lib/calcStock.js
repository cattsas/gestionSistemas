import prisma from "@/lib/prisma";

/**
 * Stock de todos los articulos en 2 consultas.
 *
 * Antes se hacia una funcion por articulo dentro de un map, y cada llamada
 * disparaba 3 consultas: con N articulos eran 3N viajes a la base.
 */
export async function getStockMap() {
  const [comprado, entregado] = await Promise.all([
    prisma.lista.groupBy({ by: ["articulo"], _sum: { cantidad: true } }),
    prisma.entrega.groupBy({ by: ["id_articulo"], _count: { id: true } }),
  ]);

  const stock = new Map();
  for (const c of comprado) stock.set(c.articulo, c._sum.cantidad ?? 0);
  for (const e of entregado) {
    stock.set(e.id_articulo, (stock.get(e.id_articulo) ?? 0) - e._count.id);
  }
  return stock;
}

/** Stock de un articulo puntual. Un articulo sin movimientos da 0, no error. */
export async function getStockRestante(id) {
  const stock = await getStockMap();
  return stock.get(id) ?? 0;
}

export default getStockRestante;
