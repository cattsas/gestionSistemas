import SideNav from "@/components/dashboard/SideNav";
import GenerateTable from "@/lib/generateTable";
import { Button } from "@/components/ui/button";

export default function TemplateLayout({ title, end }) {
  return (
    <section className="flex flex-col">
      <article className="w-full">
        <SideNav title={title} />
      </article>

      <article className="flex justify-center">
        <div className="w-full mx-auto">
          <GenerateTable end={end} />
        </div>
      </article>
    </section>
  );
}
