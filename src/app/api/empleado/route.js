import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const empleados = await prisma.empleado.findMany();
        return NextResponse.json(empleados);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener los empleados", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const empleado = await prisma.empleado.create({
            data: body
        });
        return NextResponse.json(empleado, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al crear el empleado", { status: 500 });
    }
}