import Link from "next/link";
import PageTitle from "@/components/dashboard/PageTitle";
import { listEntities } from "@/lib/entities";
import { countAll, list } from "@/lib/services/crud";

export default async function Dashboard() {
  const [conteos, articulos] = await Promise.all([countAll(), list("articulo")]);
  const sinStock = articulos.filter((a) => a.stock <= 0);

  return (
    <article className="w-full pb-12">
      <PageTitle title="Dashboard" />

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 md:grid-cols-3">
        {listEntities().map((entity) => (
          <Link
            key={entity.name}
            href={`/dashboard/${entity.name}`}
            className="rounded-lg border bg-white/70 p-4 transition hover:border-slate-400 hover:shadow-sm"
          >
            <p className="text-3xl font-bold text-slate-800">{conteos[entity.name]}</p>
            <p className="text-sm text-slate-600">{entity.label.many}</p>
          </Link>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-5xl px-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Artículos sin stock</h2>
        {sinStock.length === 0 ? (
          <p className="text-sm text-slate-600">Todos los artículos tienen stock disponible.</p>
        ) : (
          <ul className="divide-y rounded-lg border bg-white/70">
            {sinStock.map((a) => (
              <li key={a.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <Link href={`/dashboard/articulo/${a.id}`} className="hover:underline">
                  {a.descripcion}
                </Link>
                <span className="text-slate-500">{a.id_proveedor_label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
