"use client";

import { artFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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

export default function ArtForm(props) {
  const { data, isCreateMode } = props;
  const [categorias, setCategorias] = useState([]);

  // Fetch categories from the endpoint
  const [cats, setCats] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    obtenerEnum("articulo_categoria").then((cats) => {
      obtenerEnum("equipo_tipo").then((eq) => {
        setCats(cats);
        setEquipos(eq);
      });
    });
  }, []);

  // 2. Define a submit handler.

  //console.log(isCreateMode ? values : cambios);
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
  console.log(form.getValues());
  const { watch, formState } = form;
  const { dirtyFields } = formState; // Contiene solo los campos modificados
  const currentValues = watch();

  // Filtramos solo los campos que han cambiado
  const cambios = Object.keys(dirtyFields).reduce((acc, key) => {
    acc[key] = currentValues[key];
    return acc;
  }, {});
  async function onSubmit(values, categorias) {
    const url = isCreateMode
      ? `http://localhost:3000/api/articulo/`
      : `http://localhost:3000/api/articulo/${data.id}`;
    const method = isCreateMode ? "POST" : "PUT";

    await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isCreateMode ? values : cambios),
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 w-1/2 m-auto  "
      >
        {/* Botón para cambiar entre modo edición y vista */}
        {!isCreateMode && (
          <button onClick={toggleEditMode}>
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
                    value={field.value} // Usa el valor actual del campo
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
                    value={props.data.cantidad || 0}
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
    </Form>
  );
}
