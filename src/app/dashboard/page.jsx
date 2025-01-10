import SideNav from '@/components/dashboard/SideNav';
import Link from 'next/link';


export default async function Home() {
    
    return (
         <article className="w-full m-0 ">
                      <SideNav title="Dashboard" />
                </article>
    )
}