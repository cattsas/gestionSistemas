import { notFound } from "next/navigation";
import PageTitle from "@/components/dashboard/PageTitle";
import EntityForm from "@/components/EntityForm";
import { getEntity } from "@/lib/entities";
import { optionsForForm } from "@/lib/services/crud";

export default async function NuevaEntidad({ params }) {
  const { entity } = await params;
  const descriptor = getEntity(entity);
  if (!descriptor) notFound();

  // Las opciones de las FK se resuelven en el servidor y llegan listas.
  const options = await optionsForForm(entity);

  return (
    <section>
      <PageTitle title={`Nuevo ${descriptor.label.one.toLowerCase()}`} />
      <EntityForm entityName={entity} options={options} mode="create" />
    </section>
  );
}
