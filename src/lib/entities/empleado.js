import { z } from "zod";

const empleado = {
  name: "empleado",
  model: "empleado",
  label: { one: "Empleado", many: "Empleados" },
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
      name: "sector",
      label: "Sector",
      control: "text",
      required: true,
      zod: z.string().trim().min(2, "Mínimo 2 caracteres").max(30, "Máximo 30 caracteres"),
    },
  ],
  list: ["id", "nombre", "sector"],
};

export default empleado;
