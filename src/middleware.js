import { NextResponse } from "next/server";
import { COOKIE, verifySession } from "@/lib/auth/session";

/** Endpoints que tienen que responder sin sesion. */
const API_PUBLICA = new Set(["/api/login", "/api/logout"]);

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const esApi = pathname.startsWith("/api");

  if (esApi && API_PUBLICA.has(pathname)) return NextResponse.next();

  const session = await verifySession(request.cookies.get(COOKIE)?.value);

  if (!session) {
    // Un endpoint de API nunca se redirige a HTML: eso convierte un 401
    // legible en un "SyntaxError: Unexpected token '<'" del lado del cliente.
    if (esApi) {
      return NextResponse.json(
        { error: { code: "UNAUTHENTICATED", message: "Sesión requerida" } },
        { status: 401 }
      );
    }

    if (pathname === "/") return NextResponse.next();

    const login = new URL("/", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login, 307);
  }

  // Con sesion activa, la pantalla de login no tiene sentido.
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url), 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/:path*"],
};
