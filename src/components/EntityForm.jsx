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
  labelOf,
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
export default function EntityForm({
  entityName,
  initialData = null,
  options = {},
  mode = "create",
  // Campos que no se muestran ni se editan, pero viajan fijos en el submit
  // (ej. la "compra" al cargar una linea desde el detalle de esa compra).
  fixedValues = {},
  // Si se define, reemplaza el destino por defecto tras un alta exitosa
  // (`/dashboard/${entityName}`). Un string, no una funcion: EntityForm es
  // Client Component y quien lo usa suele ser un Server Component, que no
  // puede pasarle funciones como prop. Admite el placeholder "{id}", que se
  // reemplaza por el id de la fila recien creada.
  afterCreateRedirect,
  submitLabel,
  cancelHref,
  // Los calculados se muestran por defecto (solo lectura) en modo edicion.
  // Se puede apagar cuando ya se muestran en otro lado del layout, como el
  // importe_total de compra junto a su tabla de lineas.
  showComputed = true,
}) {
  const entity = getEntity(entityName);
  const router = useRouter();
  const [errorGeneral, setErrorGeneral] = useState(null);
  // Al alta, si el codigo ingresado en un campo con lookupAutofill ya existe,
  // se autocompletan los campos indicados con los de ese registro (ej. la
  // descripcion de un articulo a partir de su codigo).
  const [lookupHint, setLookupHint] = useState(null);

  const esAlta = mode === "create";
  const soloLectura = mode === "view";
  const modoValidacion = esAlta ? "create" : "update";

  const form = useForm({
    resolver: zodResolver(buildZodSchema(entity, modoValidacion)),
    defaultValues: esAlta
      ? { ...emptyValues(entity), ...fixedValues }
      : formValues(entity, initialData, modoValidacion),
  });

  async function onSubmit(values) {
    setErrorGeneral(null);

    const url = esAlta ? `/api/${entityName}` : `/api/${entityName}/${initialData.id}`;
    const payload = { ...values, ...fixedValues };

    try {
      const res = await fetch(url, {
        method: esAlta ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

      if (esAlta && afterCreateRedirect) {
        router.push(afterCreateRedirect.replace("{id}", body?.data?.id));
      } else {
        router.push(`/dashboard/${entityName}`);
      }
      router.refresh();
    } catch {
      setErrorGeneral("No se pudo contactar al servidor");
    }
  }

  /**
   * Busca si ya existe un registro con ese valor. Si existe, autocompleta los
   * campos indicados (y el servidor, al guardar, va a sumar en vez de crear).
   * Si no existe, lo marca como error en el propio campo: no se puede elegir
   * un codigo nuevo a mano, solo referenciar uno que ya este.
   */
  async function buscarYAutocompletar(f, valor) {
    setLookupHint(null);
    if (valor === "" || valor == null) {
      form.clearErrors(f.name);
      return;
    }
    try {
      const res = await fetch(`/api/${entityName}/${valor}`);

      if (res.status === 404) {
        form.setError(f.name, {
          type: "manual",
          message: `No existe ${entity.label.one.toLowerCase()} con ese código`,
        });
        return;
      }
      if (!res.ok) return;

      const body = await res.json().catch(() => null);
      const row = body?.data;
      if (!row) return;

      form.clearErrors(f.name);
      for (const destino of f.lookupAutofill) {
        form.setValue(destino, row[destino] != null ? String(row[destino]) : "", {
          shouldValidate: true,
        });
      }
      setLookupHint("Código existente: se completaron sus datos. Lo que cargues se va a sumar a su stock actual.");
    } catch {
      // La busqueda es solo una ayuda: si falla, el usuario sigue cargando a mano.
    }
  }

  /**
   * Para una referencia (select) que declara lookupByCode: ademas de elegirla
   * del desplegable, se puede escribir el codigo del registro referenciado y
   * que la seleccione sola.
   */
  async function buscarReferenciaPorCodigo(f, valor) {
    setLookupHint(null);
    if (valor === "" || valor == null) return;
    const refEntity = getEntity(f.ref.entity);
    try {
      const res = await fetch(`/api/${f.ref.entity}/${valor}`);

      if (res.status === 404) {
        form.setError(f.name, {
          type: "manual",
          message: `No existe ${refEntity.label.one.toLowerCase()} con ese código`,
        });
        return;
      }
      if (!res.ok) return;

      const body = await res.json().catch(() => null);
      const row = body?.data;
      if (!row) return;

      form.clearErrors(f.name);
      form.setValue(f.name, String(row.id), { shouldValidate: true });
      setLookupHint(`Código ${valor}: ${labelOf(refEntity, row)}`);
    } catch {
      // La busqueda es solo una ayuda: si falla, se sigue eligiendo del desplegable.
    }
  }

  function renderControl(f, field) {
    const disabled = soloLectura;
    const conAutocompletado = esAlta && f.lookupAutofill?.length > 0;

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
        return (
          <Input
            {...field}
            type="number"
            step="1"
            disabled={disabled}
            onBlur={(e) => {
              field.onBlur();
              if (conAutocompletado) buscarYAutocompletar(f, e.target.value);
            }}
          />
        );

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
        const select = (
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

        if (!f.lookupByCode || !esAlta) return select;

        // Ademas del desplegable, un campo aparte para elegir escribiendo el
        // codigo del registro referenciado.
        return (
          <div className="space-y-2">
            <Input
              type="number"
              step="1"
              placeholder="Buscar por código"
              disabled={disabled}
              onBlur={(e) => buscarReferenciaPorCodigo(f, e.target.value)}
            />
            {select}
          </div>
        );
      }

      default:
        return <Input {...field} type="text" disabled={disabled} />;
    }
  }

  const campos = formFields(entity, modoValidacion).filter((f) => !(f.name in fixedValues));

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
                {esAlta && (f.lookupAutofill?.length > 0 || f.lookupByCode) && lookupHint && (
                  <p className="text-sm text-muted-foreground">{lookupHint}</p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {/* Los calculados se muestran pero no se editan: los mantiene el servidor. */}
        {!esAlta &&
          showComputed &&
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
              {form.formState.isSubmitting ? "Guardando…" : submitLabel ?? "Guardar"}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(cancelHref ?? `/dashboard/${entityName}`)}
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
