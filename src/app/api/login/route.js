import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const body =  await request.json().catch(err => {
        console.error("Error al analizar el JSON:", err);
       
        throw new Error("Cuerpo de la solicitud no es un JSON válido");
      });
      console.log("Cuerpo de la solicitud:", body);
      
    
    const { usuario, pass } = body;
    
    const user = await prisma.usuario.findUnique({
      where: { usuario },
    }).catch(err => {
        console.error("Error en la base de datos:", err);
        throw new Error("Error al buscar el usuario");
      
    });
    console.log("Usuario:", user);
    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(pass, user.pass);
    console.log('Contraseña ingresada:', pass);
    console.log('Hash almacenado:', user.pass);
    console.log('Contraseña válida:', isPasswordValid);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const { pass: userPassword, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.log("Error:", error);
    return NextResponse.json(
        { message: "Error en el servidor" },
      { status: 500 }
    );
  }
}