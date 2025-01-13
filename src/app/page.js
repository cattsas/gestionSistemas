import { EyeOpenIcon,EyeClosedIcon } from '@radix-ui/react-icons'

import { Button } from "@/components/ui/button"
import SideNav from '@/components/dashboard/SideNav';
import Link from 'next/link';


export default async function Home() {
    
    return (
     
        <>
       
        <article className="w-full m-0 ">
                      <SideNav title="Gestion de Sistemas" />
        </article>
        <main className="antialiased  h-screenflex items-center justify-center align-center flex-col m-auto">

          <section className='w-full max-w-md flex flex-col '>
            <h1 className='text-4xl text-gray-300 font-bold text-center'>Iniciar Sesión</h1>
            <section className='mt-5'>
              <label htmlFor="user" className="block font-medium text-gray-300 text-lg leading-6 ">Usuario</label>
              <article className="relative mt-2 ">
                <input type="text" name="user" id="user" className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 "></input>
              </article>
            </section>
            <section className='mt-5'> 
              <label htmlFor="pass" className="block font-medium text-gray-300 text-lg leading-6">Contraseña</label>
              <article className="relative flex mt-2">
                <input type="password" name="pass" id="pass" className="bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500" ></input>
                <EyeClosedIcon className='w-8 h-8 text-gray-400 hidden m-1'></EyeClosedIcon>
                <EyeOpenIcon className='w-8 h-8 text-gray-400 m-1'></EyeOpenIcon>
              </article>
            </section>
            <div className="flex justify-center mt-10">
              <Link href='/admin/dashboard' className='inline-flex'>
                <Button type='submit' variant="outline" className="text-wrap text-gray-600 hover:bg-gray-600">Ingresar</Button>
              </Link>
            </div>
          </section>
    
    
        </main>
       </>
      )
    
  }