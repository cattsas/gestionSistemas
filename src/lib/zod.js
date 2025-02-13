import { number, object, string } from "zod";

export const artFormSchema = object({
  proveedor: string()
    .min(2, { message: "Proveedor debe tener minimo 2 caracteres." })
    .max(50, { message: "Proveedor debe tener maximo 50 caracteres." }),

  descripcion: string()
    .min(5, { message: "Descripcion debe tener minimo 5 caracteres." })
    .max(50, { message: "Descripcion debe tener maximo 50 caracteres." }),

  categoria: string().min(1, { message: "Categoria no puede estar vacio." }),

  cantidad: number().min(1, { message: "Cantidad no puede estar vacio." }),
});
