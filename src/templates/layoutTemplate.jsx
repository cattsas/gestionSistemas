import PageTitle from "@/components/dashboard/PageTitle";
import GenerateTable from "@/lib/generateTable";

export default function TemplateLayout({ title, end }) {
  return (
    <section className="flex flex-col">
      <PageTitle title={title} />
      <article className="flex justify-center">
        <div className="w-full mx-auto">
          <GenerateTable end={end} />
        </div>
      </article>
    </section>
  );
}
