import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const prov=await prisma.proveedor.findUnique({
            where: {
                id: parsedId
            }
        });
        if (!prov){
            return NextResponse.json(`Proveedor con id ${id} no encontrado`, { status: 404 });
        }
        return NextResponse.json(prov);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener el proveedor", { status: 500 });
    }
}

export async function DELETE (request,{params}) {    
    const  {id} =  params;  
    const parsedId = parseInt(id); 
    try {
        const prov=await prisma.proveedor.delete({
            where: {
                id: parsedId
            }
        });
        return NextResponse.json({message:"El registro ha sido eliminado",prov}, {status:200});
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al eliminar el proveedor", { status: 500 });
    }
}

export async function PUT (request,{params}) {    
    const { id } =  params;  // 
    const parsedId = parseInt(id); 
    const body = await request.json(); 
    try {
        const prov=await prisma.proveedor.update({
            where: {
                id: parsedId
            },
            data: body
        });
        return NextResponse.json({message:"El registro ha sido actualizado",prov}, {status:200});
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al actualizar el proveedor", { status: 500 });
    }
}