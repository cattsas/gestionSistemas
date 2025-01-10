'use client'




export default function SideNav({title}) {
 
  return (
    <section className="flex flex-row w-full h-full items-center rounded-md bg-green-500 mx-8">
      
      
       <h1 className="flex justify-center w-full text-center text-5xl text-myblue/90 font-medium"  >{title}</h1>
      
      
    </section>
  );
}