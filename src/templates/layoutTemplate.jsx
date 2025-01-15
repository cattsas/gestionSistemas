import SideNav from "@/components/dashboard/SideNav";
import GenerateTable from "@/lib/generateTable";
import { Button } from "@/components/ui/button";

export default function TemplateLayout({ title, url }) {
  return (
    <section className="flex flex-col">
      <article className="w-full">
        <SideNav title={title} />
      </article>

      <article className="flex justify-center">
        <div className="w-full mx-auto">
          <Button
            type="submit"
            variant="outline"
            className="text-gray-600 hover:bg-gray-300"
          >
            Agregar
          </Button>
          <GenerateTable url={url} />
        </div>
      </article>
    </section>
  );
}
