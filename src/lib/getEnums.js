export default async function obtenerEnum(nombreEnum) {
  const res = await fetch(`/api/enums/${nombreEnum}`);
  const data = await res.json();
  console.log("res:", res);
  return data.valores;
}
