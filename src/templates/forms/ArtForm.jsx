"use client";

import { useRef } from "react";
import { artFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { set, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Controller,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import obtenerEnum from "@/lib/getEnums";
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

export default function ArtForm(props) {
  const { data, isCreateMode } = props;
  const [categorias, setCategorias] = useState([]);

  // Fetch categories from the endpoint
  const [cats, setCats] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [editMode, setEditMode] = useState(false);

  const dialogRef = useRef(); // Crear el ref para el Dialog

  useEffect(() => {
    obtenerEnum("articulo_categoria").then((cats) => {
      obtenerEnum("equipo_tipo").then((eq) => {
        setCats(cats);
        setEquipos(eq);
      });
    });
  }, []);

  // Estado para manejar si el formulario está en modo de edición
  const [isEditMode, setIsEditMode] = useState(isCreateMode);

  // Función para alternar el modo edición
  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(artFormSchema),
    defaultValues: {
      proveedor: props.data.proveedor || "",
      descripcion: props.data.descripcion || "",
      categoria: props.data.categoria || "",
      cantidad: props.data.Stock || 0,
    },
  });

  const { watch, formState } = form;
  const { dirtyFields } = formState; // Contiene solo los campos modificados
  const currentValues = watch();

  // Filtramos solo los campos que han cambiado
  const cambios = Object.keys(dirtyFields).reduce((acc, key) => {
    acc[key] = currentValues[key];
    return acc;
  }, {});

  async function onSubmit(values) {
    const url = isCreateMode
      ? `http://localhost:3000/api/articulo/`
      : `http://localhost:3000/api/articulo/${data.id}`;
    const method = isCreateMode ? "POST" : "PUT";

    try {
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCreateMode ? values : cambios),
      });

      if (response.ok) {
        // Mostrar el diálogo directamente usando el ref

        // Redirigir después de un submit exitoso
        window.location.href = "/dashboard/articulo"; // Redirigir a la URL deseada
      } else {
        console.log("Error en el submit", response.statusText);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-1/2 m-auto  "
      >
        {!isCreateMode && (
          <button
            onClick={(e) => {
              e.preventDefault(); // Evita que se dispare el submit
              toggleEditMode();
            }}
          >
            {isEditMode ? "Modo Lectura" : "Modo Edición"}
          </button>
        )}
        <FormField
          control={form.control}
          name="proveedor"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl" htmlFor="proveedor">
                Proveedor
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  id="proveedor"
                  {...field}
                  value={field.value}
                  readOnly={!isEditMode}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl" htmlFor="descripcion">
                Descripcion
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value}
                  readOnly={!isEditMode}
                  id="descripcion"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="categoria"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xl" htmlFor="tipo">
                Categoría
              </FormLabel>
              {isEditMode ? (
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    id="tipo"
                    name="categoria"
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Seleccione categoría" />
                    </SelectTrigger>

                    <SelectContent>
                      {cats.map((cat, index) => (
                        <SelectItem key={index} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              ) : (
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <FormControl>
                    <Input {...field} readOnly={!isEditMode} id="tipo" />
                  </FormControl>
                </div>
              )}

              <FormMessage />
            </FormItem>
          )}
        />
        {!isCreateMode && (
          <FormField
            control={form.control}
            name="cantidad"
            render={({ field }) => (
              <FormItem className="w-1/4">
                <FormLabel className="text-xl" htmlFor="cantidad">
                  Cantidad
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    id="cantidad"
                    {...field}
                    value={field.value || 0}
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit">Submit</Button>
      </form>
      {/* Dialog de éxito */}

      {/*}   <Dialog ref={dialogRef}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Are you sure you want to permanently
              delete this file from our servers?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Cerrar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>*/}
    </Form>
  );
}
