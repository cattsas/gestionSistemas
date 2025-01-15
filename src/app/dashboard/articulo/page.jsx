import SideNav from "@/components/dashboard/SideNav"

import GenerateTable from "@/lib/generateTable";

 // Función para verificar si una cadena es una fecha en formato ISO

export default async function articulos() {
    
    return (
        <>
        <section className="flex flex-col">
          <article className="w-full ">
              <SideNav title="Articulos" />
          </article>
        

          <article className="flex justify-center ">   
            <div className="w-full mx-auto ">
                <GenerateTable url='http://localhost:3000/api/articulo'/>
            </div>
          </article>
        </section>
       
        </>
    )
}   