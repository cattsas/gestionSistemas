import { beforeEach, describe, expect, it } from "vitest";
import { collection, item } from "@/lib/api/crudRoute";
import { limpiarBase, prisma, sembrarBase } from "../setup/db";
import { ctx, req } from "../fixtures";

const { POST } = collection("lista");
const { PUT, DELETE } = item("lista");

const importeDeLaCompra = async (id = 1) =>
  (await prisma.compra.findUnique({ where: { id } })).importe_total;

const alta = (data) => POST(req("POST", data)).then((r) => r.json());

beforeEach(async () => {
  await limpiarBase();
  await sembrarBase();
});

describe("consistencia de totales", () => {
  it("el servidor calcula precio_total y no acepta el del cliente", async () => {
    const { data } = await alta({
      compra: 1,
      articulo: 1,
      cantidad: 3,
      precio_unitario: 1000,
      precio_total: 1, // valor mentiroso: debe ignorarse
    });

    expect(data.precio_total).toBe(3000);
  });

  it("el alta de una linea actualiza el importe de la compra", async () => {
    await alta({ compra: 1, articulo: 1, cantidad: 2, precio_unitario: 500 });
    expect(await importeDeLaCompra()).toBe(1000);

    await alta({ compra: 1, articulo: 1, cantidad: 1, precio_unitario: 250 });
    expect(await importeDeLaCompra()).toBe(1250);
  });

  it("la edicion de una linea actualiza el importe de la compra", async () => {
    const { data } = await alta({ compra: 1, articulo: 1, cantidad: 2, precio_unitario: 500 });

    await PUT(
      req("PUT", { compra: 1, articulo: 1, cantidad: 10, precio_unitario: 500 }),
      ctx(data.id)
    );

    expect(await importeDeLaCompra()).toBe(5000);
  });

  it("la baja de una linea actualiza el importe de la compra", async () => {
    const { data } = await alta({ compra: 1, articulo: 1, cantidad: 2, precio_unitario: 500 });
    await DELETE(req("DELETE"), ctx(data.id));

    expect(await importeDeLaCompra()).toBe(0);
  });

  it("mover una linea a otra compra actualiza las dos", async () => {
    await prisma.compra.create({
      data: {
        id: 2,
        fecha: new Date("2026-02-02T00:00:00Z"),
        nro_comprobante: "TEST-0002",
        proveedor: 1,
        importe_total: 0,
      },
    });
    const { data } = await alta({ compra: 1, articulo: 1, cantidad: 2, precio_unitario: 500 });

    await PUT(
      req("PUT", { compra: 2, articulo: 1, cantidad: 2, precio_unitario: 500 }),
      ctx(data.id)
    );

    expect(await importeDeLaCompra(1)).toBe(0);
    expect(await importeDeLaCompra(2)).toBe(1000);
  });
});
