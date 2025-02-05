import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const comprado=await prisma.lista.groupBy({
            by  : ['articulo'],
            where: {
                articulo: parsedId
            },
            _sum: {
                cantidad: true, // Sumar las cantidades para cada artículo
              },
        });

        const entregas=await prisma.entrega.groupBy({
            by  : ['id_articulo'],
            where: {
                id_articulo: parsedId
            },
            _count: {
                id: true, // Contar el número de entregas por cada artículo
            },
        });

        const articulo = await prisma.articulo.findUnique({
            where: {
              id: parsedId
            },
            select: {
              id: true,
              descripcion: true, // Aquí puedes incluir otros campos si lo prefieres
            },
          });
        
         // Calcular el stock restante para cada artículo
      
            const compras=comprado.find(item=>item.articulo===articulo.id);
            const entregados=entregas.find(item=>item.id_articulo===articulo.id);
            const stockRestante=(compras?compras._sum.cantidad:0)-(entregados?entregados._count.id:0);
          
            return NextResponse.json({
                articuloDescripcion: articulo.descripcion,
                stockRestante,
              }, { status: 200 });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener el equipo", { status: 500 });
    }
}