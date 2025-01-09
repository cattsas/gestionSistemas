import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } =  params;  // Esto puede ser innecesario si params no es asíncrono
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

export async function DELETE (request,{params}) {    
    const  {id} =  params;  
    const parsedId = parseInt(id); 
    try {
        const ent=await prisma.entrega.delete({
            where: {
                id: parsedId
            }
        });
        if (!ent){
            return NextResponse.json(`Entrega con id ${id} no encontrada`, { status: 404 });
        }
        return NextResponse.json({message:"El registro ha sido eliminado",ent}, {status:200});
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al eliminar la entrega", { status: 500 });
    }
}

export async function PUT (request,{params}) {    
    const { id } =  params;  // 
    const parsedId = parseInt(id); 
    const body = await request.json(); 
    try {
        const ent=await prisma.entrega.update({
            where: {
                id: parsedId
            },
            data: body
        });
        if (!ent){
            return NextResponse.json(`Entrega con id ${id} no encontrada`, { status: 404 });
        }
        return NextResponse.json({message:"El registro ha sido actualizado",ent}, {status:200});
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al actualizar la entrega", { status: 500 });
    }
}