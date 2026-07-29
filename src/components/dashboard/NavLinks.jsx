"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ActivityLogIcon,
  BackpackIcon,
  DashboardIcon,
  DesktopIcon,
  GearIcon,
  HandIcon,
  IdCardIcon,
  ListBulletIcon,
  PersonIcon,
  ReaderIcon,
} from "@radix-ui/react-icons";

import { listEntities } from "@/lib/entities";
import LogoutButton from "./LogoutButton";

const ICONOS = {
  articulo: ActivityLogIcon,
  equipo: DesktopIcon,
  compra: BackpackIcon,
  lista: ListBulletIcon,
  entrega: HandIcon,
  proveedor: PersonIcon,
  empleado: IdCardIcon,
  mantenimiento: GearIcon,
  usuario: ReaderIcon,
};

const ITEM =
  "flex items-center gap-2 text-xl font-medium text-green-800 hover:bg-green-800 hover:text-slate-800 my-1 justify-center md:justify-start md:p-2 md:px-3";

export default function NavLinks() {
  const pathname = usePathname();

  // Los enlaces salen del registro: agregar una entidad la pone en el menu
  // sin tocar este archivo.
  const links = [
    { name: "Dashboard", href: "/dashboard", Icon: DashboardIcon },
    ...listEntities().map((e) => ({
      name: e.label.many,
      href: `/dashboard/${e.name}`,
      Icon: ICONOS[e.name] ?? ActivityLogIcon,
    })),
  ];

  return (
    <nav className="flex flex-col bg-slate-800 opacity-90 w-full h-screen rounded-md py-4">
      {links.map(({ name, href, Icon }) => {
        const activo = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={`${ITEM} ${activo ? "bg-green-800 text-slate-900" : ""}`}
          >
            <Icon className="w-6" />
            <span className="hidden md:block">{name}</span>
          </Link>
        );
      })}

      <LogoutButton className={`${ITEM} mt-auto w-full`} />
    </nav>
  );
}
