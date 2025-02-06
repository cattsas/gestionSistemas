import prisma from "@/lib/prisma";

export default async function getStockRestante(id) {
  const parsedId = parseInt(id); // Asegúrate de que el id esté en formato numérico
  try {
    // Obtener las compras agrupadas por artículo y sumar las cantidades
    const comprado = await prisma.lista.groupBy({
      by: ['articulo'],
      where: {
        articulo: parsedId
      },
      _sum: {
        cantidad: true, // Sumar las cantidades para cada artículo
      },
    });

    // Obtener las entregas agrupadas por artículo y contar los registros de entrega
    const entregas = await prisma.entrega.groupBy({
      by: ['id_articulo'],
      where: {
        id_articulo: parsedId
      },
      _count: {
        id: true, // Contar el número de entregas por cada artículo
      },
    });

    // Obtener el detalle del artículo
    const articulo = await prisma.articulo.findUnique({
      where: {
        id: parsedId
      },
      select: {
        id: true,
        descripcion: true, // Aquí puedes incluir otros campos si lo prefieres
      },
    });

    // Si no se encuentra el artículo, devolver un valor nulo o un error
    if (!articulo) {
      throw new Error(`Articulo con id ${parsedId} no encontrado`);
    }

    // Calcular el stock restante para el artículo
    const compras = comprado.find(item => item.articulo === articulo.id);
    const entregados = entregas.find(item => item.id_articulo === articulo.id);
    const stockRestante = (compras ? compras._sum.cantidad : 0) - (entregados ? entregados._count.id : 0);
    console.log ("Stock restante:", stockRestante);

    // Devolver solo la cantidad de stock restante
    return stockRestante;
  } catch (error) {
    console.error("Error:", error);
    throw new Error(error.message || "Error al obtener el stock del artículo");
  }
}
