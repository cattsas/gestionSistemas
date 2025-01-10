import '@/app/globals.css';


import NavLinks from '@/components/dashboard/NavLinks';





export default function RootLayout({ children }) {
  return (
   
      <html lang="en" >
        <body className='h-screen w-screen bg-slate-50'>
        
          <section className='w-full h-full flex items-center flex-col'>
           {children}
          </section>
       
   
      
        
        
       
      </body>      
   </html>
  );
}