'use client'




export default function SideNav({title}) {
 
  return (
    <section className="flex flex-row w-full h-full justify-center rounded-md bg-transparent mt-10">
      
      
       <h1 className="flex justify-center w-full text-center text-6xl text-slate-800 font-bold"  >{title}</h1>
      
      
    </section>
  );
}