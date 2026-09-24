"use client";

import React, { useState, useEffect } from "react";
import { Building2, Calendar, Moon, Sun, Bell, LogOut } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  user?: {
    name: string;
    initials: string;
    role: string;
  };
}

export function Header({
  user = {
    name: "Secretaría Académica",
    initials: "SA",
    role: "ADMINISTRADOR",
  },
}: HeaderProps) {
  const [campus, setCampus] = useState("Campus Lima");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentDate, setCurrentDate] = useState("Lunes, 21 de Septiembre");

  useEffect(() => {
    try {
      const now = new Date();
      const str = now.toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      setCurrentDate(str.charAt(0).toUpperCase() + str.slice(1));
    } catch {
      // fallback to initial state
    }
  }, []);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== "undefined") {
        if (next) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return next;
    });
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_session");
        sessionStorage.clear();
      } catch (e) {
        console.error("Error al limpiar sesión:", e);
      }
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#0D1627] px-8 text-slate-100 shadow-md">
      {/* Lado izquierdo: Indicador de estado global fijo */}
      <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-300">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span>Sistema Activo • {currentDate}</span>
      </div>

      {/* Lado derecho: Controles adaptados a fondo oscuro */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Selector / Badge de Periodo */}
        <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 shadow-2xs">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-semibold text-slate-200">Periodo 2027-I</span>
        </div>

        {/* Selector de Campus */}
        <div className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-slate-400" />
          <select
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-200 shadow-2xs focus:border-sky-500 focus:outline-none cursor-pointer"
          >
            <option value="Campus Lima" className="bg-slate-900 text-slate-200">Campus Lima</option>
            <option value="Campus Arequipa" className="bg-slate-900 text-slate-200">Campus Arequipa</option>
            <option value="Campus Trujillo" className="bg-slate-900 text-slate-200">Campus Trujillo</option>
          </select>
        </div>

        {/* Chip de Usuario (Pill) */}
        <div className="flex items-center gap-2.5 rounded-full border border-slate-700/80 bg-slate-800/80 py-1 pl-1.5 pr-3.5 shadow-2xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/20 text-xs font-bold text-sky-400 shadow-2xs">
            {user.initials}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-slate-100 leading-tight">
              {user.name}
            </span>
            <span className="text-[10px] font-bold tracking-wider text-sky-400 leading-none uppercase">
              {user.role}
            </span>
          </div>
        </div>

        {/* Botón Logout */}
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
          className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
