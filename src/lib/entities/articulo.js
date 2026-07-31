import { z } from "zod";

export const CATEGORIAS = [
  "fuentes",
  "mothers",
  "gabinetes",
  "monitores",
  "memorias",
  "discos",
  "otros",
];

// Un numero opcional: "" (el default del formulario) y null (lo que deja
// normalizeInput en el servidor) tienen que resolverse como "no se cargo
// nada", no como 0 - z.coerce.number() por si solo convierte "" en 0, lo que
// rompe el .optional() de mas abajo antes de llegar a evaluarlo.
const opcionalEntero = (schema) =>
  z.preprocess((v) => (v === "" || v == null ? undefined : v), schema.optional());

const articulo = {
  name: "articulo",
  model: "articulo",
  label: { one: "Artículo", many: "Artículos" },
  displayField: "descripcion",
  fields: [
    {
      // El id es visible como "Código". No sirve para elegir la clave de un
      // articulo nuevo: si se ingresa uno que ya existe, el alta no crea una
      // fila sino que suma stock a esa (ver api/articulo/route.js). Para dar
      // de alta un articulo nuevo hay que dejarlo vacio.
      name: "id",
      label: "Código",
      control: "number",
      required: false,
      createOnly: true,
      // Si el codigo ingresado ya existe, el formulario autocompleta estos
      // campos con los de ese articulo (ver EntityForm).
      lookupAutofill: ["descripcion", "categoria", "id_proveedor"],
      zod: opcionalEntero(
        z.coerce.number().int().positive("El código debe ser un entero mayor a 0")
      ),
    },
    {
      name: "descripcion",
      label: "Descripción",
      control: "textarea",
      required: true,
      zod: z.string().trim().min(3, "Mínimo 3 caracteres").max(50, "Máximo 50 caracteres"),
    },
    {
      name: "categoria",
      label: "Categoría",
      control: "enum",
      required: true,
      options: CATEGORIAS,
      zod: z.enum(CATEGORIAS, { message: "Seleccione una categoría" }),
    },
    {
      name: "id_proveedor",
      label: "Proveedor",
      control: "reference",
      required: true,
      ref: { entity: "proveedor", relation: "proveedor" },
      zod: z.coerce.number().int().positive("Seleccione un proveedor"),
    },
    {
      // Cantidad a sumar al stock. Si el codigo esta vacio (articulo nuevo)
      // es el stock de arranque; si el codigo ya existe, es lo que se suma
      // al stock que ya tenia (ver api/articulo/route.js).
      name: "stock_inicial",
      label: "Stock",
      control: "number",
      required: false,
      createOnly: true,
      zod: opcionalEntero(z.coerce.number().int().nonnegative("Debe ser 0 o mayor")),
    },
  ],
  // El stock no es una columna: sale del stock inicial mas compras menos
  // entregas.
  computed: [{ name: "stock", label: "Stock", type: "number" }],
  list: ["id", "descripcion", "categoria", "id_proveedor", "stock"],
  hooks: {
    // Esto solo corre para el alta de un articulo nuevo (codigo vacio): la
    // ruta ya resolvio el caso "codigo existente" antes de llegar aca (ver
    // api/articulo/route.js), asi que "id" nunca se escribe a mano. Prisma
    // no acepta null en una columna no nula aunque tenga autoincrement o
    // default, asi que hay que sacar la clave del payload en vez de mandarla
    // en null.
    beforeWrite: (data, { mode }) => {
      if (mode !== "create") return data;
      const out = { ...data };
      delete out.id;
      out.stock_inicial = out.stock_inicial ?? 0;
      return out;
    },
  },
};

export default articulo;
