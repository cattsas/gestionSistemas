import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const fechaFmt = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString("es-AR");

/** Vista de solo lectura de una compra: cabecera como subtitulo, lineas en tabla. */
export default function CompraDetalle({ compra }) {
  return (
    <section className="mx-auto max-w-3xl space-y-6 p-6">
      <div className="text-center text-lg text-slate-200">
        <p>
          Fecha: {fechaFmt(compra.fecha)} · Comprobante {compra.nro_comprobante}
        </p>
        <p>
          Proveedor: {compra.proveedor} · Total {moneda.format(compra.importe_total)}
        </p>
      </div>

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
      </Table>

      <div className="flex gap-3">
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/compra">Volver</Link>
        </Button>
        <Button type="button" asChild>
          <Link href={`/dashboard/compra/${compra.id}?editar=1`}>Editar</Link>
        </Button>
      </div>
    </section>
  );
}
