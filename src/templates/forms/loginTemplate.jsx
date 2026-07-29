"use client";
import { EyeOpenIcon, EyeClosedIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/dashboard/PageTitle";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [usuario, setUsuario] = useState("");
  const [pass, setPass] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, pass }),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        setError(body?.error?.message ?? "No se pudo iniciar sesión");
        return;
      }

      // Vuelve a donde el middleware lo intercepto, si venia de algun lado.
      const destino = searchParams.get("next") || "/dashboard";
      router.replace(destino);
      router.refresh();
    } catch {
      setError("No se pudo contactar al servidor");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <PageTitle title="Gestion de Sistemas" />

      <form onSubmit={handleSubmit} className="antialiased flex w-full flex-col items-center">
        <section className="w-full max-w-md flex flex-col ">
          <h1 className="text-4xl text-gray-300 font-bold text-center">
            Iniciar Sesión
          </h1>
          <section className="mt-5">
            <label
              htmlFor="user"
              className="block font-medium text-gray-300 text-lg leading-6 "
            >
              Usuario
            </label>
            <article className="relative mt-2 ">
              <input
                type="text"
                name="user"
                id="user"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 "
              ></input>
            </article>
          </section>
          <section className="mt-5">
            <label
              htmlFor="pass"
              className="block font-medium text-gray-300 text-lg leading-6"
            >
              Contraseña
            </label>
            <article className="relative flex mt-2">
              <input
                type={showPassword ? "text" : "password"}
                name="pass"
                id="pass"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="text-gray-300 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
              ></input>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="ml-2 right-2 top-1/2  text-gray-300"
              >
                {showPassword ? (
                  <EyeClosedIcon className="  w-8 h-8" />
                ) : (
                  <EyeOpenIcon className=" w-8 h-8" />
                )}
              </button>
            </article>
          </section>
          {/* Mensaje de error */}
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
          <div className="flex justify-center mt-10">
            <Button
              type="submit"
              variant="outline"
              disabled={enviando}
              className="text-wrap text-gray-600 hover:bg-gray-600"
            >
              {enviando ? "Ingresando…" : "Ingresar"}
            </Button>
          </div>
        </section>
      </form>
    </div>
  );
}
