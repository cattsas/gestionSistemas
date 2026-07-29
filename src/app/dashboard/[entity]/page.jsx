import { notFound } from "next/navigation";
import TemplateLayout from "@/templates/layoutTemplate";
import { getEntity } from "@/lib/entities";

export default async function ListadoEntidad({ params }) {
  const { entity } = await params;
  const descriptor = getEntity(entity);
  if (!descriptor) notFound();

  return <TemplateLayout title={descriptor.label.many} end={entity} />;
}
