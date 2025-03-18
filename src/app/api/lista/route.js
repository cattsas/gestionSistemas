import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Obtener los detalles desde la base de datos
    const detalle = await prisma.lista.findMany();

    // Calcular el precio total para cada elemento
    const detalleConPrecioTotal = detalle.map((item) => {
      const precioTotal = item.cantidad * item.precio_unitario;
      return { ...item, precio_total: precioTotal };
    });

    // Retornar los detalles con el precio total calculado
    return NextResponse.json(detalleConPrecioTotal);
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(error.message || "Error al obtener los items", {
      status: 500,
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    console.log("Precio Total:", body.cantidad, body.precio_unitario);
    const precioTotal = body.cantidad * body.precio_unitario;
    const detalle = await prisma.lista.create({
      data: { ...body, precio_total: precioTotal },
    });
    return NextResponse.json(detalle, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(error.message || "Error al crear el detalle", {
      status: 500,
    });
  }
}
