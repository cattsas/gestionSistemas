import { notFound } from "next/navigation";
import PageTitle from "@/components/dashboard/PageTitle";
import EntityForm from "@/components/EntityForm";
import CompraDetalle from "@/components/dashboard/CompraDetalle";
import { getEntity } from "@/lib/entities";
import { getOne, optionsForForm } from "@/lib/services/crud";
import { getCompraDetalle } from "@/lib/services/compra";

export default async function DetalleEntidad({ params, searchParams }) {
  const { entity, id } = await params;
  const { editar } = await searchParams;

  const descriptor = getEntity(entity);
  if (!descriptor) notFound();

  const parsedId = Number.parseInt(id, 10);
  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound();

  const modo = editar ? "update" : "view";

  // Compra en modo "ver" tiene su propia vista: cabecera a modo subtitulo y
  // la tabla de lineas, en vez del formulario generico deshabilitado.
  if (entity === "compra" && modo === "view") {
    let detalle;
    try {
      detalle = await getCompraDetalle(parsedId);
    } catch {
      notFound();
    }
    return (
      <section>
        <PageTitle title={`${descriptor.label.one} #${parsedId}`} />
        <CompraDetalle compra={detalle} />
      </section>
    );
  }

  let registro;
  try {
    registro = await getOne(entity, parsedId);
  } catch {
    notFound();
  }

  const options = await optionsForForm(entity);

  return (
    <section>
      <PageTitle title={`${descriptor.label.one} #${parsedId}`} />
      <EntityForm
        entityName={entity}
        initialData={registro}
        options={options}
        mode={modo}
      />
    </section>
  );
}
