export default async function obtenerCategorias() {
  const res = await fetch("http://localhost:3000/api/categoria", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  const properties = await res.json();
  return properties;
}
