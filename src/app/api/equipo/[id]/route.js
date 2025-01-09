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

export async function DELETE(request, props) {
    const params = await props.params;
    const  {id} =  params;
    const parsedId = parseInt(id);
    try {
        const equipo=await prisma.equipo.delete({
            where: {
                id: parsedId
            }
        });
       
        return NextResponse.json({message:"El registro ha sido eliminado",equipo}, {status:200});
    } catch (error) {
        if (error.code === 'P2025') {
            return NextResponse.json(`Equipo con id ${id} no encontrado`, { status: 404 });
        }
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al eliminar el equipo", { status: 500 });
    }
}

export async function PUT(request, props) {
    const params = await props.params;
    const { id } =  params;  // 
    const parsedId = parseInt(id);
    const body = await request.json();
    try {
        const equipo=await prisma.equipo.update({
            where: {
                id: parsedId
            },
            data: body
        });
      
        return NextResponse.json({message:"El registro ha sido actualizado",equipo}, {status:200});
    } catch (error) {
        if (error.code === 'P2025') {
            return NextResponse.json(`Equipo con id ${id} no encontrado`, { status: 404 });
        }
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al actualizar el equipo", { status: 500 });
    }
}