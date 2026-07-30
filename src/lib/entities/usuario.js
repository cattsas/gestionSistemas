import { z } from "zod";

const usuario = {
  name: "usuario",
  model: "usuario",
  label: { one: "Usuario", many: "Usuarios" },
  displayField: "usuario",
  // Sigue en el menu lateral (se administra desde ahi); solo se saca la
  // tarjeta de conteo del dashboard.
  hideFromDashboard: true,
  fields: [
    {
      name: "usuario",
      label: "Usuario",
      control: "text",
      required: true,
      zod: z
        .string()
        .trim()
        .min(3, "Mínimo 3 caracteres")
        .max(30, "Máximo 30 caracteres")
        .regex(/^[a-zA-Z0-9._-]+$/, "Solo letras, números, punto, guion y guion bajo"),
    },
    {
      name: "pass",
      label: "Contraseña",
      control: "password",
      required: true,
      // En edicion se permite vacio para indicar "no cambiar"; eso lo resuelve
      // buildZodSchema segun el modo.
      zod: z.string().min(8, "Mínimo 8 caracteres").max(72, "Máximo 72 caracteres"),
    },
  ],
  list: ["id", "usuario"],
};

export default usuario;
