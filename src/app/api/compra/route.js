import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const compra = await prisma.compra.findMany();
        return NextResponse.json(compra);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener la compra", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const compra = await prisma.compra.create({
            data: body
        });
        return NextResponse.json(compra, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al crear la compra", { status: 500 });
    }
}