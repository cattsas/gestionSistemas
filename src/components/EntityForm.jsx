"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { getEntity } from "@/lib/entities";
import {
  SIN_VALOR,
  buildZodSchema,
  emptyValues,
  formFields,
  formValues,
} from "@/lib/entities/helpers";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Formulario para cualquiera de las 9 entidades.
 *
 * Se arma recorriendo entity.fields en vez de repetir un bloque por campo, y
 * las opciones de las claves foraneas llegan ya resueltas desde el Server
 * Component: sin fetch en el cliente ni estado de carga.
 */
export default function EntityForm({ entityName, initialData = null, options = {}, mode = "create" }) {
  const entity = getEntity(entityName);
  const router = useRouter();
  const [errorGeneral, setErrorGeneral] = useState(null);

  const esAlta = mode === "create";
  const soloLectura = mode === "view";
  const modoValidacion = esAlta ? "create" : "update";

  const form = useForm({
    resolver: zodResolver(buildZodSchema(entity, modoValidacion)),
    defaultValues: esAlta ? emptyValues(entity) : formValues(entity, initialData, modoValidacion),
  });

  async function onSubmit(values) {
    setErrorGeneral(null);

    const url = esAlta ? `/api/${entityName}` : `/api/${entityName}/${initialData.id}`;

    try {
      const res = await fetch(url, {
        method: esAlta ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok) {
        const error = body?.error;
        // Los errores por campo vuelven al campo que los origino.
        if (error?.fields) {
          for (const [campo, mensaje] of Object.entries(error.fields)) {
            form.setError(campo, { type: "server", message: mensaje });
          }
        }
        setErrorGeneral(error?.message ?? "No se pudo guardar el registro");
        return;
      }

      router.push(`/dashboard/${entityName}`);
      router.refresh();
    } catch {
      setErrorGeneral("No se pudo contactar al servidor");
    }
  }

  function renderControl(f, field) {
    const disabled = soloLectura;

    switch (f.control) {
      case "textarea":
        return <Textarea {...field} disabled={disabled} rows={3} />;

      case "password":
        return (
          <Input
            {...field}
            type="password"
            autoComplete="new-password"
            disabled={disabled}
            placeholder={esAlta ? "" : "Dejar vacío para no cambiarla"}
          />
        );

      case "number":
        return <Input {...field} type="number" step="1" disabled={disabled} />;

      case "float":
        return <Input {...field} type="number" step="0.01" disabled={disabled} />;

      case "date":
        return <Input {...field} type="date" disabled={disabled} />;

      case "enum":
        return (
          <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Seleccione ${f.label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {f.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "reference": {
        const items = options[f.name] ?? [];
        return (
          <Select onValueChange={field.onChange} value={field.value ?? ""} disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Seleccione ${f.label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {/* Radix no admite value="", por eso el centinela. */}
              {!f.required && <SelectItem value={SIN_VALOR}>— sin asignar —</SelectItem>}
              {items.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      default:
        return <Input {...field} type="text" disabled={disabled} />;
    }
  }

  const campos = formFields(entity, modoValidacion);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-2xl mx-auto p-6">
        {campos.map((f) => (
          <FormField
            key={f.name}
            control={form.control}
            name={f.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {f.label}
                  {f.required && <span className="text-destructive"> *</span>}
                </FormLabel>
                {f.control === "enum" || f.control === "reference" ? (
                  renderControl(f, field)
                ) : (
                  <FormControl>{renderControl(f, field)}</FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* Los calculados se muestran pero no se editan: los mantiene el servidor. */}
        {!esAlta &&
          (entity.computed ?? []).map((c) => (
            <div key={c.name} className="space-y-2">
              <span className="text-sm font-medium">{c.label}</span>
              <Input value={initialData?.[c.name] ?? ""} readOnly disabled />
            </div>
          ))}

        {errorGeneral && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {errorGeneral}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          {!soloLectura && (
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Guardando…" : "Guardar"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/dashboard/${entityName}`)}
          >
            {soloLectura ? "Volver" : "Cancelar"}
          </Button>
          {soloLectura && (
            <Button
              type="button"
              onClick={() => router.push(`/dashboard/${entityName}/${initialData.id}?editar=1`)}
            >
              Editar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
