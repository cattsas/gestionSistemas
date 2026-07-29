import bcrypt from "bcryptjs";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as login } from "@/app/api/login/route";
import { POST as logout } from "@/app/api/logout/route";
import { verifySession } from "@/lib/auth/session";
import { limpiarBase, prisma } from "../setup/db";

const USUARIO = "admin";
const PASS = "claveDePrueba123";

function pedido(body, ip = "10.0.0.1") {
  return new Request("http://test.local/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

beforeEach(async () => {
  await limpiarBase();
  await prisma.usuario.create({
    data: { usuario: USUARIO, pass: await bcrypt.hash(PASS, 10) },
  });
});

describe("login", () => {
  it("acepta credenciales validas y emite la cookie de sesion", async () => {
    const res = await login(pedido({ usuario: USUARIO, pass: PASS }));
    const cookie = res.headers.get("set-cookie") ?? "";

    expect(res.status).toBe(200);
    expect(cookie).toContain("gs_session=");
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");
  });

  it("no marca Secure cuando COOKIE_SECURE es false", async () => {
    // Sobre HTTP plano en la red interna, Secure haria que el navegador
    // descarte la cookie y el login fallaria sin explicacion.
    const res = await login(pedido({ usuario: USUARIO, pass: PASS }));
    expect(res.headers.get("set-cookie")).not.toMatch(/;\s*secure/i);
  });

  it("firma un token que verifySession acepta", async () => {
    const res = await login(pedido({ usuario: USUARIO, pass: PASS }));
    const token = (res.headers.get("set-cookie") ?? "").match(/gs_session=([^;]+)/)?.[1];

    const payload = await verifySession(token);
    expect(payload?.usuario).toBe(USUARIO);
  });

  it("rechaza un token con la firma alterada", async () => {
    const res = await login(pedido({ usuario: USUARIO, pass: PASS }));
    const token = (res.headers.get("set-cookie") ?? "").match(/gs_session=([^;]+)/)?.[1];

    expect(await verifySession(`${token.slice(0, -3)}xyz`)).toBeNull();
    expect(await verifySession("cualquier-cosa")).toBeNull();
  });

  it("no permite distinguir un usuario inexistente de una contrasena mala", async () => {
    // Antes eran 404 y 401 con mensajes distintos, lo que permitia enumerar
    // que usuarios existen.
    const inexistente = await login(pedido({ usuario: "nadie", pass: PASS }, "10.0.0.2"));
    const malaPass = await login(pedido({ usuario: USUARIO, pass: "otraCosa" }, "10.0.0.3"));

    expect(inexistente.status).toBe(401);
    expect(malaPass.status).toBe(401);
    expect((await inexistente.json()).error.message).toBe(
      (await malaPass.json()).error.message
    );
  });

  it("no devuelve el hash de la contrasena", async () => {
    const res = await login(pedido({ usuario: USUARIO, pass: PASS }));
    expect(JSON.stringify(await res.json())).not.toContain("$2");
  });

  it("corta despues de 5 intentos fallidos desde la misma IP", async () => {
    const ip = "10.0.0.99";
    for (let i = 0; i < 5; i++) {
      await login(pedido({ usuario: USUARIO, pass: "mal" }, ip));
    }
    const res = await login(pedido({ usuario: USUARIO, pass: PASS }, ip));
    expect(res.status).toBe(409);
  });
});

describe("logout", () => {
  it("expira la cookie", async () => {
    const res = await logout();
    const cookie = res.headers.get("set-cookie") ?? "";

    expect(res.status).toBe(200);
    expect(cookie).toMatch(/gs_session=;/);
    expect(cookie.toLowerCase()).toContain("max-age=0");
  });
});
