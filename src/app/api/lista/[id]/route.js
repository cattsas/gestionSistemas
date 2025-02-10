import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const detalle=await prisma.lista.findUnique({
            where: {
                id: parsedId
            }
        });
        if (!detalle){
            return NextResponse.json(`Detalle con id ${id} no encontrado`, { status: 404 });
        }
        return NextResponse.json(detalle);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener el detalle", { status: 500 });
    }
}

export async function DELETE(request, props) {
    const params = await props.params;
    const  {id} =  params;
    const parsedId = parseInt(id);
    try {
        const equipo=await prisma.lista.delete({
            where: {
                id: parsedId
            }
        });
       
        return NextResponse.json({message:"El registro ha sido eliminado",equipo}, {status:200});
    } catch (error) {
        if (error.code === 'P2025') {
            return NextResponse.json(`Detalle con id ${id} no encontrado`, { status: 404 });
        }
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al eliminar el detalle", { status: 500 });
    }
}

export async function PUT(request, props) {
    const params = await props.params;
    const { id } =  params;  // 
    const parsedId = parseInt(id);
    const body = await request.json();
    const precioTotal = body.cantidad * body.precio_unitario;
    try {
        const detalle=await prisma.lista.update({
            where: {
                id: parsedId
            },
            data: {...body,
                precio_total: precioTotal
            }
        });
      
        return NextResponse.json({message:"El registro ha sido actualizado",detalle}, {status:200});
    } catch (error) {
        if (error.code === 'P2025') {
            return NextResponse.json(`Detalle con id ${id} no encontrado`, { status: 404 });
        }
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al actualizar el detalle", { status: 500 });
    }
}