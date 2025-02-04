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

export async function DELETE(request, props) {
    const params = await props.params;
    const  {id} =  params;
    const parsedId = parseInt(id);
    try {
        const compra=await prisma.compra.delete({
            where: {
                id: parsedId
            }
        });
       
        return NextResponse.json({message:"El registro ha sido eliminado",compra}, {status:200});
    } catch (error) {
         // Verificar si el error es por un registro no encontrado
         if (error.code === 'P2025') {
            return NextResponse.json(`Articulo con id ${id} no encontrado`, { status: 404 });
        }
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al eliminar la compra", { status: 500 });
    }
}

export async function PUT(request, props) {
    const params = await props.params;
    const { id } =  params;  // 
    const parsedId = parseInt(id);
    const body = await request.json();
    try {
        const compra=await prisma.compra.update({
            where: {
                id: parsedId
            },
            data: body
        });
       
        return NextResponse.json({message:"El registro ha sido actualizado",compra}, {status:200});
    } catch (error) {
         // Verificar si el error es por un registro no encontrado
         if (error.code === 'P2025') {
            return NextResponse.json(`Articulo con id ${id} no encontrado`, { status: 404 });
        }
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al actualizar la compra", { status: 500 });
    }
}