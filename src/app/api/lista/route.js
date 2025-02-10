import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const detalle = await prisma.lista.findMany();
        return NextResponse.json(detalle);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener los items", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();

        const precioTotal = body.cantidad * body.precio_unitario;
        const detalle = await prisma.lista.create({
            data:{ ...body,
                precio_total: precioTotal
            }
        });
        return NextResponse.json(detalle, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al crear el detalle", { status: 500 });
    }
}