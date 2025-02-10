import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const entregas = await prisma.entrega.findMany({
            select: { 
               id:true,
               articulo:{
                    select:{
                        descripcion:true
                    }
                },
                fecha:true,
                empleado:{
                    select: {
                     nombre:true
                    }
                }
            },
        });

        const formatEntregas= await Promise.all( entregas.map( async (entrega) => {
                        
                    
                  
                    return{   
                    id: entrega.id,
                    articulo:entrega.articulo.descripcion,
                    fecha:entrega.fecha,
                    empleado: entrega.empleado.nombre,
                   
                }
                }));

       
        return NextResponse.json(formatEntregas);
    } catch (error) {
       
        return  NextResponse.json(error.message || "Error al obtener las entregas", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const entrega = await prisma.entrega.create({
            data: body
        });
        return NextResponse.json(entrega, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        return  NextResponse.json(error.message || "Error al crear la entrega", { status: 500 });
    }
}