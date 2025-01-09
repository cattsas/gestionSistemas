import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const articulo=await prisma.articulo.findUnique({
            where: {
                id: parsedId
            }
        });
        if (!articulo){
            return NextResponse.json(`Articulo con id ${id} no encontrado`, { status: 404 });
        }
        return NextResponse.json(articulo);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener el articulo", { status: 500 });
    }
}