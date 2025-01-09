import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const ent=await prisma.entrega.findUnique({
            where: {
                id: parsedId
            }
        });
        if (!ent){
            return NextResponse.json(`Entrega con id ${id} no encontrada`, { status: 404 });
        }
        return NextResponse.json(ent);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener la entrega", { status: 500 });
    }
}