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
      href: '/api/articulo',
      icon: ActivityLogIcon,
    },
    { 
      name: 'Equipos', 
        href: '/api/equipo', 
        icon: DesktopIcon },
    
    { 
      name: 'Compras', 
      href: '/api/compra', 
      icon: BackpackIcon },
      { 
        name: 'Entregas', 
        href: '/api/entrega', 
        icon: CameraIcon }
  ];
  
  export default function NavLinks() {
    return (
      <div className='flex flex-col '>
        <section className='bg-blue/90 h-[20vh] flex justify-center items-center rounded-md'>
          <article className='flex flex-row hover:brightness-125 transition duration-200'>
            <Link className='flex flex-row items-center'
              href="/admin"
            >
              
            <SketchLogoIcon className='w-10 h-10 text-myorange'></SketchLogoIcon> 
                <p className='text-blue text-xl '>Gestion</p>
              
              
            </Link>
           </article>
        </section>
        <section className='md:flex flex-col bg-myblue/90 w-full h-[70vh] mt-6 rounded-md'>
        
          {links.map((link) => {
            const LinkIcon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                className="flex h-5vh grow text-myorange/80 items-center justify-center  text-base font-medium hover:bg-myorange/90 hover:text-myblue md:flex-none md:justify-start md:p-2 md:px-3"
              >
                <LinkIcon className="w-6" />
                <p className='hidden md:block'>{link.name}</p>
                
                
              </Link>
            );
          })}
            <Link href="/admin" className="mt-auto mb-1	flex h-5vh grow text-myorange/80 items-center justify-center  text-base font-medium hover:bg-myorange/90 hover:text-myblue md:flex-none md:justify-start md:p-2 md:px-3">
              <ThickArrowRightIcon className="w-6"/><p className='hidden md:block'>Salir</p>
            </Link>
        </section>
      </div>
     
    );
  }