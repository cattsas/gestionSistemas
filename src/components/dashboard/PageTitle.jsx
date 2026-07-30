/**
 * Titulo de pagina. Antes se llamaba SideNav, pero nunca fue una barra de
 * navegacion: renderiza un h1 y nada mas. Tampoco necesita "use client".
 */
export default function PageTitle({ title }) {
  return (
    <section className="flex w-full justify-center rounded-md bg-transparent my-8">
      <h1 className="w-full text-center text-5xl font-bold text-slate-100">{title}</h1>
    </section>
  );
}
