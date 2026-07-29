/**
 * Utilidades que traducen un descriptor de entidad a lo que necesitan Prisma,
 * zod y la UI. Puro: no toca la base ni el HTTP.
 */
import { z } from "zod";
import { requireEntity } from "./index";

/** Centinela para "sin asignar": Radix Select no admite value="". */
export const SIN_VALOR = "__none__";

/** Campos que participan del formulario en un modo dado. */
export function formFields(entity, mode = "create") {
  return entity.fields.filter((f) => {
    if (f.inForm === false) return false;
    if (mode === "update" && f.createOnly) return false;
    return true;
  });
}

/**
 * Normaliza lo que llega del cliente antes de validar.
 * Los <input> y <select> devuelven siempre strings: "" y el centinela de
 * "sin asignar" tienen que convertirse en null para los campos opcionales,
 * porque z.coerce.number("") daria 0 y z.coerce.date("") daria Invalid Date.
 */
export function normalizeInput(entity, raw, mode = "create") {
  const out = {};
  for (const f of formFields(entity, mode)) {
    if (!(f.name in raw)) continue;
    const v = raw[f.name];
    out[f.name] = (v === SIN_VALOR || v === "") && !f.required ? null : v;
  }
  return out;
}

/** Schema de validacion del formulario/payload para el modo indicado. */
export function buildZodSchema(entity, mode = "create") {
  const shape = {};
  for (const f of formFields(entity, mode)) {
    // En edicion, contrasena vacia significa "no cambiar".
    shape[f.name] =
      f.control === "password" && mode === "update"
        ? f.zod.optional().or(z.literal(""))
        : f.zod;
  }
  return z.object(shape);
}

/**
 * Se queda solo con los campos declarados en el descriptor. Es la barrera que
 * impide que lleguen a Prisma los `_label`, los calculados, el id o cualquier
 * cosa que mande el cliente de mas.
 */
export function pickWritable(entity, data, mode = "create") {
  const out = {};
  for (const f of formFields(entity, mode)) {
    if (!(f.name in data)) continue;
    // Contrasena vacia en edicion: no tocar la existente.
    if (f.control === "password" && mode === "update" && !data[f.name]) continue;
    out[f.name] = data[f.name];
  }
  return out;
}

/** include de Prisma para traer las relaciones que dan los `_label`. */
export function buildInclude(entity) {
  const include = {};
  for (const f of entity.fields) {
    if (f.control === "reference") include[f.ref.relation] = true;
  }
  return Object.keys(include).length > 0 ? include : undefined;
}

/** Texto con el que se identifica una fila cuando es opcion de otro campo. */
export function labelOf(entity, row) {
  if (!row) return null;
  const df = entity.displayField;
  const value = typeof df === "function" ? df(row) : row[df];
  return value == null ? `#${row.id}` : String(value);
}

/**
 * Convierte una fila de Prisma en la forma canonica de la API:
 * el escalar de la FK con su nombre real, mas un `<campo>_label` de solo
 * lectura. Asi el GET se puede reenviar tal cual al PUT.
 */
export function serializeRow(entity, row) {
  if (!row) return null;

  const out = { id: row.id };

  for (const f of entity.fields) {
    // El hash nunca sale de la base.
    if (f.control === "password") continue;

    let value = row[f.name];
    // Las fechas viajan como YYYY-MM-DD: es lo que espera <input type="date">
    // y evita el corrimiento de zona horaria al formatear.
    if (value instanceof Date) value = value.toISOString().slice(0, 10);
    out[f.name] = value ?? null;

    if (f.control === "reference") {
      const related = row[f.ref.relation];
      out[`${f.name}_label`] = related ? labelOf(requireEntity(f.ref.entity), related) : null;
    }
  }

  // Los calculados que son columnas reales (precio_total, importe_total) ya
  // vienen en la fila; los que no lo son los completa hooks.afterSerialize.
  for (const c of entity.computed ?? []) {
    if (c.name in row) out[c.name] = row[c.name];
  }

  return out;
}

/**
 * Descriptores de columna para la tabla. Deliberadamente serializables (sin
 * funciones): cruzan el limite Server Component -> Client Component, y una
 * funcion `cell` no sobrevive ese pasaje.
 */
export function columnsFor(entity) {
  const porNombre = new Map(entity.fields.map((f) => [f.name, f]));
  const calculados = new Map((entity.computed ?? []).map((c) => [c.name, c]));

  return entity.list
    .map((name) => {
      if (name === "id") return { accessorKey: "id", header: "ID", type: "number" };

      const f = porNombre.get(name);
      if (f) {
        return {
          // Las referencias se muestran por su etiqueta, no por el id.
          accessorKey: f.control === "reference" ? `${f.name}_label` : f.name,
          header: f.label,
          type: f.control,
        };
      }

      const c = calculados.get(name);
      if (c) return { accessorKey: c.name, header: c.label, type: c.type ?? "number" };

      return null;
    })
    .filter(Boolean);
}

/** Valores iniciales del formulario para un alta. */
export function emptyValues(entity) {
  const out = {};
  for (const f of formFields(entity, "create")) {
    if (f.control === "number" || f.control === "float") out[f.name] = "";
    else if (f.control === "reference") out[f.name] = f.required ? "" : SIN_VALOR;
    else out[f.name] = "";
  }
  return out;
}

/** Valores del formulario a partir de una fila serializada. */
export function formValues(entity, row, mode = "update") {
  const out = {};
  for (const f of formFields(entity, mode)) {
    const v = row?.[f.name];
    if (f.control === "password") out[f.name] = "";
    else if (f.control === "reference") out[f.name] = v == null ? SIN_VALOR : String(v);
    else out[f.name] = v == null ? "" : String(v);
  }
  return out;
}
