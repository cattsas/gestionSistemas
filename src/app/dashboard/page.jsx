import SideNav from "@/components/dashboard/SideNav";
import getStockRestante from "@/lib/calcStock";

export default async function Home() {
  return (
    <article className="w-full h-screen m-0 ">
      <SideNav title="Dashboard" />
    </article>
  );
}
