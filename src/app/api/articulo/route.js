import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const articulos = await prisma.articulo.findMany({
        select: { 
            id: true,
            descripcion:true,
            proveedor:{
               select: {
                nombre:true
           }
        },
       
        },
        });
        const formattedArticulos = articulos.map(articulo => ({
            id: articulo.id,
            descripcion:articulo.descripcion,
            proveedor: articulo.proveedor.nombre
        }));
        console.log (formattedArticulos);
        return NextResponse.json((formattedArticulos));
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener los articulos", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const articulo = await prisma.articulo.create({
            data: body
        });
        return NextResponse.json(articulo, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al crear el articulo", { status: 500 });
    }
}