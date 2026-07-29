import { Suspense } from "react";
import Login from "@/templates/forms/loginTemplate";

export default function Home() {
  // El formulario lee ?next= con useSearchParams, que exige un limite de
  // Suspense para no forzar el render dinamico de toda la pagina.
  return (
    <Suspense fallback={null}>
      <Login />
    </Suspense>
  );
}
