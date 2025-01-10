import { EyeOpenIcon,EyeClosedIcon } from '@radix-ui/react-icons'

import { Button } from "@/components/ui/button"
import SideNav from '@/components/dashboard/SideNav';
import Link from 'next/link';


export default async function Home() {
    console.log('cliente render')
    return (
     
        <>
        <article className="w-full m-0 bg-green-500 ">
              <SideNav title="Gestion Sistemas" />
        </article>
        <main className="antialiased h-full flex items-center align-center flex-col">

    
          <section className='w-full h-full'>
            <h1 className='text-4xl font-bold text-center'>Iniciar Sesión</h1>
            <section className='mt-5'>
              <label htmlFor="user" className="block font-medium text-lg leading-6 ">Usuario</label>
              <article className="relative mt-2">
                <input type="text" name="user" id="user" className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-black ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></input>
              </article>
            </section>
            <section className='mt-5'> 
              <label htmlFor="pass" className="block font-medium text-lg leading-6">Contraseña</label>
              <article className="relative flex mt-2">
                <input type="password" name="pass" id="pass" className="block w-full rounded-md border-0 py-1.5 pl-7 pr-20 text-black ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></input>
                <EyeClosedIcon className='w-8 h-8 text-gray-600 hidden m-1'></EyeClosedIcon>
                <EyeOpenIcon className='w-8 h-8 text-gray-600 m-1'></EyeOpenIcon>
              </article>
            </section>
            <Link href='/admin/dashboard' className='flex justify-center'>
              <Button type='submit' variant="outline" className='text-wrap mt-10 hover:bg-sky-600'>Ingresar</Button>
              </Link>
    
          </section>
    
    
        </main>
       </>
      )
    
  }