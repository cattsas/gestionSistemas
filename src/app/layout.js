import '@/app/globals.css';


import NavLinks from '@/components/dashboard/NavLinks';





export default function RootLayout({ children }) {
  return (
   
      <html lang="en" >
        <body className='h-screen w-screen bg-slate-50'>
        <section className='flex flex-row h-full w-full bg-slate-50	'>
          <article className='w-1/6'>
            <NavLinks/>
          </article>
          <section className='w-5/6'>
           {children}
          </section>
        </section>
   
      
        
        
       
      </body>      
   </html>
  );
}