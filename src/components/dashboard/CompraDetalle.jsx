import Link from "next/link";
import { Button } from "@/components/ui/button";
import EntityForm from "@/components/EntityForm";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const fechaFmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-AR");

/**
 * Detalle de una compra: cabecera (subtitulo en modo ver, formulario editable
 * en modo editar) y la tabla de sus lineas. El alta de lineas nuevas solo se
 * ofrece al editar (o recien creada, que llega aca con editable=true): al
 * solo ver una compra ya cargada no tiene sentido seguir agregandole.
 */
export default function CompraDetalle({
  compra,
  editable = false,
  registro,
  headerOptions,
  articuloOptions,
}) {
  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      {editable ? (
        <EntityForm
          entityName="compra"
          mode="update"
          initialData={registro}
          options={headerOptions}
          showComputed={false}
        />
      ) : (
        <div className="text-center text-lg text-slate-200">
          <p>
            Fecha: {fechaFmt(compra.fecha)} · Comprobante {compra.nro_comprobante}
          </p>
          <p>
            Proveedor: {compra.proveedor} · Total {moneda.format(compra.importe_total)}
          </p>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Artículo</TableHead>
            <TableHead className="text-right">Cantidad</TableHead>
            <TableHead className="text-right">Precio unitario</TableHead>
            <TableHead className="text-right">Precio total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {compra.lineas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-slate-400">
                Esta compra todavía no tiene líneas cargadas.
              </TableCell>
            </TableRow>
          ) : (
            compra.lineas.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.articulo}</TableCell>
                <TableCell className="text-right">{l.cantidad}</TableCell>
                <TableCell className="text-right">{moneda.format(l.precio_unitario)}</TableCell>
                <TableCell className="text-right">{moneda.format(l.precio_total)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        {editable && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3}>Total</TableCell>
              <TableCell className="text-right">{moneda.format(compra.importe_total)}</TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>

      {editable && (
        <div>
          <h2 className="mb-2 text-center text-base font-semibold text-slate-200">
            Agregar línea
          </h2>
          <EntityForm
            entityName="lista"
            mode="create"
            options={{ articulo: articuloOptions }}
            fixedValues={{ compra: compra.id }}
            afterCreateRedirect={`/dashboard/compra/${compra.id}?editar=1`}
            cancelHref={`/dashboard/compra/${compra.id}?editar=1`}
            submitLabel="Agregar línea"
          />
        </div>
      )}

      {!editable && (
        <div className="flex justify-center gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/compra">Volver</Link>
          </Button>
          <Button type="button" asChild>
            <Link href={`/dashboard/compra/${compra.id}?editar=1`}>Editar</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
