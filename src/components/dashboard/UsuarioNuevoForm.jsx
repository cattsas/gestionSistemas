"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EntityForm from "@/components/EntityForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Alta de usuario: antes de mostrar el formulario, un modal pide la
 * contrasena de quien esta logueado (via /api/reauth, que no crea ni borra
 * nada). Una vez validada, se muestra el formulario real y esa misma
 * contrasena viaja con el alta como "confirmarPass" — el servidor la vuelve
 * a comparar ahi: el modal es solo UX, no la unica barrera.
 */
export default function UsuarioNuevoForm() {
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [confirmada, setConfirmada] = useState(null);
  const [error, setError] = useState(null);
  const [verificando, setVerificando] = useState(false);

  async function verificar(e) {
    e.preventDefault();
    setVerificando(true);
    setError(null);
    try {
      const res = await fetch("/api/reauth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error?.message ?? "Contraseña incorrecta");
        return;
      }

      setConfirmada(pass);
    } catch {
      setError("No se pudo contactar al servidor");
    } finally {
      setVerificando(false);
    }
  }

  if (confirmada !== null) {
    return <EntityForm entityName="usuario" mode="create" fixedValues={{ confirmarPass: confirmada }} />;
  }

  return (
    <Dialog open onOpenChange={(abierto) => !abierto && router.push("/dashboard/usuario")}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmá tu identidad</DialogTitle>
          <DialogDescription>
            Ingresá tu contraseña para poder crear un usuario nuevo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={verificar} className="space-y-4">
          <Input
            type="password"
            autoComplete="current-password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoFocus
          />

          {error && (
            <p className="text-sm font-medium text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="text-accent-foreground"
              onClick={() => router.push("/dashboard/usuario")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!pass || verificando}>
              {verificando ? "Verificando…" : "Continuar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
