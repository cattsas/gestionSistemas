import { beforeEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/articulo/route";
import { limpiarBase, prisma, sembrarBase } from "../setup/db";
import { req } from "../fixtures";

beforeEach(async () => {
  await limpiarBase();
  await sembrarBase();
});

// sembrarBase deja creado el articulo id 1 ("Articulo Test", categoria
// "otros", proveedor 1, stock_inicial 0 por default).

describe("alta de articulo: doble proposito segun el codigo", () => {
  it("sin codigo, crea un articulo nuevo con el stock cargado como inicial", async () => {
    const res = await POST(
      req("POST", {
        descripcion: "Fuente 600W",
        categoria: "fuentes",
        id_proveedor: 1,
        stock_inicial: 10,
      })
    );
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.id).not.toBe(1);
    expect(body.data.stock).toBe(10);

    expect(await prisma.articulo.count()).toBe(2);
  });

  it("con un codigo existente, suma al stock en vez de crear una fila nueva", async () => {
    const res = await POST(req("POST", { id: 1, stock_inicial: 5 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.id).toBe(1);
    expect(body.data.stock).toBe(5);
    expect(await prisma.articulo.count()).toBe(1);

    // Sumar de nuevo acumula, no reemplaza.
    const res2 = await POST(req("POST", { id: 1, stock_inicial: 3 }));
    expect((await res2.json()).data.stock).toBe(8);
  });

  it("con codigo existente, ignora descripcion/categoria/proveedor: no edita el catalogo", async () => {
    await POST(
      req("POST", {
        id: 1,
        descripcion: "Otra cosa completamente distinta",
        categoria: "monitores",
        id_proveedor: 999,
        stock_inicial: 1,
      })
    );

    const fila = await prisma.articulo.findUnique({ where: { id: 1 } });
    expect(fila.descripcion).toBe("Articulo Test");
    expect(fila.categoria).toBe("otros");
    expect(fila.id_proveedor).toBe(1);
  });

  it("con un codigo que no existe, da un error de validacion en el campo id y no crea nada", async () => {
    const res = await POST(req("POST", { id: 99999, stock_inicial: 5 }));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION");
    expect(body.error.fields.id).toBeTypeOf("string");
    expect(await prisma.articulo.count()).toBe(1);
  });

  it("con codigo existente y sin cantidad, no rompe: suma 0", async () => {
    const res = await POST(req("POST", { id: 1 }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.stock).toBe(0);
  });
});
