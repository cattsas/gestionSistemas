import { COOKIE, cookieOptions } from "@/lib/auth/session";
import { ok } from "@/lib/api/respond";

export async function POST() {
  const respuesta = ok({ cerrada: true }, { message: "Sesión cerrada" });
  // Mismas opciones que al crearla: si path o sameSite difieren, el navegador
  // no la reemplaza y la sesion sobrevive al logout.
  respuesta.cookies.set(COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return respuesta;
}
