import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const compra=await prisma.compra.findUnique({
            where: {
                id: parsedId
            }
        });
        if (!compra){
            return NextResponse.json(`Compra con id ${id} no encontrada`, { status: 404 });
        }
        return NextResponse.json(compra);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener la compra", { status: 500 });
    }
}