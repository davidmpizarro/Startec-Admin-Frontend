"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CareerStatusData {
  carrera: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  enProceso: number;
  matriculados: number;
  total?: number;
}

interface CareerBarChartProps {
  data?: CareerStatusData[];
  isLoading?: boolean;
}

const DEFAULT_DATA: CareerStatusData[] = [
  {
    carrera: "C24 Software",
    carreraCodigo: "C24",
    carreraNombre: "Diseño y Desarrollo de Software",
    enProceso: 6,
    matriculados: 2,
    total: 8,
  },
  {
    carrera: "C20 Redes",
    carreraCodigo: "C20",
    carreraNombre: "Administración de Redes y Comunicaciones",
    enProceso: 2,
    matriculados: 0,
    total: 2,
  },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload?: {
      codigo: string;
      nombreCompleto: string;
      carrera: string;
      total: number;
      enProceso: number;
      matriculados: number;
    };
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const itemData = payload[0]?.payload;
    const title = itemData?.nombreCompleto || itemData?.carrera || label;
    const code = itemData?.codigo || label;
    const total =
      itemData?.total ??
      (itemData ? itemData.enProceso + itemData.matriculados : 0);

    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs space-y-2 min-w-[170px] z-50">
        <div className="border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200 shrink-0">
            {code}
          </span>
          <span
            className="font-bold text-slate-800 truncate max-w-[200px]"
            title={title}
          >
            {title}
          </span>
        </div>
        <div className="space-y-1.5">
          {payload.map((entry, index) => (
            <div
              key={`tooltip-${index}`}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 font-medium">{entry.name}:</span>
              </div>
              <span className="font-bold text-slate-900">{entry.value}</span>
            </div>
          ))}
          <div className="border-t border-slate-100 pt-1 flex items-center justify-between font-bold text-slate-800">
            <span>Total postulantes:</span>
            <span>{total}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function CareerBarChart({
  data = DEFAULT_DATA,
  isLoading = false,
}: CareerBarChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1. Filtrar ÚNICAMENTE aquellas carreras que tengan al menos 1 postulante (total > 0 o enProceso + matriculados > 0)
  // 2. Ordenar de mayor a menor volumen de postulantes
  const sourceList = data && data.length > 0 ? data : DEFAULT_DATA;
  const processedData = sourceList
    .map((item) => {
      const total =
        item.total !== undefined
          ? item.total
          : item.enProceso + item.matriculados;
      const codigo =
        item.carreraCodigo || item.carrera.split(" ")[0] || item.carrera;
      const nombreCompleto = item.carreraNombre || item.carrera;
      return {
        ...item,
        codigo,
        nombreCompleto,
        total,
      };
    })
    .filter((item) => item.total > 0)
    .sort((a, b) => b.total - a.total);

  const chartData =
    processedData.length > 0
      ? processedData
      : DEFAULT_DATA.map((item) => ({
          ...item,
          codigo: item.carreraCodigo || item.carrera.split(" ")[0],
          nombreCompleto: item.carreraNombre || item.carrera,
          total: item.enProceso + item.matriculados,
        }));

  // Altura dinámica: cada fila horizontal necesita ~38px para verse nítida
  const isScrollable = chartData.length > 5;
  const chartHeight = isScrollable
    ? Math.max(260, chartData.length * 38 + 50)
    : Math.max(180, chartData.length * 42 + 50);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      {/* Cabecera */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 border border-sky-200 text-sky-700">
              <BarChart3 className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Estado de Admisión por Carrera
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Distribución de postulantes según avance oficial (2027-I)
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold shrink-0">
          2027-I
        </span>
      </div>

      {/* Gráfico de Barras Horizontal Apilado */}
      <div
        className={cn(
          "w-full transition-all",
          isScrollable && "max-h-72 overflow-y-auto pr-1"
        )}
      >
        {isLoading || !isMounted ? (
          <div className="flex h-56 w-full items-center justify-center rounded-xl bg-slate-50/70 border border-slate-100 animate-pulse">
            <span className="text-xs text-slate-400">
              Cargando gráfico de barras...
            </span>
          </div>
        ) : (
          <div
            style={{
              height: `${chartHeight}px`,
              width: "100%",
              minWidth: "100%",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={chartData}
                margin={{ top: 8, right: 16, left: -10, bottom: 0 }}
                barCategoryGap="22%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#CBD5E1"
                  vertical={true}
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tick={{ fill: "#64748B", fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="codigo"
                  tickLine={false}
                  axisLine={{ stroke: "#CBD5E1" }}
                  tick={{ fill: "#0F172A", fontSize: 11, fontWeight: 700 }}
                  width={42}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "#F8FAFC", opacity: 0.8 }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    paddingTop: "14px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#475569",
                  }}
                />
                {/* Barra: En Proceso (Ámbar) apilada */}
                <Bar
                  dataKey="enProceso"
                  name="En Proceso"
                  stackId="status"
                  fill="#F59E0B"
                  radius={[0, 0, 0, 0]}
                  barSize={16}
                />
                {/* Barra: Matriculados (Azul Tecsup / Sky) apilada */}
                <Bar
                  dataKey="matriculados"
                  name="Matriculados"
                  stackId="status"
                  fill="#0284C7"
                  radius={[0, 4, 4, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
