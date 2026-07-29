import { z } from "zod";

const entrega = {
  name: "entrega",
  model: "entrega",
  label: { one: "Entrega", many: "Entregas" },
  displayField: (row) => `Entrega #${row.id}`,
  fields: [
    {
      name: "fecha",
      label: "Fecha",
      control: "date",
      required: true,
      zod: z.coerce.date({ message: "Fecha inválida" }),
    },
    {
      name: "id_articulo",
      label: "Artículo",
      control: "reference",
      required: true,
      ref: { entity: "articulo", relation: "articulo" },
      zod: z.coerce.number().int().positive("Seleccione un artículo"),
    },
    {
      name: "id_empleado",
      label: "Entregado a",
      control: "reference",
      required: true,
      ref: { entity: "empleado", relation: "empleado" },
      zod: z.coerce.number().int().positive("Seleccione un empleado"),
    },
  ],
  list: ["id", "fecha", "id_articulo", "id_empleado"],
};

export default entrega;
