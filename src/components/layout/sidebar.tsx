/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  CalendarClock,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description: string;
}

const navigationItems: NavItem[] = [
  {
    name: "Dashboard de Métricas",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "KPIs y Embudo de Matrícula",
  },
  {
    name: "Padrón de Estudiantes",
    href: "/estudiantes",
    icon: Users,
    description: "Búsqueda, Filtros y Acciones",
  },
  {
    name: "Tesorería y Pagos",
    href: "/tesoreria",
    icon: CreditCard,
    description: "Auditoría de Pagos",
  },
  {
    name: "Asignación de Horarios",
    href: "/horarios",
    icon: CalendarClock,
    description: "Gestión de Secciones",
  },
];

interface SidebarProps {
  user?: {
    name: string;
    email: string;
    initials?: string;
  };
}

export function Sidebar({
  user = {
    name: "Secretaría Académica",
    email: "admin@tecsup.edu.pe",
    initials: "SA",
  },
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Navegación principal"
      className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-[#0D1627] shadow-xl shadow-black/20"
    >
      {/* Brand Header */}
      <div className="flex flex-col justify-center border-b border-slate-800 px-6 py-3.5">
        {/* Tu Logo */}
        <div className="flex items-center">
          <img 
            src="../logo-splash-startec.png" // Cambia por tu archivo en /public (ej: /logo-tecsup.svg)
            alt="Logo StarTec" 
            className="h-8 w-auto object-contain" // Ajusta la altura con h-8 o h-9 según se vea mejor
          />
        </div>
        <p className="text-[13px] font-medium tracking-wider uppercase text-slate-400 mt-1">
          Oficina de Admisión
        </p>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Módulos Principales
        </div>
        <nav aria-label="Enlaces de módulos" className="space-y-1.5">
          {navigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`) ||
              (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "border border-[#0284C7]/40 bg-[#0284C7]/15 font-semibold text-sky-400 shadow-xs"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive
                      ? "text-sky-400"
                      : "text-slate-400 group-hover:text-slate-300"
                  )}
                />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  <span
                    className={cn(
                      "text-[11px] font-normal transition-colors",
                      isActive
                        ? "text-sky-300/80"
                        : "text-slate-500 group-hover:text-slate-400"
                    )}
                  >
                    {item.description}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding Info */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 font-medium">
          <span>Tecsup Lima</span>
          <span className="font-semibold text-sky-400">2027-I</span>
        </div>
      </div>
    </aside>
  );
}