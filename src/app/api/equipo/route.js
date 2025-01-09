import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const equipos = await prisma.equipo.findMany();
        return NextResponse.json(equipos);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener los equipos", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const equipo = await prisma.equipo.create({
            data: body
        });
        return NextResponse.json(equipo, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al crear el equipo", { status: 500 });
    }
}