import ArtForm from "@/templates/forms/ArtForm";
import SideNav from "@/components/dashboard/SideNav";
import GenerateForm from "@/lib/generateArtForm";

export default async function Home({ params }) {
  const { id } = await params;
  const url = "http://localhost:3000/api/articulo/" + id;

  return (
    <div>
      <article className="w-full">
        <SideNav title="Articulo" />
      </article>

      <GenerateForm url={url} />
    </div>
  );
}
