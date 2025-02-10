import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 

export async function GET () {
    try {
      const compra = await prisma.compra.findMany({
        select: {
          id: true,
          fecha: true,
          proveedor_compra_proveedorToproveedor:{
            select: {
              nombre: true
            }
          },  
          importe_total: true,               
        }      
      });

      const formattedCompra = await Promise.all(compra.map(async (compra) => {  
        return {
          id: compra.id,
          fecha: compra.fecha,
          proveedor: compra.proveedor_compra_proveedorToproveedor.nombre,
          importe_total: compra.importe_total,          
        }
      }));
      if (!formattedCompra || formattedCompra.length === 0) {
        return NextResponse.json({ message: 'No se encontraron compras' }, { status: 404 });
      }
      return NextResponse.json(formattedCompra);
    } catch (error) {
      console.log("Error:", error);
      return NextResponse.json(error.message || "Error al obtener la compra", { status: 500 });
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