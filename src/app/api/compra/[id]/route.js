import prisma from "@/lib/prisma";  
import { NextResponse } from "next/server";

export async function GET (request,{params}) {   
    
    const { id } = await params;  // Esto puede ser innecesario si params no es asíncrono
    const parsedId = parseInt(id); 
    try {
        const items=await prisma.lista.findMany({
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
        let suma=0;
        const formatItems= await Promise.all( items.map( async (item) => {
            const precio_total = item.cantidad * item.precio_unitario;
            suma+=precio_total;

            return {
                id: item.id,
                articulo: item.articulo_lista_articuloToarticulo.descripcion,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                precio_total: precio_total
                
            };
            }));

       
        if (!formatItems || formatItems.length === 0) {
            return NextResponse.json(`Compra con id ${id} no encontrada`, { status: 404 });
        }

        const result ={
            fecha: items[0].compra_lista_compraTocompra.fecha,
            proveedor: items[0].compra_lista_compraTocompra.proveedor_compra_proveedorToproveedor.nombre,
            items:formatItems,
            total: suma,

        }
        return NextResponse.json(result);
    } catch (error) {
       
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
      
        return  NextResponse.json(error.message || "Error al actualizar la compra", { status: 500 });
    }
}