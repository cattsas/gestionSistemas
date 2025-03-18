import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import getStockRestante from "@/lib/calcStock";

export async function GET(request, { params }) {
  const { id } = await params; // Esto puede ser innecesario si params no es asíncrono
  const parsedId = parseInt(id);
  try {
    const articulo = await prisma.articulo.findUnique({
      where: {
        id: parsedId,
      },
      select: {
        id: true,
        descripcion: true,
        proveedor: {
          select: {
            nombre: true,
          },
        },
        categoria: true,
      },
    });
    if (!articulo) {
      return NextResponse.json(`Articulo con id ${id} no encontrado`, {
        status: 404,
      });
    }
    const cantidad = await getStockRestante(articulo.id);
    const formattedArticulo = {
      id: articulo.id,
      descripcion: articulo.descripcion,
      proveedor: articulo.proveedor.nombre,
      categoria: articulo.categoria,
      Stock: cantidad,
    };

    return NextResponse.json(formattedArticulo);
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(error.message || "Error al obtener el articulo", {
      status: 500,
    });
  }
}

export async function DELETE(request, props) {
  const params = await props.params;
  const { id } = params;
  const parsedId = parseInt(id);
  try {
    const articulo = await prisma.articulo.delete({
      where: {
        id: parsedId,
      },
    });

    return NextResponse.json(
      { message: "El registro ha sido eliminado", articulo },
      { status: 200 }
    );
  } catch (error) {
    // Verificar si el error es por un registro no encontrado
    if (error.code === "P2025") {
      return NextResponse.json(`Articulo con id ${id} no encontrado`, {
        status: 404,
      });
    }
    console.log("Error:", error);
    return NextResponse.json(error.message || "Error al eliminar el articulo", {
      status: 500,
    });
  }
}

export async function PUT(request, props) {
  const params = await props.params;
  const { id } = params; //
  const parsedId = parseInt(id);
  const body = await request.json();

  try {
    const articulo = await prisma.articulo.update({
      where: {
        id: parsedId,
      },
      data: body,
    });

    return NextResponse.json(
      { message: "El registro ha sido actualizado", articulo },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === "P2025") {
      return NextResponse.json(`Articulo con id ${id} no encontrado`, {
        status: 404,
      });
    }
    console.log("Error:", error);
    return NextResponse.json(
      error.message || "Error al actualizar el articulo",
      { status: 500 }
    );
  }
}
