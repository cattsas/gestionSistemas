import { z } from "zod";

export const TIPOS_EQUIPO = ["PC", "Impresora", "Notebook", "Otros"];

// Un string vacio o el centinela de "sin asignar" tienen que llegar como null,
// no como 0 ni como "".
const opcionalTexto = (max) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .optional()
    .nullable()
    .transform((v) => (v === "" ? null : v));

const equipo = {
  name: "equipo",
  model: "equipo",
  label: { one: "Equipo", many: "Equipos" },
  displayField: (row) => `#${row.id} · ${row.tipo}`,
  fields: [
    {
      name: "tipo",
      label: "Tipo",
      control: "enum",
      required: true,
      options: TIPOS_EQUIPO,
      zod: z.enum(TIPOS_EQUIPO, { message: "Seleccione un tipo" }),
    },
    {
      name: "so",
      label: "Sistema operativo",
      control: "text",
      required: false,
      zod: opcionalTexto(30),
    },
    {
      name: "ram",
      label: "RAM (GB)",
      control: "number",
      required: true,
      zod: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int().min(0),
    },
    {
      name: "ip",
      label: "IP",
      control: "text",
      required: false,
      zod: z
        .string()
        .trim()
        .optional()
        .nullable()
        .transform((v) => (v === "" ? null : v))
        .refine((v) => v === null || v === undefined || z.string().ip({ version: "v4" }).safeParse(v).success, {
          message: "IP inválida (ej: 192.168.1.10)",
        }),
    },
    {
      name: "empleado",
      label: "Asignado a",
      control: "reference",
      required: false,
      ref: { entity: "empleado", relation: "empleadoRef" },
      zod: z.coerce.number().int().positive().optional().nullable(),
    },
    {
      name: "mantenimiento",
      label: "Último mantenimiento",
      control: "reference",
      required: false,
      ref: { entity: "mantenimiento", relation: "mantenimientoRef" },
      // Al ver un equipo, un boton debajo lleva al detalle completo de ese
      // mantenimiento (lo mismo que se ve al elegir "Ver" en su propia
      // tabla), en vez de solo la etiqueta truncada del <select>.
      viewDetailLink: true,
      zod: z.coerce.number().int().positive().optional().nullable(),
    },
    {
      name: "observaciones",
      label: "Observaciones",
      control: "textarea",
      required: false,
      zod: opcionalTexto(500),
    },
  ],
  list: ["id", "tipo", "so", "ram", "ip", "empleado"],
};

export default equipo;
