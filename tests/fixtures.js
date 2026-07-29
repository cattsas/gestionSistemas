/**
 * Payloads validos e invalidos por entidad, para la suite parametrizada.
 * `sembrarBase` deja creados con id 1: proveedor, empleado, articulo,
 * mantenimiento y compra.
 */
export const CASOS = {
  proveedor: {
    valido: { nombre: "ACME SRL", domicilio: "Av. Siempreviva 742", telefono: 1145000000 },
    invalido: { nombre: "", domicilio: "", telefono: "no es un numero" },
  },
  empleado: {
    valido: { nombre: "Ana Perez", sector: "Compras" },
    invalido: { nombre: "A", sector: "" },
  },
  articulo: {
    valido: { descripcion: "Fuente 500W", categoria: "fuentes", id_proveedor: 1 },
    invalido: { descripcion: "ab", categoria: "inexistente", id_proveedor: 0 },
  },
  equipo: {
    valido: {
      tipo: "PC",
      so: "Windows 11",
      ram: 8,
      ip: "192.168.0.5",
      empleado: 1,
      mantenimiento: 1,
      observaciones: "",
    },
    invalido: { tipo: "Tostadora", ram: "mucha", ip: "999.999.999.999" },
  },
  mantenimiento: {
    valido: {
      fecha: "2026-05-10",
      tarea: "Limpieza de gabinete",
      realizo: 1,
      observaciones: "ok",
    },
    invalido: { fecha: "no es fecha", tarea: "x", realizo: 0, observaciones: "" },
  },
  compra: {
    valido: { fecha: "2026-03-20", proveedor: 1 },
    invalido: { fecha: "ayer", proveedor: 0 },
  },
  lista: {
    valido: { compra: 1, articulo: 1, cantidad: 4, precio_unitario: 2500 },
    invalido: { compra: 0, articulo: 0, cantidad: -1, precio_unitario: "gratis" },
  },
  entrega: {
    valido: { fecha: "2026-04-02", id_articulo: 1, id_empleado: 1 },
    invalido: { fecha: "", id_articulo: 0, id_empleado: 0 },
  },
  usuario: {
    valido: { usuario: "operador1", pass: "unaClaveSegura9" },
    invalido: { usuario: "a b", pass: "corta" },
  },
};

export const ENTIDADES = Object.keys(CASOS);

/** Construye un Request como el que recibiria un route handler. */
export function req(method, body) {
  return new Request("http://test.local/api", {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

/** Segundo argumento de un handler [id]: params es una promesa. */
export function ctx(id) {
  return { params: Promise.resolve({ id: String(id) }) };
}
