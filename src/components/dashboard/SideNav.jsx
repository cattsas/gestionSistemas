'use client'




export default function SideNav({title}) {
 
  return (
    <section className="flex flex-row w-full h-full items-center rounded-md  md:h-20 px-3 md:px-2">
      
      
       <h1 className="flex w-full text-center text-5xl text-myblue/90 font-medium"  >{title}</h1>
      
      
    </section>
  );
}