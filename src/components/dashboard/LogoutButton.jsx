"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ThickArrowRightIcon } from "@radix-ui/react-icons";

/**
 * Cierre de sesion real. Antes "Salir" era un <Link href="/"> que no
 * destruia nada (no habia nada que destruir).
 */
export default function LogoutButton({ className }) {
  const router = useRouter();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    try {
      await fetch("/api/logout", { method: "POST" });
    } finally {
      router.replace("/");
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={salir} disabled={saliendo} className={className}>
      <ThickArrowRightIcon className="w-6" />
      <span className="hidden md:block">{saliendo ? "Saliendo…" : "Salir"}</span>
    </button>
  );
}
