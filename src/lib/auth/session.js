/**
 * Sesion basada en un JWT firmado guardado en una cookie httpOnly.
 *
 * Usa solo `jose` (nada de bcrypt ni de Prisma) para poder ejecutarse tambien
 * en el runtime Edge, que es donde corre el middleware.
 */
import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "gs_session";
const DURACION_HORAS = 8;

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET no está definida o es demasiado corta. Generar una con:\n" +
        `  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * `secure` sale de una variable y no de NODE_ENV a proposito: en produccion
 * sobre HTTP plano en una red interna, marcar la cookie como secure hace que
 * el navegador la descarte y el login falla sin ningun mensaje util.
 */
export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: DURACION_HORAS * 60 * 60,
  };
}

export async function signSession({ sub, usuario }) {
  return new SignJWT({ usuario })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(sub))
    .setIssuedAt()
    .setExpirationTime(`${DURACION_HORAS}h`)
    .sign(getSecret());
}

/** Devuelve el payload, o null si el token falta, vencio o fue alterado. */
export async function verifySession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload;
  } catch {
    return null;
  }
}
