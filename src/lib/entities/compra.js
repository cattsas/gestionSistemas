import { z } from "zod";

const compra = {
  name: "compra",
  model: "compra",
  label: { one: "Compra", many: "Compras" },
  displayField: (row) => `Compra #${row.id}`,
  fields: [
    {
      name: "fecha",
      label: "Fecha",
      control: "date",
      required: true,
      zod: z.coerce.date({ message: "Fecha inválida" }),
    },
    {
      name: "nro_comprobante",
      label: "Nro. de comprobante",
      control: "text",
      required: true,
      zod: z
        .string()
        .trim()
        .min(1, "Ingrese el número de comprobante")
        .max(20, "Máximo 20 caracteres"),
    },
    {
      name: "proveedor",
      label: "Proveedor",
      control: "reference",
      required: true,
      ref: { entity: "proveedor", relation: "proveedorRef" },
      zod: z.coerce.number().int().positive("Seleccione un proveedor"),
    },
  ],
  // importe_total es una columna real, pero la mantiene el servidor a partir
  // de las lineas de la compra. El cliente nunca la escribe.
  computed: [{ name: "importe_total", label: "Importe total", type: "float" }],
  list: ["id", "fecha", "nro_comprobante", "proveedor", "importe_total"],
  hooks: {
    // Una compra recien creada todavia no tiene lineas.
    beforeWrite: (data, { mode }) =>
      mode === "create" ? { ...data, importe_total: 0 } : data,
  },
};

export default compra;
