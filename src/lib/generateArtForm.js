import ArtForm from "@/templates/forms/ArtForm";

export default async function GenerateForm({ url }) {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "force-cache",
  });

  const property = await res.json();
  console.log(property);

  // Limpia la cadena antes de dividirla

  return (
    <div className="container mx-auto py-10">
      <ArtForm data={property} />
    </div>
  );
}
