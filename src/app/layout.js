import '@/app/globals.css';

export const metadata = {
  title: 'Gestión de Sistemas',
  description: 'Gestión de stock, equipos y mantenimientos',
};

export default function RootLayout({ children }) {
  return (
    <html className="h-full" lang="es">
      {/* Sin centrado vertical acá: el dashboard necesita ocupar toda la
          pantalla desde arriba. Cada pantalla (login, dashboard) centra su
          propio contenido si lo necesita. */}
      <body className="min-h-screen bg-green-800">
        {children}
      </body>
    </html>
  );
}
