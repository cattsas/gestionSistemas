"use client";

import { artFormSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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

import obtenerCategorias from "@/lib/getCategories";

export default function ArtForm() {
  const [categorias, setCategorias] = useState([]);

  // Fetch categories from the endpoint
  useEffect(() => {
    async function fetchCategorias() {
      try {
        const data = await obtenerCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    }
    fetchCategorias();
  }, []);

  // 2. Define a submit handler.
  function onSubmit(values, categorias) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
  }
  // 1. Define your form.
  const form = useForm({
    resolver: zodResolver(artFormSchema),
    defaultValues: {
      proveedor: "",
      descripcion: "",
      categoria: "",
      cantidad: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="proveedor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proveedor</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
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
              <FormLabel>Descripcion</FormLabel>
              <FormControl>
                <Input type="text" {...field} />
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
              <FormLabel htmlFor="tipo">Categoría</FormLabel>

              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  id="cat"
                  name="categoria"
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>

                  <SelectContent>
                    {categorias.map((categoria, index) => (
                      <SelectItem key={index} value={categoria}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cantidad"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
