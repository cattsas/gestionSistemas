import { HomeIcon,BackpackIcon,CameraIcon,PersonIcon, ActivityLogIcon, SketchLogoIcon, ThickArrowRightIcon, DesktopIcon} from '@radix-ui/react-icons'
import Link from 'next/link'


  
  // Map of links to display in the side navigation.
  // Depending on the size of the application, this would be stored in a database.
  const links = [
    { name: 'Home',
      href: '/', 
      icon: HomeIcon
    },
    {
      name: 'Articulos',
      href: '/dashboard/articulo',
      icon: ActivityLogIcon,
    },
    { 
      name: 'Equipos', 
        href: '/dashboard/equipo', 
        icon: DesktopIcon },
    
    { 
      name: 'Compras', 
      href: '/dashboard/compra', 
      icon: BackpackIcon },
      { 
        name: 'Entregas', 
        href: '/dashboard/entrega', 
        icon: CameraIcon },
        { 
          name: 'Proveedores', 
          href: '/dashboard/proveedor', 
          icon: PersonIcon },
  ];
  
  export default function NavLinks() {
    return (
      <div className='flex flex-col'>
        
        <section className='md:flex flex-col bg-slate-800 opacity-80 w-full h-screen justify-center rounded-md mb-10'>
        
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex h-5vh grow text-green-800 text-xl items-center justify-center   font-medium hover:bg-green-800 hover:text-slate-800 my-2 md:flex-none md:justify-start md:p-2 md:px-3"
              >
                <LinkIcon className="w-6" />
                <p className='hidden md:block'>{link.name}</p>
                
                
              </Link>
            );
          })}
            <Link href="/" className="mt-auto mb-1	flex h-5vh grow text-green-800 items-center justify-center  text-xl font-medium hover:bg-green-800 hover:text-slate-800 md:flex-none md:justify-start md:p-2 md:px-3">
              <ThickArrowRightIcon className="w-6"/><p className='hidden md:block'>Salir</p>
            </Link>
        </section>
      </div>
     
    );
  }