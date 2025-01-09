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

export async function DELETE (request,{params}) {    
    const  {id} =  params;  
    const parsedId = parseInt(id); 
    try {
        const articulo=await prisma.articulo.delete({
            where: {
                id: parsedId
            }
        });
        return NextResponse.json({message:"El registro ha sido eliminado",articulo}, {status:200});
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al eliminar el articulo", { status: 500 });
    }
}

export async function PUT (request,{params}) {    
    const { id } =  params;  // 
    const parsedId = parseInt(id); 
    const body = await request.json(); 
    try {
        const articulo=await prisma.articulo.update({
            where: {
                id: parsedId
            },
            data: body
        });
        return NextResponse.json({message:"El registro ha sido actualizado",articulo}, {status:200});
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al actualizar el articulo", { status: 500 });
    }
}