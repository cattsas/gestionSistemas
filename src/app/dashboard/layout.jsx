import NavLinks from "@/components/dashboard/NavLinks";
export default function RootLayout({ children }) {
  return (
   
      
       
        <section className='flex flex-row w-full h-screen bg-gradient-to-r from-green-800 to-slate-800	'>
          <div className='w-1/6 h-80vh absolute bottom-0'>
          
              <article >
                
                  <NavLinks/>
                
              </article>
             
          </div>
          <section className='w-screen'>
           {children}
          </section>
        </section>
   
      
        
        
       
       
  
  );
}