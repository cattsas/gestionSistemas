import { beforeEach, describe, expect, it } from "vitest";
import { getStockMap, getStockRestante } from "@/lib/calcStock";
import { limpiarBase, prisma, sembrarBase } from "../setup/db";

beforeEach(async () => {
  await limpiarBase();
  await sembrarBase();
});

const comprar = (cantidad) =>
  prisma.lista.create({
    data: { compra: 1, articulo: 1, cantidad, precio_unitario: 100, precio_total: cantidad * 100 },
  });

const entregar = () =>
  prisma.entrega.create({
    data: { id_articulo: 1, id_empleado: 1, fecha: new Date("2026-03-01T00:00:00Z") },
  });

describe("calculo de stock", () => {
  it("un articulo sin movimientos da 0 y no lanza", () => {
    // Regresion: la version anterior devolvia NaN cuando no habia compras,
    // y eso rompia el listado entero con un 500.
    return expect(getStockRestante(1)).resolves.toBe(0);
  });

  it("un articulo inexistente da 0", async () => {
    await expect(getStockRestante(99999)).resolves.toBe(0);
  });

  it("stock = comprado - entregado", async () => {
    await comprar(10);
    await comprar(5);
    await entregar();
    await entregar();

    await expect(getStockRestante(1)).resolves.toBe(13);
  });

  it("puede quedar negativo si se entrego mas de lo comprado", async () => {
    await comprar(1);
    await entregar();
    await entregar();

    await expect(getStockRestante(1)).resolves.toBe(-1);
  });

  it("resuelve todos los articulos de una vez, sin una consulta por fila", async () => {
    await prisma.articulo.create({
      data: { id: 2, descripcion: "Otro", categoria: "discos", id_proveedor: 1 },
    });
    await comprar(7);

    const mapa = await getStockMap();

    expect(mapa.get(1)).toBe(7);
    // Todo articulo entra en el mapa aunque no tenga movimientos: parte de su
    // stock_inicial (0 por default).
    expect(mapa.get(2)).toBe(0);
  });

  it("el stock inicial cargado a mano suma al de compras y resta el de entregas", async () => {
    await prisma.articulo.update({ where: { id: 1 }, data: { stock_inicial: 20 } });
    await comprar(5);
    await entregar();

    await expect(getStockRestante(1)).resolves.toBe(24);
  });
});
