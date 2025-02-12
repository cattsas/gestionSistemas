// pages/api/categorias.js
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req, res) {
  try {
    // Obtener los valores del enum 'categoria' de la tabla 'articulo'
    const result =
      await prisma.$queryRaw`SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'articulo' AND COLUMN_NAME = 'categoria'`;
    console.log("Resultado:", result);
    // Procesar el resultado para obtener los valores del enum
    const enumValues = result[0].COLUMN_TYPE.replace("enum(", "")
      .replace(")", "")
      .split(",")
      .map((value) => value.replace("'", "").replace("'", ""));

    // Enviar el resultado como respuesta en formato JSON
    return NextResponse.json(enumValues);
  } catch (error) {
    // Log para mostrar el error completo en la consola
    console.error("Error al obtener las categorías:", error);

    // Revisar si el error tiene una propiedad 'message'
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Enviar el error con más detalles en la respuesta
    return new Response(
      JSON.stringify({
        error: "Error al obtener las categorías",
        details: errorMessage,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
