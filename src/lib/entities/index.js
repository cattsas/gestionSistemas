/**
 * Registro de entidades: fuente de verdad unica del sistema.
 *
 * Lo consumen el factory de rutas, la capa de servicio, la generacion de
 * columnas y el formulario generico. Agregar una entidad nueva es agregar un
 * descriptor aca; las paginas y los endpoints salen derivados.
 *
 * Regla: los descriptores importan SOLO zod. Nada de Prisma ni de JSX, para
 * que puedan usarse igual en el servidor y en el navegador.
 */
import articulo from "./articulo";
import compra from "./compra";
import empleado from "./empleado";
import entrega from "./entrega";
import equipo from "./equipo";
import lista from "./lista";
import mantenimiento from "./mantenimiento";
import proveedor from "./proveedor";
import usuario from "./usuario";

const REGISTRY = {
  articulo,
  compra,
  empleado,
  entrega,
  equipo,
  lista,
  mantenimiento,
  proveedor,
  usuario,
};

/** Devuelve el descriptor, o null si el nombre no corresponde a una entidad. */
export function getEntity(name) {
  return Object.prototype.hasOwnProperty.call(REGISTRY, name) ? REGISTRY[name] : null;
}

/** Como getEntity pero lanza: para usar donde un nombre invalido es un bug. */
export function requireEntity(name) {
  const entity = getEntity(name);
  if (!entity) throw new Error(`Entidad desconocida: ${name}`);
  return entity;
}

/** Todos los descriptores, en el orden en que conviene mostrarlos en el menu. */
export function listEntities() {
  return [articulo, equipo, compra, lista, entrega, proveedor, empleado, mantenimiento, usuario];
}

export { REGISTRY };
