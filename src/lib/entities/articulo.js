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

const articulo = {
  name: "articulo",
  model: "articulo",
  label: { one: "Artículo", many: "Artículos" },
  displayField: "descripcion",
  fields: [
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
  ],
  // El stock no es una columna: sale de compras menos entregas.
  computed: [{ name: "stock", label: "Stock", type: "number" }],
  list: ["id", "descripcion", "categoria", "id_proveedor", "stock"],
};

export default articulo;
