/**
 * Seed de la base de datos.
 *
 * Dos partes con reglas distintas:
 *  - El usuario administrador se garantiza SIEMPRE (con upsert). Sin el no se
 *    puede entrar al sistema, y es la unica forma de crear el primer usuario
 *    ahora que POST /api/usuario exige sesion.
 *  - Los datos de demostracion se cargan SOLO si la base esta vacia, para no
 *    pisar informacion real de una instalacion en uso.
 *
 * Es idempotente: se puede correr las veces que haga falta.
 */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

const prisma = new PrismaClient();

const d = (iso) => new Date(`${iso}T00:00:00Z`);

async function seedAdmin() {
  const usuario = process.env.SEED_ADMIN_USER || "admin";
  let pass = process.env.SEED_ADMIN_PASS;
  let generada = false;

  if (!pass) {
    // base64url para que sea copiable sin escapes desde la consola.
    pass = crypto.randomBytes(12).toString("base64url");
    generada = true;
  }

  const hash = await bcrypt.hash(pass, 10);

  // update deliberadamente vacio: si el usuario ya existe no le tocamos la
  // password, para no resetearla en cada deploy.
  const creado = await prisma.usuario.upsert({
    where: { usuario },
    update: {},
    create: { usuario, pass: hash },
  });

  const yaExistia = creado.pass !== hash;

  if (yaExistia) {
    console.log(`Usuario "${usuario}" ya existia, no se modifico su password.`);
  } else if (generada) {
    console.log("\n" + "=".repeat(58));
    console.log(`  Usuario:    ${usuario}`);
    console.log(`  Password:   ${pass}`);
    console.log("  Guardala: no se vuelve a mostrar.");
    console.log("=".repeat(58) + "\n");
  } else {
    console.log(`Usuario "${usuario}" creado con la password de SEED_ADMIN_PASS.`);
  }
}

async function baseVacia() {
  const [proveedores, articulos, empleados, compras] = await Promise.all([
    prisma.proveedor.count(),
    prisma.articulo.count(),
    prisma.empleado.count(),
    prisma.compra.count(),
  ]);
  return proveedores + articulos + empleados + compras === 0;
}

const PROVEEDORES = [
  { id: 1, nombre: "Newbytes", domicilio: "Av. Corrientes 1234", telefono: 1145678900 },
  { id: 2, nombre: "Air Computers", domicilio: "Bartolome Mitre 900", telefono: 1148889900 },
  { id: 3, nombre: "Gaming City", domicilio: "Peron 1500", telefono: 1147776600 },
];

const EMPLEADOS = [
  { id: 1, nombre: "Laura Gimenez", sector: "Administracion" },
  { id: 2, nombre: "Marcos Ferreyra", sector: "Sistemas" },
  { id: 3, nombre: "Carla Ruiz", sector: "Ventas" },
  { id: 4, nombre: "Diego Sosa", sector: "Deposito" },
];

// Cubre las 7 categorias del enum articulo_categoria.
const ARTICULOS = [
  { id: 1, descripcion: "Fuente 600W 80 Plus", categoria: "fuentes", id_proveedor: 1 },
  { id: 2, descripcion: "Motherboard B450M", categoria: "mothers", id_proveedor: 1 },
  { id: 3, descripcion: "Gabinete ATX con ventilacion", categoria: "gabinetes", id_proveedor: 3 },
  { id: 4, descripcion: 'Monitor 24" IPS', categoria: "monitores", id_proveedor: 2 },
  { id: 5, descripcion: "Memoria DDR4 8GB", categoria: "memorias", id_proveedor: 2 },
  { id: 6, descripcion: "Disco SSD 480GB", categoria: "discos", id_proveedor: 1 },
  { id: 7, descripcion: "Teclado mecanico", categoria: "otros", id_proveedor: 3 },
  { id: 8, descripcion: "Disco HDD 1TB", categoria: "discos", id_proveedor: 2 },
];

const MANTENIMIENTOS = [
  {
    id: 1,
    fecha: d("2026-03-10"),
    tarea: "Limpieza interna y cambio de pasta termica",
    realizo: 2,
    observaciones: "Se detecto acumulacion de polvo en el disipador.",
  },
  {
    id: 2,
    fecha: d("2026-05-22"),
    tarea: "Actualizacion de sistema operativo y drivers",
    realizo: 2,
    observaciones: "Sin incidentes.",
  },
];

