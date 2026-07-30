import { notFound } from "next/navigation";
import PageTitle from "@/components/dashboard/PageTitle";
import EntityForm from "@/components/EntityForm";
import CompraDetalle from "@/components/dashboard/CompraDetalle";
import { getEntity } from "@/lib/entities";
import { getOne, listOptions, optionsForForm } from "@/lib/services/crud";
import { getCompraDetalle } from "@/lib/services/compra";

export default async function DetalleEntidad({ params, searchParams }) {
  const { entity, id } = await params;
  const { editar } = await searchParams;

  const descriptor = getEntity(entity);
  if (!descriptor) notFound();

  const parsedId = Number.parseInt(id, 10);
  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound();

  const modo = editar ? "update" : "view";

  // Compra tiene su propia vista, en los dos modos: la tabla de lineas de esa
  // compra se muestra siempre. El formulario para agregar lineas nuevas solo
  // aparece al editar (o recien creada, que redirige aca con ?editar=1): al
  // solo ver una compra ya cargada no tiene sentido seguir agregandole.
  if (entity === "compra") {
    let detalle;
    try {
      detalle = await getCompraDetalle(parsedId);
    } catch {
      notFound();
    }

    if (modo === "update") {
      const [registro, headerOptions, articuloOptions] = await Promise.all([
        getOne(entity, parsedId),
        optionsForForm(entity),
        listOptions("articulo"),
      ]);
      return (
        <section>
          <PageTitle title={`${descriptor.label.one} #${parsedId}`} />
          <CompraDetalle
            compra={detalle}
            editable
            registro={registro}
            headerOptions={headerOptions}
            articuloOptions={articuloOptions}
          />
        </section>
      );
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
