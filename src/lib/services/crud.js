/**
 * Capa de servicio: todo el CRUD de las 9 entidades, sin HTTP.
 *
 * La usan los route handlers, los Server Components (que por eso ya no
 * necesitan hacerse fetch a si mismos) y los tests. Lanza excepciones; quien
 * la llama decide como traducirlas.
 */
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { requireEntity } from "@/lib/entities";
import {
  buildInclude,
  buildZodSchema,
  labelOf,
  normalizeInput,
  pickWritable,
  serializeRow,
} from "@/lib/entities/helpers";
import { ApiError } from "@/lib/api/respond";
import { enrich } from "./enrichers";

const noEncontrado = (entity, id) =>
  new ApiError("NOT_FOUND", `No se encontró ${entity.label.one.toLowerCase()} con id ${id}`);

async function serialize(entity, rows) {
  return enrich(entity.name, rows.map((row) => serializeRow(entity, row)));
}

/** El hash se aplica aca y no en el descriptor, que no puede importar bcrypt. */
async function hashPasswords(entity, data) {
  for (const f of entity.fields) {
    if (f.control === "password" && data[f.name]) {
      data[f.name] = await bcrypt.hash(data[f.name], 10);
    }
  }
  return data;
}

async function prepare(entity, raw, mode) {
  const parsed = buildZodSchema(entity, mode).parse(normalizeInput(entity, raw, mode));
  let data = pickWritable(entity, parsed, mode);
  if (entity.hooks?.beforeWrite) {
    data = await entity.hooks.beforeWrite(data, { mode });
  }
  return hashPasswords(entity, data);
}

export async function list(name) {
  const entity = requireEntity(name);
  const rows = await prisma[entity.model].findMany({
    include: buildInclude(entity),
    orderBy: { id: "asc" },
  });
  return serialize(entity, rows);
}

export async function getOne(name, id) {
  const entity = requireEntity(name);
  const row = await prisma[entity.model].findUnique({
    where: { id },
    include: buildInclude(entity),
  });
  if (!row) throw noEncontrado(entity, id);
  const [serialized] = await serialize(entity, [row]);
  return serialized;
}

export async function create(name, raw) {
  const entity = requireEntity(name);
  const data = await prepare(entity, raw, "create");

  const row = await prisma.$transaction(async (tx) => {
    const creado = await tx[entity.model].create({ data });
    if (entity.hooks?.afterWrite) {
      await entity.hooks.afterWrite(creado, { tx, mode: "create" });
    }
    return tx[entity.model].findUnique({
      where: { id: creado.id },
      include: buildInclude(entity),
    });
  });

  const [serialized] = await serialize(entity, [row]);
  return serialized;
}

export async function update(name, id, raw) {
  const entity = requireEntity(name);
  const data = await prepare(entity, raw, "update");

  const row = await prisma.$transaction(async (tx) => {
    const previo = await tx[entity.model].findUnique({ where: { id } });
    if (!previo) throw noEncontrado(entity, id);

    const actualizado = await tx[entity.model].update({ where: { id }, data });

    if (entity.hooks?.afterWrite) {
      await entity.hooks.afterWrite(actualizado, { tx, mode: "update" });
      // Mover una linea de compra deja desactualizada tambien la compra vieja.
      if (previo.compra != null && previo.compra !== actualizado.compra) {
        await entity.hooks.afterWrite(previo, { tx, mode: "update" });
      }
    }

    return tx[entity.model].findUnique({ where: { id }, include: buildInclude(entity) });
  });

  const [serialized] = await serialize(entity, [row]);
  return serialized;
}

export async function remove(name, id) {
  const entity = requireEntity(name);

  return prisma.$transaction(async (tx) => {
    const row = await tx[entity.model].findUnique({ where: { id } });
    if (!row) throw noEncontrado(entity, id);

    await tx[entity.model].delete({ where: { id } });

    if (entity.hooks?.afterDelete) {
      await entity.hooks.afterDelete(row, { tx });
    }
    return { id };
  });
}

/** Opciones { value, label } de una entidad, para poblar los <select>. */
export async function listOptions(name) {
  const entity = requireEntity(name);
  const rows = await prisma[entity.model].findMany({ orderBy: { id: "asc" } });
  return rows.map((row) => ({ value: row.id, label: labelOf(entity, row) }));
}

/**
 * Todas las opciones que necesita el formulario de una entidad, indexadas por
 * nombre de campo. El Server Component las precarga y el formulario ya las
 * recibe resueltas: sin fetch en el cliente ni estado de carga.
 */
export async function optionsForForm(name) {
  const entity = requireEntity(name);
  const refs = entity.fields.filter((f) => f.control === "reference");
  const entries = await Promise.all(
    refs.map(async (f) => [f.name, await listOptions(f.ref.entity)])
  );
  return Object.fromEntries(entries);
}

/** Conteo por entidad, para las tarjetas del dashboard. */
export async function countAll() {
  const { listEntities } = await import("@/lib/entities");
  const entries = await Promise.all(
    listEntities().map(async (e) => [e.name, await prisma[e.model].count()])
  );
  return Object.fromEntries(entries);
}
