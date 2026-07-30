import { z } from "zod";

const lista = {
  name: "lista",
  model: "lista",
  label: { one: "Línea de compra", many: "Líneas de compra" },
  displayField: (row) => `Línea #${row.id}`,
  // No tiene pantalla propia en el menu: se gestiona desde el detalle de la
  // compra a la que pertenece.
  hideFromMenu: true,
  fields: [
    {
      name: "compra",
      label: "Compra",
      control: "reference",
      required: true,
      ref: { entity: "compra", relation: "compraRef" },
      zod: z.coerce.number().int().positive("Seleccione una compra"),
    },
    {
      name: "articulo",
      label: "Artículo",
      control: "reference",
      required: true,
      ref: { entity: "articulo", relation: "articuloRef" },
      zod: z.coerce.number().int().positive("Seleccione un artículo"),
    },
    {
      name: "cantidad",
      label: "Cantidad",
      control: "number",
      required: true,
      zod: z.coerce.number({ invalid_type_error: "Debe ser un número" }).int().positive("Debe ser mayor a 0"),
    },
    {
      name: "precio_unitario",
      label: "Precio unitario",
      control: "float",
      required: true,
      zod: z.coerce.number({ invalid_type_error: "Debe ser un número" }).nonnegative(),
    },
  ],
  computed: [{ name: "precio_total", label: "Precio total", type: "float" }],
  list: ["id", "compra", "articulo", "cantidad", "precio_unitario", "precio_total"],
  hooks: {
    // El total de la linea siempre lo calcula el servidor: que el cliente
    // pueda mandarlo es como se desincronizaba antes.
    beforeWrite: (data) => ({
      ...data,
      precio_total: (data.cantidad ?? 0) * (data.precio_unitario ?? 0),
    }),
    // Mantiene compra.importe_total consistente ante alta, edicion y baja.
    afterWrite: async (row, { tx }) => {
      await recalcularCompra(tx, row.compra);
    },
    afterDelete: async (row, { tx }) => {
      await recalcularCompra(tx, row.compra);
    },
  },
};

async function recalcularCompra(tx, compraId) {
  if (!compraId) return;
  const { _sum } = await tx.lista.aggregate({
    where: { compra: compraId },
    _sum: { precio_total: true },
  });
  await tx.compra.update({
    where: { id: compraId },
    data: { importe_total: _sum.precio_total ?? 0 },
  });
}

export default lista;
