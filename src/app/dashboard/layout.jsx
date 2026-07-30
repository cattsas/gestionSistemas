import NavLinks from "@/components/dashboard/NavLinks";

export default function RootLayout({ children }) {
  return (
    <section className="flex h-screen w-full flex-row bg-gradient-to-r from-green-800 to-slate-700">
      {/* shrink-0: nunca se achica aunque el contenido de al lado sea ancho.
          pt-28 (112px) = altura exacta de PageTitle (my-8 + text-5xl + my-8),
          para que la barra arranque alineada con el contenido, no con el
          titulo. Como box-sizing es border-box, el div sigue midiendo
          h-screen en total; el padding solo empuja el contenido hacia
          abajo sin generar overflow. */}
      <div className="h-screen w-1/6 shrink-0 pt-28">
        <NavLinks />
      </div>
      {/* flex-1 + overflow-y-auto: el contenido scrollea de forma independiente
          si es mas alto que la pantalla, sin arrastrar a la barra lateral */}
      <section className="h-screen flex-1 overflow-y-auto">{children}</section>
    </section>
  );
}
