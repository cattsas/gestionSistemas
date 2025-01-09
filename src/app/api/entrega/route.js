import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const entregas = await prisma.entrega.findMany();
        return NextResponse.json(entregas);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener las entregas", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const entrega = await prisma.entrega.create({
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
        return  NextResponse.json(error.message || "Error al crear la entrega", { status: 500 });
    }
}