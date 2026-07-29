/**
 * Factory de route handlers CRUD.
 *
 * Cada endpoint pasa a ser una linea, y los errores puntuales que tenian las
 * versiones escritas a mano (variables inexistentes, campos mal
 * destructurados, mensajes copiados de otra entidad) desaparecen por
 * construccion.
 */
import { requireEntity } from "@/lib/entities";
import * as crud from "@/lib/services/crud";
import { handleError, ok, parseId, readJson } from "./respond";

/** GET y POST de /api/<entidad> */
export function collection(name) {
  const entity = requireEntity(name);
  const ctx = { label: entity.label.one.toLowerCase() };

  return {
    async GET() {
      try {
        // Una coleccion vacia es 200 con [], no un 404.
        return ok(await crud.list(name));
      } catch (error) {
        return handleError(error, ctx);
      }
    },

    async POST(request) {
      try {
        const body = await readJson(request);
        return ok(await crud.create(name, body), { status: 201 });
      } catch (error) {
        return handleError(error, ctx);
      }
    },
  };
}

/** GET, PUT y DELETE de /api/<entidad>/[id] */
export function item(name) {
  const entity = requireEntity(name);
  const label = entity.label.one.toLowerCase();

  // Firma unica y moderna: params es una promesa en el App Router actual.
  const getId = async (context) => parseId((await context.params).id);

  return {
    async GET(request, context) {
      let id;
      try {
        id = await getId(context);
        return ok(await crud.getOne(name, id));
      } catch (error) {
        return handleError(error, { label, id });
      }
    },

    async PUT(request, context) {
      let id;
      try {
        id = await getId(context);
        const body = await readJson(request);
        return ok(await crud.update(name, id, body), {
          message: `${entity.label.one} actualizado`,
        });
      } catch (error) {
        return handleError(error, { label, id });
      }
    },

    async DELETE(request, context) {
      let id;
      try {
        id = await getId(context);
        return ok(await crud.remove(name, id), {
          message: `${entity.label.one} eliminado`,
        });
      } catch (error) {
        return handleError(error, { label, id });
      }
    },
  };
}
