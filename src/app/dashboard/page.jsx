import SideNav from '@/components/dashboard/SideNav';
import  getStockRestante  from "@/lib/calcStock";


export default async function Home() {
    const cant=await getStockRestante(2); 
    return (
        <article className="w-full h-screen m-0 ">
          <SideNav title="Dashboard" />
          <h1>{cant}</h1>
        </article>
    )
}