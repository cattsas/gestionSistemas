import NavLinks from "@/components/dashboard/NavLinks";

export default function RootLayout({ children }) {
  return (
    <section className="flex h-screen w-full flex-row bg-green-800">
      {/* shrink-0: nunca se achica aunque el contenido de al lado sea ancho.
          pt-28 (112px) = altura exacta de PageTitle (my-8 + text-5xl + my-8),
          para que la barra arranque alineada con el contenido, no con el
          titulo. pb-28 repite la misma medida abajo para que el nav quede
          centrado verticalmente, a igual distancia de ambos bordes. Como
          box-sizing es border-box, el div sigue midiendo h-screen en total;
          el padding solo reduce el alto visible del nav, sin overflow. */}
      <div className="h-screen w-1/6 shrink-0 pt-28 pb-28">
        <NavLinks />
      </div>
      {/* flex-1 + overflow-y-auto: el contenido scrollea de forma independiente
          si es mas alto que la pantalla, sin arrastrar a la barra lateral */}
      <section className="h-screen flex-1 overflow-y-auto">{children}</section>
    </section>
  );
}