// Cubre los 4 tipos del enum equipo_tipo. El id 4 queda sin empleado asignado
// a proposito, para ejercitar la FK opcional en la UI.
const EQUIPOS = [
  { id: 1, tipo: "PC", so: "Windows 11", ram: 16, ip: "192.168.1.10", empleado: 1, mantenimiento: 1, observaciones: "Equipo de recepcion." },
  { id: 2, tipo: "Notebook", so: "Windows 11", ram: 8, ip: "192.168.1.11", empleado: 2, mantenimiento: null, observaciones: null },
  { id: 3, tipo: "Impresora", so: null, ram: 0, ip: "192.168.1.50", empleado: null, mantenimiento: null, observaciones: "Impresora de red compartida." },
  { id: 4, tipo: "PC", so: "Ubuntu 22.04", ram: 8, ip: null, empleado: null, mantenimiento: null, observaciones: "Sin asignar, en deposito." },
  { id: 5, tipo: "Otros", so: null, ram: 0, ip: null, empleado: 4, mantenimiento: 2, observaciones: "Lector de codigo de barras." },
];

const COMPRAS = [
  {
    id: 1,
    fecha: d("2026-04-15"),
    proveedor: 1,
    lineas: [
      { id: 1, articulo: 1, cantidad: 10, precio_unitario: 45000 },
      { id: 2, articulo: 6, cantidad: 5, precio_unitario: 38000 },
    ],
  },
  {
    id: 2,
    fecha: d("2026-06-02"),
    proveedor: 2,
    lineas: [
      { id: 3, articulo: 4, cantidad: 4, precio_unitario: 180000 },
      { id: 4, articulo: 5, cantidad: 8, precio_unitario: 22000 },
      { id: 5, articulo: 8, cantidad: 2, precio_unitario: 55000 },
    ],
  },
];

// Los articulos 2, 3 y 7 quedan sin compras a proposito: su stock da 0 y
// permite ver ese caso borde en la UI.
const ENTREGAS = [
  { id: 1, id_articulo: 1, id_empleado: 1, fecha: d("2026-04-20") },
  { id: 2, id_articulo: 4, id_empleado: 2, fecha: d("2026-06-05") },
  { id: 3, id_articulo: 5, id_empleado: 3, fecha: d("2026-06-06") },
];

async function seedDemo() {
  const up = (modelo, filas) =>
    Promise.all(
      filas.map((data) =>
        prisma[modelo].upsert({ where: { id: data.id }, update: data, create: data })
      )
    );

  // El orden lo dictan las claves foraneas.
  await up("proveedor", PROVEEDORES);
  await up("empleado", EMPLEADOS);
  await up("articulo", ARTICULOS);
  await up("mantenimiento", MANTENIMIENTOS);
  await up("equipo", EQUIPOS);

  for (const { lineas, ...compra } of COMPRAS) {
    // precio_total e importe_total se calculan, nunca se hardcodean: el seed
    // no debe poder introducir la inconsistencia que el codigo evita.
    const conTotal = lineas.map((l) => ({
      ...l,
      compra: compra.id,
      precio_total: l.cantidad * l.precio_unitario,
    }));
    const importe_total = conTotal.reduce((acc, l) => acc + l.precio_total, 0);

    const data = { ...compra, importe_total };
    await prisma.compra.upsert({ where: { id: compra.id }, update: data, create: data });
    await up("lista", conTotal);
  }

  await up("entrega", ENTREGAS);

  console.log(
    `Datos de demostracion cargados: ${PROVEEDORES.length} proveedores, ` +
      `${EMPLEADOS.length} empleados, ${ARTICULOS.length} articulos, ` +
      `${EQUIPOS.length} equipos, ${COMPRAS.length} compras, ${ENTREGAS.length} entregas.`
  );
}

async function main() {
  await seedAdmin();

  if (await baseVacia()) {
    await seedDemo();
  } else {
    console.log("La base ya tiene datos: se omiten los datos de demostracion.");
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error("Fallo el seed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
