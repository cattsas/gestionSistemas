import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const compra=await prisma.lista.findMany({
            where:{
                compra:
                    parsedId
             } ,
            
                select: {
                    id: true,
                    articulo_lista_articuloToarticulo: {
                        select: {
                            descripcion: true
                        }
                    },
                    cantidad: true,
                    precio_unitario: true,
                    precio_total: true,
                    compra_lista_compraTocompra: {
                      select: {
                        id: true,
                        fecha: true,
                        proveedor_compra_proveedorToproveedor: {
                          select: {
                            nombre: true
                          }
                        },
                        importe_total: true
                      }
                    }
                  }
            
        });

        const formatCompra= await Promise.all( compra.map( async (compra) => {
            return {
                id: compra.id,
                fecha: compra.compra_lista_compraTocompra.fecha,
                proveedor: compra.compra_lista_compraTocompra.proveedor_compra_proveedorToproveedor.nombre,
                articulo: compra.articulo_lista_articuloToarticulo.descripcion,
                cantidad: compra.cantidad,
                precio_unitario: compra.precio_unitario,
                precio_total: compra.precio_total,
                importe_total: compra.compra_lista_compraTocompra.importe_total
            };
            }));

        console.log("Comprasssssss:", formatCompra.proveedor);
        if (!formatCompra){
            return NextResponse.json(`Compra con id ${id} no encontrada`, { status: 404 });
        }
        return NextResponse.json(formatCompra);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener la compra", { status: 500 });
    }
}

export async function DELETE(request, props) {
    const params = await props.params;
    const  {id} =  params;
    const parsedId = parseInt(id);
    try {
        const compra=await prisma.compra.delete({
            where: {
                id: parsedId
            }
        });
       
        return NextResponse.json({message:"El registro ha sido eliminado",compra}, {status:200});
    } catch (error) {
         // Verificar si el error es por un registro no encontrado
         if (error.code === 'P2025') {
            return NextResponse.json(`Articulo con id ${id} no encontrado`, { status: 404 });
        }
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al eliminar la compra", { status: 500 });
    }
}

export async function PUT(request, props) {
    const params = await props.params;
    const { id } =  params;  // 
    const parsedId = parseInt(id);
    const body = await request.json();
    try {
        const compra=await prisma.compra.update({
            where: {
                id: parsedId
            },
            data: body
        });
       
        return NextResponse.json({message:"El registro ha sido actualizado",compra}, {status:200});
    } catch (error) {
         // Verificar si el error es por un registro no encontrado
         if (error.code === 'P2025') {
            return NextResponse.json(`Articulo con id ${id} no encontrado`, { status: 404 });
        }
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al actualizar la compra", { status: 500 });
    }
}