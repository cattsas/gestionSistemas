import prisma from "@/lib/prisma";

// Orden inverso al de las FK. Se desactiva la verificacion para poder truncar
// de un saque: es bastante mas rapido que borrar respetando las relaciones.
const TABLAS = [
  "entrega",
  "lista",
  "compra",
  "equipo",
  "mantenimiento",
  "articulo",
  "empleado",
  "proveedor",
  "usuario",
];

export async function limpiarBase() {
  // FOREIGN_KEY_CHECKS es una variable de sesion: si cada $executeRawUnsafe
  // tomara una conexion distinta del pool, el SET de una no afectaria a los
  // TRUNCATE de otra. $transaction fija una sola conexion para todo el
  // bloque, así que quedan todos en la misma sesión.
  await prisma.$transaction([
    prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0"),
    ...TABLAS.map((tabla) => prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${tabla}\``)),
    prisma.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1"),
  ]);
}

/**
 * Datos minimos con ids conocidos (1) para que cada entidad tenga sus
 * dependencias resueltas.
 */
export async function sembrarBase() {
  await prisma.proveedor.create({
    data: { id: 1, nombre: "Proveedor Test", domicilio: "Calle 1", telefono: 1100000000 },
  });
  await prisma.empleado.create({
    data: { id: 1, nombre: "Empleado Test", sector: "Sistemas" },
  });
  await prisma.articulo.create({
    data: { id: 1, descripcion: "Articulo Test", categoria: "otros", id_proveedor: 1 },
  });
  await prisma.mantenimiento.create({
    data: {
      id: 1,
      fecha: new Date("2026-01-15T00:00:00Z"),
      tarea: "Tarea de prueba",
      realizo: 1,
      observaciones: "sin novedad",
    },
  });
  await prisma.compra.create({
    data: {
      id: 1,
      fecha: new Date("2026-02-01T00:00:00Z"),
      nro_comprobante: "TEST-0001",
      proveedor: 1,
      importe_total: 0,
    },
  });
}

export { prisma };
