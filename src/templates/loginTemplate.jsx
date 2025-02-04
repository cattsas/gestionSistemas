"use client";
import { EyeOpenIcon,EyeClosedIcon } from '@radix-ui/react-icons'
import { Button } from "@/components/ui/button"
import SideNav from '@/components/dashboard/SideNav';

import { useState } from "react";



export default function Login() {

    const [usuario, setUsuario] = useState("");
    const [pass, setPass] = useState("");
    const [error, setError] = useState("");
  
    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
      e.preventDefault(); // Evita que el formulario se envíe de forma tradicional
      
      try {
        // Realiza la solicitud al servidor
        const response = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          
          body: JSON.stringify({ usuario, pass }),
        });
        
       
        // Si la respuesta no es exitosa, lanza un error
       if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error en la autenticación");
        }
  
        // Si la autenticación es exitosa, redirige al dashboard
        window.location.href = "/dashboard";
      } catch (error) {
        // Muestra un mensaje de error si la autenticación falla
        setError(error.message);
      }
    };
    
    return (
     
      <>
        <article className="w-full m-0 ">
          <SideNav title="Gestion de Sistemas" />
        </article>
       
        <form onSubmit={handleSubmit} className="antialiased  h-screenflex items-center justify-center align-center flex-col m-auto">

          <section className='w-full max-w-md flex flex-col '>
            <h1 className='text-4xl text-gray-300 font-bold text-center'>Iniciar Sesión</h1>
            <section className='mt-5'>
              <label htmlFor="user" className="block font-medium text-gray-300 text-lg leading-6 ">Usuario</label>
              <article className="relative mt-2 ">
                <input type="text"  name="user" id="user"  value={usuario}
                onChange={(e) => setUsuario(e.target.value)}className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 "></input>
              </article>
            </section>
            <section className='mt-5'> 
              <label htmlFor="pass" className="block font-medium text-gray-300 text-lg leading-6">Contraseña</label>
              <article className="relative flex mt-2">
                <input type="password" name="pass" id="pass"  value={pass} onChange={(e) => setPass(e.target.value)}className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500" ></input>
                <EyeClosedIcon className='w-8 h-8 text-gray-400 hidden m-1'></EyeClosedIcon>
                <EyeOpenIcon className='w-8 h-8 text-gray-400 m-1'></EyeOpenIcon>
                
              </article>
            </section>
             {/* Mensaje de error */}
          {error && (
            <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
          )}
            <div className="flex justify-center mt-10">
              
                <Button type='submit' variant="outline" className="text-wrap text-gray-600 hover:bg-gray-600">Ingresar</Button>
              
            </div>
          </section>
        
        </form>
      </>
    )
  
}