"use client";

import React, { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowUpRight, Award, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CareerItem {
  code: string;
  name: string;
  count: number;
  color: string;
  badgeClass?: string;
}

interface CareerDonutChartProps {
  careers?: CareerItem[];
  totalAdmitidos?: number;
  isLoading?: boolean;
}

export const CAREER_PALETTE: string[] = [
  "#0284C7", // Azul Sky
  "#0D1627", // Pizarra Marina
  "#0D9488", // Teal
  "#F59E0B", // Ámbar
  "#6366F1", // Indigo
  "#10B981", // Esmeralda
  "#8B5CF6", // Púrpura
  "#EC4899", // Rosa
  "#F97316", // Naranja
  "#06B6D4", // Cyan
  "#64748B", // Slate
  "#84CC16", // Lima
  "#14B8A6", // Turquesa
  "#E11D48", // Rosa Intenso
  "#3B82F6", // Azul Eléctrico
  "#A855F7", // Violeta
  "#D97706", // Ocre
];

const DEFAULT_CAREERS: CareerItem[] = [
  {
    code: "C24",
    name: "Diseño y Desarrollo de Software",
    count: 8,
    color: "#0284C7", // Azul Tecsup / Sky
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    code: "C20",
    name: "Administración de Redes y Comunicaciones",
    count: 2,
    color: "#0D1627", // Azul Marino Pizarra Institucional
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
];

export function CareerDonutChart({
  careers = DEFAULT_CAREERS,
  totalAdmitidos,
  isLoading = false,
}: CareerDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Filtrar únicamente carreras activas con postulantes (count > 0)
  const activeCareers = careers.filter((c) => c.count > 0);
  const displayCareers =
    activeCareers.length > 0
      ? activeCareers
      : careers.length > 0
      ? careers
      : DEFAULT_CAREERS;

  // Asignar colores de paleta institucional dinámicamente
  const coloredCareers = displayCareers.map((career, idx) => ({
    ...career,
    color: career.color || CAREER_PALETTE[idx % CAREER_PALETTE.length],
  }));

  // Calcular total si no viene provisto
  const total =
    totalAdmitidos && totalAdmitidos > 0
      ? totalAdmitidos
      : coloredCareers.reduce((acc, c) => acc + c.count, 0) || 1;

  // Parámetros geométricos SVG
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  // Calcular offsets acumulados para cada rebanada
  let accumulatedOffset = 0;
  const slices = coloredCareers.map((career, idx) => {
    const ratio = total > 0 ? career.count / total : 0;
    const strokeDasharray = `${(ratio * circumference).toFixed(2)} ${(
      circumference * (1 - ratio)
    ).toFixed(2)}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += ratio * circumference;
    const percentage = (ratio * 100).toFixed(1);

    return {
      ...career,
      index: idx,
      ratio,
      percentage,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  const activeItem = hoveredIndex !== null ? slices[hoveredIndex] : null;

  // Especialidad líder
  const leaderCareer = [...coloredCareers].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Distribución por Carrera
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
            2027-I
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Proporción de postulantes admitidos por especialidad técnica
        </p>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 animate-pulse">
            <div className="h-36 w-36 rounded-full border-8 border-slate-200" />
            <div className="h-4 w-28 bg-slate-200 rounded mt-4" />
          </div>
        ) : (
          <>
            {/* Donut Chart Container */}
            <div className="relative flex items-center justify-center py-2">
              <svg
                viewBox="0 0 100 100"
                className="w-44 h-44 -rotate-90 transform"
                aria-label="Gráfico de distribución por especialidad"
              >
                {/* Background Track Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="10"
                  fill="transparent"
                />

                {/* Slices */}
                {slices.map((slice) => {
                  const isHovered = hoveredIndex === slice.index;
                  return (
                    <circle
                      key={slice.code}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={slice.color}
                      strokeWidth={isHovered ? 13 : 10}
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="butt"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(slice.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Info Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {activeItem ? (
                  <>
                    <span className="text-xl font-extrabold text-slate-900 leading-none">
                      {activeItem.count}
                    </span>
                    <span className="text-[10px] font-bold text-sky-700 tracking-wide mt-1">
                      {activeItem.code} • {activeItem.percentage}%
                    </span>
                    <span className="text-[9px] text-slate-500 truncate max-w-[100px] mt-0.5">
                      postulantes
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-black text-slate-900 leading-none">
                      {total}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                      Total Padrón
                    </span>
                    <span className="text-[9px] text-sky-600 font-semibold">
                      Admitidos 100%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Legend List */}
            <div className="mt-4 space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {slices.map((slice) => {
                const isHovered = hoveredIndex === slice.index;
                return (
                  <div
                    key={slice.code}
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className={cn(
                      "group rounded-lg border p-2.5 transition-all cursor-pointer",
                      isHovered
                        ? "border-[#0284C7]/50 bg-sky-50/50 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: slice.color }}
                        />
                        <div className="truncate">
                          <span className="text-xs font-bold text-slate-900 mr-1.5">
                            {slice.code}
                          </span>
                          <span className="text-xs text-slate-600 font-medium">
                            {slice.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-slate-900">
                          {slice.count}
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          ({slice.percentage}%)
                        </span>
                      </div>
                    </div>

                    {/* Proportional Mini-Bar */}
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${slice.percentage}%`,
                          backgroundColor: slice.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Footer Insight */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        {leaderCareer ? (
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <Award className="h-3.5 w-3.5 text-sky-600 shrink-0" />
            <span className="truncate max-w-[190px]">
              Líder: <strong className="text-slate-900">{leaderCareer.code}</strong> (
              {((leaderCareer.count / total) * 100).toFixed(0)}%)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-600">
            <Users className="h-3.5 w-3.5 text-slate-400" />
            <span>Campus Lima</span>
          </div>
        )}

        <Link
          href="/estudiantes"
          className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 hover:underline flex items-center gap-0.5 shrink-0"
        >
          Ver padrón
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
