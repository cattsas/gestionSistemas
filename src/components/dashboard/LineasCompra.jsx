"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import EntityForm from "@/components/EntityForm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

/**
 * Tabla de lineas de una compra, con edicion y borrado por fila, mas el
 * formulario de abajo que hace doble uso: alta de una linea nueva, o edicion
 * de la que se haya elegido con "Editar". Solo se usa en modo editable: al
 * solo ver una compra ya cargada no tiene sentido tocarle las lineas.
 */
export default function LineasCompra({ compra, articuloOptions }) {
  const router = useRouter();
  const [editando, setEditando] = useState(null);
  const [aBorrar, setABorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState(null);

  function cerrarDialogoBorrado() {
    setABorrar(null);
    setErrorBorrado(null);
  }

  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);
    setErrorBorrado(null);
    try {
      const res = await fetch(`/api/lista/${aBorrar.id}`, { method: "DELETE" });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorBorrado(body?.error?.message ?? "No se pudo eliminar la línea");
        return;
      }

      if (editando?.id === aBorrar.id) setEditando(null);
      cerrarDialogoBorrado();
      router.refresh();
    } catch {
      setErrorBorrado("No se pudo contactar al servidor");
    } finally {
      setBorrando(false);
    }
  }

  const volverHref = `/dashboard/compra/${compra.id}?editar=1`;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-slate-200">Artículo</TableHead>
            <TableHead className="text-right text-slate-200">Cantidad</TableHead>
            <TableHead className="text-right text-slate-200">Precio unitario</TableHead>
            <TableHead className="text-right text-slate-200">Precio total</TableHead>
            <TableHead className="text-right text-slate-200">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {compra.lineas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-400">
                Esta compra todavía no tiene líneas cargadas.
              </TableCell>
            </TableRow>
          ) : (
            compra.lineas.map((l) => (
              <TableRow key={l.id}>
                <TableCell>{l.articulo_label}</TableCell>
                <TableCell className="text-right">{l.cantidad}</TableCell>
                <TableCell className="text-right">{moneda.format(l.precio_unitario)}</TableCell>
                <TableCell className="text-right">{moneda.format(l.precio_total)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuItem
                        className="flex items-center gap-2"
                        onSelect={() => setEditando(l)}
                      >
                        <Pencil1Icon /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-red-600 focus:text-red-600"
                        onSelect={(e) => {
                          e.preventDefault();
                          setErrorBorrado(null);
                          setABorrar(l);
                        }}
                      >
                        <TrashIcon /> Borrar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell className="text-right">{moneda.format(compra.importe_total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <div>
        <h2 className="mb-2 text-center text-base font-semibold text-slate-200">
          {editando ? `Editar línea #${editando.id}` : "Agregar línea"}
        </h2>
        <EntityForm
          key={editando?.id ?? "nueva"}
          entityName="lista"
          mode={editando ? "update" : "create"}
          initialData={editando ?? undefined}
          options={{ articulo: articuloOptions }}
          fixedValues={{ compra: compra.id }}
          showComputed={false}
          afterCreateRedirect={volverHref}
          afterUpdateRedirect={volverHref}
          cancelHref={volverHref}
          submitLabel={editando ? "Guardar cambios" : "Agregar línea"}
          onSuccess={() => setEditando(null)}
          onCancel={() => setEditando(null)}
        />
      </div>

      <Dialog
        open={aBorrar !== null}
        onOpenChange={(abierto) => {
          if (!abierto && !borrando) cerrarDialogoBorrado();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Eliminar la línea de "{aBorrar?.articulo_label}"? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {errorBorrado && (
            <p className="text-sm text-red-600" role="alert">
              {errorBorrado}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="text-accent-foreground"
              onClick={cerrarDialogoBorrado}
              disabled={borrando}
            >
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmarBorrado} disabled={borrando}>
              {borrando ? "Eliminando…" : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
