import { DataTable } from "@/components/DataTable"
import generateColumns from"@/lib/generateColumns"


 // Función para verificar si una cadena es una fecha en formato ISO
 function isISODateString(value) {
    const regex = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)$/;
    return typeof value === 'string' && regex.test(value);
  }
  
  // Función para formatear fechas
  function formatDate(value) {
    return new Date(value).toLocaleDateString('es-ES'); // Ajusta el formato según tus necesidades
  }
  
  
  function formatData(data) {
    return data.map(item => {
      const formattedItem = { ...item };
      for (const key in formattedItem) {
        if (formattedItem.hasOwnProperty(key) && isISODateString(formattedItem[key])) {
          formattedItem[key] = formatDate(formattedItem[key]);
        }
      }
      return formattedItem;
    });
  }  

export default async function GenerateTable({url}) {
  
  const res=await fetch (url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
  },
  cache: 'no-store'
  })
  const properties = await res.json()
  
  
  
   // Formatear los datos
   const formattedData = formatData(properties);
 
  
   // Genera columnas dinámicamente usando funcion generateColumns
  const columns = generateColumns(properties);
  
 
    


  return (
      <div>
        
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={formattedData} />
        </div>
  
      </div>
    )
  }