import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const equipo=await prisma.equipo.findUnique({
            where: {
                id: parsedId
            }
        });
        if (!equipo){
            return NextResponse.json(`Equipo con id ${id} no encontrado`, { status: 404 });
        }
        return NextResponse.json(equipo);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener el equipo", { status: 500 });
    }
}