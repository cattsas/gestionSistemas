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

  // Al crear una compra, el siguiente paso natural es cargarle las lineas:
  // en vez de volver al listado, se va directo al modo editar de la compra
  // recien creada, que es donde vive el formulario para agregar lineas.
  const afterCreateRedirect = entity === "compra" ? "/dashboard/compra/{id}?editar=1" : undefined;

  return (
    <section>
      <PageTitle title={`Nuevo ${descriptor.label.one.toLowerCase()}`} />
      <EntityForm
        entityName={entity}
        options={options}
        mode="create"
        afterCreateRedirect={afterCreateRedirect}
      />
    </section>
  );
}
