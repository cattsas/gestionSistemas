import { articulo_categoria, equipo_tipo } from "@prisma/client";
import { NextResponse } from "next/server";

const enums = {
  equipo_tipo: equipo_tipo,
  articulo_categoria: articulo_categoria,
};

export async function GET(req, { params }) {
  try {
    const { enum: enumName } = await params;
    console.log(enumName);
    if (!enumName || !enums[enumName]) {
      return NextResponse.json({ error: "Enum no válido" }, { status: 400 });
    }

    const valores = Object.values(enums[enumName]);

    return NextResponse.json({ valores });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener valores del enum" },
      { status: 500 }
    );
  }
}
