import { articulo_categoria, equipo_tipo } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { getEntity, listEntities } from "@/lib/entities";
import { buildInclude, columnsFor, normalizeInput, pickWritable } from "@/lib/entities/helpers";

describe("registro de entidades", () => {
  it("los enums del descriptor coinciden con los del schema de Prisma", () => {
    // Detecta la deriva si alguien toca schema.prisma y se olvida del
    // descriptor, que es de donde salen las opciones de los <select>.
    expect(getEntity("articulo").fields.find((f) => f.name === "categoria").options).toEqual(
      Object.values(articulo_categoria)
    );
    expect(getEntity("equipo").fields.find((f) => f.name === "tipo").options).toEqual(
      Object.values(equipo_tipo)
    );
  });

  it("cada entidad declara lo minimo para poder derivarse", () => {
    for (const entity of listEntities()) {
      expect(entity.name, "name").toBeTypeOf("string");
      expect(entity.model, "model").toBeTypeOf("string");
      expect(entity.label.one, `${entity.name}.label.one`).toBeTypeOf("string");
      expect(entity.label.many, `${entity.name}.label.many`).toBeTypeOf("string");
      expect(entity.fields.length, `${entity.name}.fields`).toBeGreaterThan(0);
      expect(entity.list.length, `${entity.name}.list`).toBeGreaterThan(0);
    }
  });

  it("toda referencia apunta a una entidad existente", () => {
    for (const entity of listEntities()) {
      for (const f of entity.fields) {
        if (f.control !== "reference") continue;
        expect(getEntity(f.ref.entity), `${entity.name}.${f.name} -> ${f.ref.entity}`).toBeTruthy();
        expect(f.ref.relation, `${entity.name}.${f.name}.ref.relation`).toBeTypeOf("string");
      }
    }
  });

  it("las columnas son serializables: cruzan el limite servidor-cliente", () => {
    for (const entity of listEntities()) {
      const cols = columnsFor(entity);
      expect(cols.length).toBeGreaterThan(0);
      for (const col of cols) {
        for (const valor of Object.values(col)) {
          expect(valor, `${entity.name}.${col.accessorKey}`).not.toBeTypeOf("function");
        }
      }
    }
  });

  it("las referencias se muestran por su etiqueta y no por el id", () => {
    const col = columnsFor(getEntity("articulo")).find((c) => c.header === "Proveedor");
    expect(col.accessorKey).toBe("id_proveedor_label");
  });
});

describe("pickWritable", () => {
  it("descarta etiquetas, calculados, el id (si la entidad no lo declara) y cualquier campo de mas", () => {
    const entity = getEntity("empleado");
    const data = pickWritable(entity, {
      id: 7,
      nombre: "Ana",
      sector: "Compras",
      loQueSea: true,
    });

    expect(data).toEqual({ nombre: "Ana", sector: "Compras" });
  });

  it("en articulo el id ('código') se puede cargar a mano al alta, no se descarta", () => {
    const entity = getEntity("articulo");
    const data = pickWritable(entity, {
      id: 7,
      descripcion: "Fuente",
      categoria: "fuentes",
      id_proveedor: 2,
      id_proveedor_label: "ACME",
      stock: 99,
      cantidad: 5,
      loQueSea: true,
    });

    expect(data).toEqual({
      id: 7,
      descripcion: "Fuente",
      categoria: "fuentes",
      id_proveedor: 2,
    });
  });

  it("en articulo, editar (no alta) sigue descartando el id: es createOnly", () => {
    const entity = getEntity("articulo");
    const data = pickWritable(
      entity,
      { id: 7, descripcion: "Fuente", categoria: "fuentes", id_proveedor: 2 },
      "update"
    );

    expect(data).toEqual({ descripcion: "Fuente", categoria: "fuentes", id_proveedor: 2 });
  });

  it("en edicion ignora la contrasena vacia para no pisar la existente", () => {
    const entity = getEntity("usuario");
    expect(pickWritable(entity, { usuario: "ana", pass: "" }, "update")).toEqual({ usuario: "ana" });
    expect(pickWritable(entity, { usuario: "ana", pass: "nueva1234" }, "update")).toEqual({
      usuario: "ana",
      pass: "nueva1234",
    });
  });
});

describe("normalizeInput", () => {
  it("convierte el centinela de 'sin asignar' y el vacio en null", () => {
    // Sin esto, z.coerce.number("") daria 0 y guardaria una FK invalida.
    const entity = getEntity("equipo");
    const data = normalizeInput(entity, { empleado: "__none__", so: "", tipo: "PC", ram: "8" });

    expect(data.empleado).toBeNull();
    expect(data.so).toBeNull();
    expect(data.ram).toBe("8");
  });

  it("respeta el vacio en los campos obligatorios para que zod lo rechace", () => {
    const entity = getEntity("articulo");
    expect(normalizeInput(entity, { descripcion: "" }).descripcion).toBe("");
  });
});

describe("buildInclude", () => {
  it("incluye la relacion de cada referencia y nada mas", () => {
    expect(buildInclude(getEntity("articulo"))).toEqual({ proveedor: true });
    expect(buildInclude(getEntity("equipo"))).toEqual({
      empleadoRef: true,
      mantenimientoRef: true,
    });
    expect(buildInclude(getEntity("empleado"))).toBeUndefined();
  });
});
