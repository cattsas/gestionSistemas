"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { EyeOpenIcon, Pencil1Icon, TrashIcon } from "@radix-ui/react-icons";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const moneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

/** Formato de celda segun el tipo declarado en el descriptor de la entidad. */
function formatear(valor, tipo) {
  if (valor === null || valor === undefined || valor === "") return "—";

  switch (tipo) {
    case "date": {
      // Llega como YYYY-MM-DD. Se parte a mano en lugar de usar new Date()
      // para no arrastrar el corrimiento de zona horaria.
      const [a, m, d] = String(valor).split("-");
      return d ? `${d}/${m}/${a}` : String(valor);
    }
    case "float":
      return moneda.format(Number(valor));
    default:
      return String(valor);
  }
}

export function DataTable({ columns, data, end, emptyMessage = "No hay registros" }) {
  const router = useRouter();
  const [aBorrar, setABorrar] = useState(null);
  const [borrando, setBorrando] = useState(false);
  const [errorBorrado, setErrorBorrado] = useState(null);

  // Los columnDef reales se construyen aca y no llegan por props: una funcion
  // `cell` no sobrevive el pasaje de Server Component a Client Component.
  const columnDefs = useMemo(() => {
    const base = columns.map((col) => ({
      accessorKey: col.accessorKey,
      header: col.header,
      cell: ({ row }) => formatear(row.original[col.accessorKey], col.type),
    }));

    base.push({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href={`/dashboard/${end}/${row.original.id}`} className="flex items-center gap-2">
                <EyeOpenIcon /> Ver
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/${end}/${row.original.id}?editar=1`}
                className="flex items-center gap-2"
              >
                <Pencil1Icon /> Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
              onSelect={(e) => {
                e.preventDefault();
                setErrorBorrado(null);
                setABorrar(row.original);
              }}
            >
              <TrashIcon /> Borrar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    });

    return base;
  }, [columns, end]);

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  async function confirmarBorrado() {
    if (!aBorrar) return;
    setBorrando(true);
    setErrorBorrado(null);
    try {
      const res = await fetch(`/api/${end}/${aBorrar.id}`, { method: "DELETE" });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        // El servidor explica por que no se puede (por ejemplo, 409 si hay
        // registros relacionados). Antes esto solo iba a la consola.
        setErrorBorrado(body?.error?.message ?? "No se pudo eliminar el registro");
        return;
      }

      setABorrar(null);
      router.refresh();
    } catch {
      setErrorBorrado("No se pudo contactar al servidor");
    } finally {
      setBorrando(false);
    }
  }

  return (
    <section>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-800 opacity-90">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead className="text-gray-200" key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnDefs.length || 1} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <section className="flex items-center justify-between py-4">
        <Link href={`/dashboard/${end}/nuevo`}>
          <Button type="button" variant="outline" size="sm">
            Agregar
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount() || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </section>

      <Dialog
        open={aBorrar !== null}
        onOpenChange={(abierto) => {
          if (!abierto && !borrando) {
            setABorrar(null);
            setErrorBorrado(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar el registro #{aBorrar?.id}? Esta acción no se
              puede deshacer.
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
              onClick={() => setABorrar(null)}
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
    </section>
  );
}
