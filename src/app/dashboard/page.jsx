import Link from "next/link";
import PageTitle from "@/components/dashboard/PageTitle";
import { listEntities } from "@/lib/entities";
import { countAll } from "@/lib/services/crud";

export default async function Dashboard() {
  const conteos = await countAll();

  return (
    <article className="w-full pb-12">
      <PageTitle title="Dashboard" />

      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 md:grid-cols-3">
        {listEntities()
          .filter((entity) => !entity.hideFromMenu && !entity.hideFromDashboard)
          .map((entity) => (
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
    </article>
  );
}
