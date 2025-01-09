import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const emp=await prisma.empleado.findUnique({
            where: {
                id: parsedId
            }
        });
        if (!emp){
            return NextResponse.json(`Empleado con id ${id} no encontrado`, { status: 404 });
        }
        return NextResponse.json(emp);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener el empleado", { status: 500 });
    }
}