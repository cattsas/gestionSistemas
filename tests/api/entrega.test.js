import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/entrega/route";
import { PUT } from "@/app/api/entrega/[id]/route";
import { limpiarBase, prisma, sembrarBase } from "../setup/db";
import { ctx, req } from "../fixtures";

beforeEach(async () => {
  await limpiarBase();
  await sembrarBase();
});

// sembrarBase deja el articulo id 1 sin movimientos: stock 0.

describe("entregas respetan el stock disponible", () => {
  it("no permite entregar un articulo sin stock", async () => {
    const res = await POST(req("POST", { fecha: "2026-04-02", id_articulo: 1, id_empleado: 1 }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION");
    expect(body.error.fields.id_articulo).toBeTypeOf("string");
    expect(await prisma.entrega.count()).toBe(0);
  });

  it("permite entregar si hay stock", async () => {
    await prisma.articulo.update({ where: { id: 1 }, data: { stock_inicial: 1 } });

    const res = await POST(req("POST", { fecha: "2026-04-02", id_articulo: 1, id_empleado: 1 }));
    expect(res.status).toBe(201);
  });

  it("al editar sin cambiar el articulo, no vuelve a exigir stock", async () => {
    await prisma.articulo.update({ where: { id: 1 }, data: { stock_inicial: 1 } });
    const creado = await (
      await POST(req("POST", { fecha: "2026-04-02", id_articulo: 1, id_empleado: 1 }))
    ).json();

    // El stock de 1 ya quedo en 0 (se entrego su unica unidad); editar otro
    // campo sin tocar id_articulo no debe volver a chequear stock.
    const res = await PUT(
      req("PUT", { fecha: "2026-05-01", id_articulo: 1, id_empleado: 1 }),
      ctx(creado.data.id)
    );
    expect(res.status).toBe(200);
  });

  it("al editar cambiando a un articulo sin stock, lo rechaza", async () => {
    await prisma.articulo.update({ where: { id: 1 }, data: { stock_inicial: 1 } });
    await prisma.articulo.create({
      data: { id: 2, descripcion: "Otro articulo", categoria: "otros", id_proveedor: 1 },
    });
    const creado = await (
      await POST(req("POST", { fecha: "2026-04-02", id_articulo: 1, id_empleado: 1 }))
    ).json();

    const res = await PUT(
      req("PUT", { fecha: "2026-04-02", id_articulo: 2, id_empleado: 1 }),
      ctx(creado.data.id)
    );
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.fields.id_articulo).toBeTypeOf("string");
  });
});
