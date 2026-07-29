import { z } from "zod";

const proveedor = {
  name: "proveedor",
  model: "proveedor",
  label: { one: "Proveedor", many: "Proveedores" },
  displayField: "nombre",
  fields: [
    {
      name: "nombre",
      label: "Nombre",
      control: "text",
      required: true,
      zod: z.string().trim().min(2, "Mínimo 2 caracteres").max(30, "Máximo 30 caracteres"),
    },
    {
      name: "domicilio",
      label: "Domicilio",
      control: "text",
      required: true,
      zod: z.string().trim().min(2, "Mínimo 2 caracteres").max(30, "Máximo 30 caracteres"),
    },
    {
      name: "telefono",
      label: "Teléfono",
      control: "number",
      required: true,
      zod: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int().nonnegative(),
    },
  ],
  list: ["id", "nombre", "domicilio", "telefono"],
};

export default proveedor;
