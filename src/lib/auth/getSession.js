import { cookies } from "next/headers";
import { COOKIE, verifySession } from "./session";

/**
 * Sesion actual en Server Components y route handlers.
 *
 * El middleware ya bloquea el acceso, pero se vuelve a verificar aca: apoyar
 * la autorizacion en una sola capa es fragil, y el middleware no corre en
 * todos los caminos (por ejemplo, una server action).
 */
export async function getSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  return verifySession(token);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("Sesión requerida");
  return session;
}
