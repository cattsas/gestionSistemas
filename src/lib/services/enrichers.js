/**
 * Campos calculados que necesitan consultar la base.
 *
 * Viven aca y no en los descriptores porque estos importan solo zod: si
 * importaran Prisma dejarian de poder usarse en el navegador.
 *
 * Reciben TODAS las filas de una vez, para poder resolverlas en una consulta
 * agregada en lugar de una por fila.
 */
import { getStockMap } from "@/lib/calcStock";

export const ENRICHERS = {
  articulo: async (rows) => {
    if (rows.length === 0) return rows;
    const stock = await getStockMap();
    return rows.map((row) => ({ ...row, stock: stock.get(row.id) ?? 0 }));
  },
};

export function enrich(entityName, rows) {
  const fn = ENRICHERS[entityName];
  return fn ? fn(rows) : rows;
}
