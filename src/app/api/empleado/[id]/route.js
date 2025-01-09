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

export async function DELETE (request,{params}) {    
    const  {id} =  params;  
    const parsedId = parseInt(id); 
    try {
        const emp=await prisma.empleado.delete({
            where: {
                id: parsedId
            }
        });
        return NextResponse.json({message:"El registro ha sido eliminado",emp}, {status:200});
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al eliminar el empleado", { status: 500 });
    }
}

export async function PUT (request,{params}) {    
    const { id } =  params;  // 
    const parsedId = parseInt(id); 
    const body = await request.json(); 
    try {
        const emp=await prisma.empleado.update({
            where: {
                id: parsedId
            },
            data: body
        });
        return NextResponse.json({message:"El registro ha sido actualizado",emp}, {status:200});
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al actualizar el empleado", { status: 500 });
    }
}