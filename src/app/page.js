import '@/app/globals.css'
import  SideNav  from '@/components/dashboard/SideNav'


export default async function Home() {
    console.log('cliente render')
    return (
      <>
      
      <SideNav title="Inicio"/>
       
      <main className="w-full h-full text-center ">
         <h1>Home</h1>
      </main> 
      </>
    )
  }