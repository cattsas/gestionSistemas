import SideNav from "@/components/dashboard/SideNav";
import GenerateArtForm from "@/lib/generateArtForm";

export default function articuloNuevo() {
  const emptyData = {
    proveedor: "",
    descripcion: "",
    categoria: "",
    cantidad: 0,
  };

  return (
    <div>
      <article className="w-full">
        <SideNav title="Cargar artículo" />
      </article>
      {/* Pasa el objeto vacío para crear un artículo */}
      <GenerateArtForm data={emptyData} />
    </div>
  );
}
