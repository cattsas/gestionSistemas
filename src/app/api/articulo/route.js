import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import getStockRestante from "@/lib/calcStock";

export async function GET() {
  try {
    const articulos = await prisma.articulo.findMany({
      select: {
        id: true,
        descripcion: true,
        proveedor: {
          select: {
            nombre: true,
          },
        },
      },
    });
    const formattedArticulos = await Promise.all(
      articulos.map(async (articulo) => {
        console.log("Articulosss:", articulos);
        const cantidad = await getStockRestante(articulo.id);

        return {
          id: articulo.id,
          descripcion: articulo.descripcion,
          proveedor: articulo.proveedor.nombre,
          Stock: cantidad,
        };
      })
    );
    return NextResponse.json(formattedArticulos);
  } catch (error) {
    return NextResponse.json(
      error.message || "Error al obtener los articulos",
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("Body recibido:", body);
    // Buscar el proveedor por su nombre
    const proveedor = await prisma.proveedor.findUnique({
      where: {
        nombre: body.proveedorNombre, // Asume que el campo en el body es "proveedorNombre"
      },
    });

    // Si el proveedor no existe, devolver un error
    if (!proveedor) {
      return NextResponse.json(
        { error: "Proveedor no encontrado" },
        { status: 404 }
      );
    }
    const articulo = await prisma.articulo.create({
      data: {
        descripcion: body.descripcion, // Campo descripcion
        categoria: body.categoria, // Campo categoria (asegúrate de que sea válido)
        id_proveedor: proveedor.id, // Asignar el ID del proveedor
        // Si hay otros campos en el body, añádelos aquí
      },
    });
    console.log("data:", articulo);
    return NextResponse.json(articulo, {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return NextResponse.json(error.message || "Error al crear el articulo", {
      status: 500,
    });
  }
}
