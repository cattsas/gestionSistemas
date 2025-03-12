// app/lib/generateArtForm.jsx
import ArtForm from "@/templates/forms/ArtForm";

// Este componente se convierte en un componente del servidor
export default async function GenerateArtForm({ data, url }) {
  let formData = data;

  // Si se pasa una URL, hacemos una solicitud para obtener los datos del artículo
  if (url) {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Asegúrate de manejar posibles errores de red
    if (!res.ok) {
      throw new Error("No se pudo obtener el artículo");
    }

    // Si la solicitud fue exitosa, obtenemos los datos
    formData = await res.json();
  }

  // Renderizamos el formulario con los datos obtenidos o los datos vacíos
  return (
    <div className="container mx-auto py-10">
      <ArtForm data={formData} />
    </div>
  );
}
