import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 



export async function GET () { 
    try {
        const artComprados = await prisma.lista.groupBy({
            by: ['articulo'], // Agrupar por el campo articulo
            _sum: {
              cantidad: true, // Sumar las cantidades para cada artículo
            },
           
          });
        
         // Agrupar por articulo y contar las entregas
         const entregasPorArticulo = await prisma.entrega.groupBy({
        by: ['id_articulo'], // Agrupar por el campo id_articulo
        _count: {
          id: true, // Contar el número de entregas por cada artículo
        },
      });

     // Obtener los detalles de los artículos (como nombre, descripción, id, etc.)
        const articulos = await prisma.articulo.findMany({
        where: {
          id: {
            in: [...new Set([...artComprados.map(item => item.articulo),])],
          },
        },
        select: {
          id: true,
          descripcion: true, // Aquí puedes incluir otros campos si lo prefieres
        },
      });
       
     
        // Calcular el stock restante para cada artículo
        const resultado=articulos.map((articulo)=>{
        const compras=artComprados.find(item=>item.articulo===articulo.id);
        const entregas=entregasPorArticulo.find(item=>item.id_articulo===articulo.id);
        const stockRestante=(compras?compras._sum.cantidad:0)-(entregas?entregas._count.id:0);
        return{
          
          articuloDescripcion:articulo.descripcion,
          stockRestante,
        };
      });
      // Devolver la respuesta con el stock restante
      return NextResponse.json({ stock: resultado }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: 'Error al calcular el stock' }, { status: 500 });
    }
  
       
    
}