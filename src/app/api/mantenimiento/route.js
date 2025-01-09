import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const tareas = await prisma.mantenimiento.findMany();
        return NextResponse.json(tareas);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener las tareas", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const tarea = await prisma.mantenimiento.create({
            data: body
        });
        return NextResponse.json(entrega, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al crear la tarea", { status: 500 });
    }
}