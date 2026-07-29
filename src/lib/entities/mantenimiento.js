import { z } from "zod";

const mantenimiento = {
  name: "mantenimiento",
  model: "mantenimiento",
  label: { one: "Mantenimiento", many: "Mantenimientos" },
  displayField: (row) => {
    const t = row.tarea ?? "";
    return `#${row.id} · ${t.length > 40 ? `${t.slice(0, 40)}…` : t}`;
  },
  fields: [
    {
      name: "fecha",
      label: "Fecha",
      control: "date",
      required: true,
      zod: z.coerce.date({ message: "Fecha inválida" }),
    },
    {
      name: "tarea",
      label: "Tarea",
      control: "textarea",
      required: true,
      zod: z.string().trim().min(3, "Mínimo 3 caracteres").max(500, "Máximo 500 caracteres"),
    },
    {
      name: "realizo",
      label: "Realizado por",
      control: "reference",
      required: true,
      ref: { entity: "empleado", relation: "responsable" },
      zod: z.coerce.number().int().positive("Seleccione un empleado"),
    },
    {
      name: "observaciones",
      label: "Observaciones",
      control: "textarea",
      required: true,
      zod: z.string().trim().max(500, "Máximo 500 caracteres"),
    },
  ],
  list: ["id", "fecha", "tarea", "realizo"],
};

export default mantenimiento;
