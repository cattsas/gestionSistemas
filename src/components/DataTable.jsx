"use client";
import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import {
  EyeIcon,
  EyeOpenIcon,
  EyeClosedIcon,
  TrashIcon,
} from "@radix-ui/react-icons";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";

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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export function DataTable({ columns, data, end }) {
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/${end}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        console.log("Elemento eliminado correctamente");
        const handleDelete = async (id) => {
          try {
            const response = await fetch(
              `http://localhost:3000/api/${end}/${id}`,
              {
                method: "DELETE",
              }
            );

            if (response.ok) {
              console.log("Elemento eliminado correctamente");
              setIsDialogOpen(false);
              window.location.reload(); // Recarga la página
            } else {
              console.error("Error al eliminar el elemento");
            }
          } catch (error) {
            console.error("Error en la solicitud:", error);
          }
        };

        window.location.reload(); // Recarga la página
      } else {
        console.error("Error al eliminar el elemento");
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
    }
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (!columns.some((col) => col.id === "actions")) {
    //si ya existe la columna acciones, no vuelve a agregarla
    columns.push({
      //agrego columna de acciones
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="flex justify-center">
                Acciones
              </DropdownMenuLabel>
              <DropdownMenuItem className="flex justify-center">
                <Link
                  href={`http://localhost:3000/dashboard/${end}/${row.original.id}`}
                  className="flex items-center"
                >
                  Ver
                  <EyeOpenIcon />
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <Dialog>
                <DropdownMenuItem
                  className="flex justify-center"
                  onSelect={(e) => e.preventDefault()}
                >
                  <DialogTrigger asChild>
                    <div className="flex items-center">
                      Borrar
                      <TrashIcon />
                    </div>
                  </DialogTrigger>
                </DropdownMenuItem>

                <DialogContent className="flex flex-col items-center p-4">
                  <DialogHeader>
                    <DialogTitle className="flex justify-center">
                      Confirmación
                    </DialogTitle>
                    <DialogDescription>
                      ¿Está seguro de que desea eliminar el registro?
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <div className="flex justify-center space-x-8">
                      {/* El botón "Sí" llama a la función de eliminar y luego cierra el diálogo */}
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleDelete(row.original.id)} // Confirmar eliminación
                      >
                        Sí
                      </Button>
                      <DialogClose asChild>
                        {/* El botón "No" solo cierra el diálogo */}
                        <Button type="button" variant="secondary">
                          No
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    });
  }

  return (
    <section>
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-slate-800 opacity-80">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-gray-300" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <section className="flex items-center justify-around ">
        <div className="flex items-center justify-start  py-4">
          <Link href={`http://localhost:3000/dashboard/${end}/nuevo`}>
            <Button type="submit" variant="outline" size="sm">
              Agregar
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
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
    </section>
  );
}
