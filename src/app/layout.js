import '@/app/globals.css';

export const metadata = {
  title: 'Gestión de Sistemas',
  description: 'Gestión de stock, equipos y mantenimientos',
};

export default function RootLayout({ children }) {
  return (
    <html className="h-screen w-screen" lang="en">
      <body className="h-screen w-screen flex items-center justify-center bg-gradient-to-r from-green-800 to-slate-800">
        <section className="w-full h-full flex items-center justify-center flex-col">
          {children}
        </section>
      </body>
    </html>
  );
}
