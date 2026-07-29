/**
 * Forma canonica de las respuestas de la API.
 *
 * Exito:  { data: ... }            (siempre un objeto; nunca un array pelado)
 * Error:  { error: { code, message, fields } }
 *
 * Una coleccion vacia es 200 con data: [], NUNCA un 404: el frontend espera
 * un array y un 404 con otra forma es lo que rompia los listados.
 */
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export const CODES = {
  VALIDATION: 422,
  NOT_FOUND: 404,
  CONFLICT: 409,
  FK_CONSTRAINT: 409,
  UNAUTHENTICATED: 401,
  BAD_REQUEST: 400,
  INTERNAL: 500,
};

export function ok(data, { status = 200, message } = {}) {
  const body = { data };
  if (message) body.message = message;
  return NextResponse.json(body, { status });
}

export function fail(code, message, fields) {
  const error = { code, message };
  if (fields) error.fields = fields;
  return NextResponse.json({ error }, { status: CODES[code] ?? 500 });
}

/** Aplana los errores de zod a { campo: "mensaje" } para form.setError. */
function zodFields(error) {
  const fields = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}

/** Error de dominio con codigo explicito, para lanzar desde los servicios. */
export class ApiError extends Error {
  constructor(code, message, fields) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.fields = fields;
  }
}

/**
 * Traduce cualquier excepcion a una respuesta.
 * En 500 nunca se devuelve error.message: los errores de Prisma incluyen
 * nombres de tablas y columnas, que no tienen por que llegar al cliente.
 */
export function handleError(error, { label = "registro", id } = {}) {
  if (error instanceof ApiError) {
    return fail(error.code, error.message, error.fields);
  }

  if (error instanceof ZodError) {
    return fail("VALIDATION", "Hay campos con errores", zodFields(error));
  }

  switch (error?.code) {
    case "P2025":
      return fail("NOT_FOUND", `No se encontró ${label}${id != null ? ` con id ${id}` : ""}`);
    case "P2002": {
      const campo = [].concat(error.meta?.target ?? []).join(", ");
      return fail("CONFLICT", campo ? `Ya existe un registro con ese ${campo}` : "El registro ya existe");
    }
    case "P2003":
      return fail(
        "FK_CONSTRAINT",
        "No se puede completar la operación porque hay registros relacionados"
      );
    default:
      break;
  }

  if (error?.name === "PrismaClientValidationError") {
    return fail("BAD_REQUEST", "La estructura de los datos enviados es inválida");
  }

  console.error(`[api:${label}]`, error);
  return fail("INTERNAL", "Error interno del servidor");
}

/** Parseo de body tolerante: un JSON roto es 400, no 500. */
export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw new ApiError("BAD_REQUEST", "El cuerpo de la solicitud no es JSON válido");
  }
}

/** Valida y normaliza el id de una ruta [id]. */
export function parseId(raw) {
  const id = Number.parseInt(raw, 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError("BAD_REQUEST", `El id "${raw}" no es válido`);
  }
  return id;
}
