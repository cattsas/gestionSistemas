import { notFound } from "next/navigation";
import PageTitle from "@/components/dashboard/PageTitle";
import EntityForm from "@/components/EntityForm";
import UsuarioNuevoForm from "@/components/dashboard/UsuarioNuevoForm";
import { getEntity } from "@/lib/entities";
import { optionsForForm } from "@/lib/services/crud";

export default async function NuevaEntidad({ params }) {
  const { entity } = await params;
  const descriptor = getEntity(entity);
  if (!descriptor) notFound();

  // Crear un usuario pide reautenticacion antes de mostrar el formulario: es
  // un flujo propio, no el generico.
  if (entity === "usuario") {
    return (
      <section>
        <PageTitle title={`Nuevo ${descriptor.label.one.toLowerCase()}`} />
        <UsuarioNuevoForm />
      </section>
    );
  }

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
