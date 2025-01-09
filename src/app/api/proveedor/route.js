import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
        const proveedores = await prisma.proveedor.findMany();
        return NextResponse.json(proveedores);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener los proveedores", { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const prov = await prisma.proveedor.create({
            data: body
        });
        return NextResponse.json(prov, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al crear el proveedor", { status: 500 });
    }
}