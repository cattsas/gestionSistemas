import { notFound } from "next/navigation";
import { DataTable } from "@/components/DataTable";
import { getEntity } from "@/lib/entities";
import { columnsFor } from "@/lib/entities/helpers";
import { list } from "@/lib/services/crud";

/**
 * Tabla de una entidad.
 *
 * Antes hacia fetch a http://localhost:3000/api/... desde el servidor: eso
 * fijaba el host, agregaba un viaje HTTP innecesario y se habria roto al
 * activar el middleware, porque un fetch server-side no lleva la cookie.
 * Ahora llama directo a la capa de servicio.
 */
export default async function GenerateTable({ end }) {
  const entity = getEntity(end);
  if (!entity) notFound();

  const data = await list(end);

  // Sin adjetivo a proposito: "cargados" no concuerda con los femeninos
  // (entregas, compras, lineas de compra).
  const emptyMessage = `No hay ${entity.label.many.toLowerCase()} para mostrar`;

  return (
    <div className="container mt-10">
      <DataTable
        end={end}
        columns={columnsFor(entity)}
        data={data}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
