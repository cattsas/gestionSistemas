import { beforeEach, describe, expect, it } from "vitest";
import { collection, item } from "@/lib/api/crudRoute";
import { limpiarBase, sembrarBase } from "../setup/db";
import { CASOS, ENTIDADES, ctx, req } from "../fixtures";

beforeEach(async () => {
  await limpiarBase();
  await sembrarBase();
});

/** Cuantas filas deja `sembrarBase` en cada entidad. */
const YA_SEMBRADAS = {
  proveedor: 1,
  empleado: 1,
  articulo: 1,
  mantenimiento: 1,
  compra: 1,
  equipo: 0,
  lista: 0,
  entrega: 0,
  usuario: 0,
};

describe.each(ENTIDADES)("CRUD de %s", (nombre) => {
  const { GET: getAll, POST } = collection(nombre);
  const { GET: getOne, PUT, DELETE } = item(nombre);
  const { valido, invalido } = CASOS[nombre];

  it("la coleccion responde 200 con un array, incluso vacia", async () => {
    const res = await getAll();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(YA_SEMBRADAS[nombre]);
  });

  it("crea con datos validos y devuelve 201", async () => {
    const res = await POST(req("POST", valido));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.data.id).toBeTypeOf("number");
  });

  it("nunca devuelve el campo de contrasena", async () => {
    const res = await POST(req("POST", valido));
    const body = await res.json();
    expect(JSON.stringify(body)).not.toContain("pass");
  });

  it("rechaza datos invalidos con 422 y detalle por campo", async () => {
    const res = await POST(req("POST", invalido));
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error.code).toBe("VALIDATION");
    expect(Object.keys(body.error.fields ?? {}).length).toBeGreaterThan(0);
  });

  it("responde 404 al pedir un id inexistente", async () => {
    const res = await getOne(req("GET"), ctx(99999));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("responde 400 si el id no es un numero", async () => {
    const res = await getOne(req("GET"), ctx("abc"));
    expect(res.status).toBe(400);
  });

  it("el resultado de un GET se puede reenviar tal cual a un PUT", async () => {
    // Esta es la regresion central: antes el GET devolvia las relaciones como
    // nombres y el PUT esperaba los ids, asi que editar sin cambiar nada
    // fallaba en articulo, entrega y compra.
    const creado = await (await POST(req("POST", valido))).json();
    const leido = await (await getOne(req("GET"), ctx(creado.data.id))).json();

    const res = await PUT(req("PUT", leido.data), ctx(creado.data.id));

    expect(res.status).toBe(200);
  });

  it("expone el id y la etiqueta de cada clave foranea", async () => {
    const creado = await (await POST(req("POST", valido))).json();
    const leido = await (await getOne(req("GET"), ctx(creado.data.id))).json();

    const { getEntity } = await import("@/lib/entities");
    for (const f of getEntity(nombre).fields) {
      if (f.control !== "reference") continue;
      expect(leido.data).toHaveProperty(f.name);
      expect(leido.data).toHaveProperty(`${f.name}_label`);
    }
  });

  it("elimina y despues devuelve 404", async () => {
    const creado = await (await POST(req("POST", valido))).json();

    const borrado = await DELETE(req("DELETE"), ctx(creado.data.id));
    expect(borrado.status).toBe(200);

    const luego = await getOne(req("GET"), ctx(creado.data.id));
    expect(luego.status).toBe(404);
  });

  it("responde 404 al eliminar algo inexistente", async () => {
    const res = await DELETE(req("DELETE"), ctx(99999));
    expect(res.status).toBe(404);
  });

  it("todos los errores son objetos, nunca texto plano", async () => {
    // Las 31 versiones anteriores devolvian el string pelado del error, que es
    // lo que hacia explotar al frontend.
    const respuestas = [
      await getOne(req("GET"), ctx(99999)),
      await DELETE(req("DELETE"), ctx(99999)),
      await POST(req("POST", invalido)),
    ];

    for (const res of respuestas) {
      const body = await res.json();
      expect(body).toBeTypeOf("object");
      expect(body.error).toBeTypeOf("object");
      expect(body.error.message).toBeTypeOf("string");
    }
  });
});
