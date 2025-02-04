import prisma from "@/lib/prisma";
import { NextResponse } from "next/server"; 
import bcrypt from 'bcrypt';


export async function GET () {
    try {
        const user = await prisma.usuario.findMany({
            select: {usuario:true,},
        });
        return NextResponse.json(user);
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al obtener los usuarios", { status: 500 });
    }
}

export async function POST(request) {
    try {
        
        const body = await request.json();
        const salt = await bcrypt.genSalt(10);
        
const hashedPassword = await bcrypt.hash(body.pass, salt);
        const user = await prisma.usuario.create({
            data: {...body,
            pass:hashedPassword,}
        });
        const { password, ...userWithoutPassword } = user;// Asigna a userWithoutPassword todo lo que tiene user excepto password
        return NextResponse.json(userWithoutPassword, {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            }
          });
    } catch (error) {
        console.log("Error:", error);
        return  NextResponse.json(error.message || "Error al crear el usuario", { status: 500 });
    }
}

