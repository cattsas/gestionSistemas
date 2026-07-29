import { notFound } from "next/navigation";
import PageTitle from "@/components/dashboard/PageTitle";
import EntityForm from "@/components/EntityForm";
import { getEntity } from "@/lib/entities";
import { getOne, optionsForForm } from "@/lib/services/crud";

export default async function DetalleEntidad({ params, searchParams }) {
  const { entity, id } = await params;
  const { editar } = await searchParams;

  const descriptor = getEntity(entity);
  if (!descriptor) notFound();

  const parsedId = Number.parseInt(id, 10);
  if (!Number.isInteger(parsedId) || parsedId <= 0) notFound();

  let registro;
  try {
    registro = await getOne(entity, parsedId);
  } catch {
    notFound();
  }

  const options = await optionsForForm(entity);
  const modo = editar ? "update" : "view";

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
