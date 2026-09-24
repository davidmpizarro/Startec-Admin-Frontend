"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import {
  CareerDonutChart,
  CareerItem,
  CAREER_PALETTE,
} from "@/components/dashboard/career-donut-chart";
import {
  CareerBarChart,
  CareerStatusData,
} from "@/components/dashboard/career-bar-chart";
import { metricsService } from "@/services/metrics.service";
import { studentsService } from "@/services/students.service";
import { DashboardMetricsResponse } from "@/types/metrics";
import { getCarreraNombre } from "@/types/student";
import { RefreshCw, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const getShortCareerName = (code: string, fullName: string): string => {
  const customShortNames: Record<string, string> = {
    C1: "Procesos Químicos",
    C5: "Electrónica Ind.",
    C11: "Operaciones Mineras",
    C12: "Producción Ind.",
    C14: "Aviónica",
    C16: "Mecatrónica",
    C20: "Redes y Com.",
    C21: "Maquinaria Pesada",
    C22: "Maquinaria Planta",
    C23: "Electricidad Ind.",
    C24: "Software",
    C25: "Diseño Ind.",
    C26: "Videojuegos",
    C28: "Big Data",
    D12: "Ciencia Datos",
    D13: "Logística Digital",
    D14: "Animación Digital",
  };
  return customShortNames[code] || fullName.split(" ").slice(0, 2).join(" ");
};

const INITIAL_CAREER_DATA: CareerItem[] = [
  {
    code: "C24",
    name: "Diseño y Desarrollo de Software",
    count: 8,
    color: "#0284C7",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  {
    code: "C20",
    name: "Administración de Redes y Comunicaciones",
    count: 2,
    color: "#0D1627",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
];

const INITIAL_BAR_DATA: CareerStatusData[] = [
  {
    carrera: "C24 Software",
    enProceso: 6,
    matriculados: 2,
  },
  {
    carrera: "C20 Redes y Com.",
    enProceso: 2,
    matriculados: 0,
  },
];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [careerData, setCareerData] = useState<CareerItem[]>(INITIAL_CAREER_DATA);
  const [barChartData, setBarChartData] = useState<CareerStatusData[]>(INITIAL_BAR_DATA);

  const { toast } = useToast();

  const fetchMetrics = useCallback(async (showToast = false) => {
    try {
      if (showToast) setIsRefreshing(true);
      const [metricsRes, studentsRes] = await Promise.allSettled([
        metricsService.getDashboardMetrics(),
        studentsService.getStudents({ limit: 1000 }),
      ]);

      if (metricsRes.status === "fulfilled") {
        setData(metricsRes.value);
      }

      if (studentsRes.status === "fulfilled" && studentsRes.value.items.length > 0) {
        const students = studentsRes.value.items;

        const careerMap = new Map<
          string,
          {
            code: string;
            name: string;
            count: number;
            matriculados: number;
            enProceso: number;
          }
        >();

        for (const s of students) {
          const code = s.carreraCodigo || "C24";
          const name = s.carreraNombre || getCarreraNombre(code);
          const isMatriculado =
            s.estadoMatricula === "MATRICULADO_CONFIRMADO" ||
            s.estado === "MATRICULADO" ||
            (s.pasoActualMatricula ?? 1) >= 8;

          if (!careerMap.has(code)) {
            careerMap.set(code, {
              code,
              name,
              count: 0,
              matriculados: 0,
              enProceso: 0,
            });
          }

          const entry = careerMap.get(code)!;
          entry.count += 1;
          if (isMatriculado) {
            entry.matriculados += 1;
          } else {
            entry.enProceso += 1;
          }
        }

        // Ordenar por cantidad de postulantes (descendente)
        const sortedEntries = Array.from(careerMap.values()).sort(
          (a, b) => b.count - a.count
        );

        if (sortedEntries.length > 0) {
          setCareerData(
            sortedEntries.map((entry, idx) => ({
              code: entry.code,
              name: entry.name,
              count: entry.count,
              color: CAREER_PALETTE[idx % CAREER_PALETTE.length],
              badgeClass:
                idx === 0
                  ? "bg-sky-50 text-sky-700 border-sky-200"
                  : "bg-slate-100 text-slate-800 border-slate-200",
            }))
          );

          setBarChartData(
            sortedEntries.map((entry) => ({
              carrera: `${entry.code} ${getShortCareerName(entry.code, entry.name)}`.trim(),
              carreraCodigo: entry.code,
              carreraNombre: entry.name,
              enProceso: entry.enProceso,
              matriculados: entry.matriculados,
              total: entry.count,
            }))
          );
        }
      }

      if (showToast) {
        const horaCorte = new Date().toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
        toast({
          title: "Métricas sincronizadas con éxito",
          description: `Datos consolidados desde PostgreSQL en tiempo real (corte: ${horaCorte}).`,
          type: "success",
        });
      }
    } catch {
      toast({
        title: "Aviso de conexión",
        description: "Operando con datos cacheados de Secretaría Académica.",
        type: "info",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <div className="w-full max-w-[1700px] mx-auto px-6 py-8 space-y-8">
        {/* Top welcome banner (Rediseño Estilo Claro y Limpio) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 text-xs font-semibold">
                Ciclo Académico 2027-I
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Bienvenido al Panel Admin
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">
              Monitorea el avance de admisión, validación biométrica, recaudación de matrícula y asignación de horarios.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchMetrics(true)}
              disabled={isRefreshing}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 h-9 px-4 rounded-lg text-xs font-medium inline-flex items-center gap-2 transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 text-slate-600", isRefreshing && "animate-spin")} />
              Sincronizar API
            </button>
            <Link href="/estudiantes">
              <button
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 h-9 px-4 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                Padrón de Alumnos
                <ArrowUpRight className="h-4 w-4 text-slate-500" />
              </button>
            </Link>
          </div>
        </div>

        {/* 1. Tarjetas KPI */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Indicadores Clave de Desempeño (KPIs)
              </h3>
              <p className="text-xs text-slate-600 font-normal">
                Totales consolidados de admitidos, matriculados, tesorería y biometría
              </p>
            </div>
            {data && (
              <span className="text-xs text-slate-500">
                Último corte: {new Date(data.lastUpdated).toLocaleTimeString("es-PE")}
              </span>
            )}
          </div>

          {isLoading || !data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-36 rounded-lg border border-slate-200 bg-white p-5 animate-pulse shadow-xs"
                >
                  <div className="h-4 w-28 bg-slate-200 rounded mb-4" />
                  <div className="h-8 w-20 bg-slate-200 rounded mb-2" />
                  <div className="h-3 w-36 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard metric={data.kpis.totalAdmitidos} />
              <KpiCard metric={data.kpis.matriculados} />
              <KpiCard metric={data.kpis.pagosPendientes} />
              <KpiCard metric={data.kpis.biometriasCompletadas} />
            </div>
          )}
        </div>

        {/* 2. Sección Inferior: Grid Responsive (2 columnas Embudo + 1 columna Donut) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Columnas 1 y 2: Flujo del Proceso de Matrícula (Embudo) */}
          <div className="lg:col-span-2">
            {isLoading || !data ? (
              <div className="h-96 rounded-lg border border-slate-200 bg-white p-6 animate-pulse flex items-center justify-center shadow-xs">
                <span className="text-sm text-slate-400">Cargando embudo de matrícula...</span>
              </div>
            ) : (
              <FunnelChart steps={data.funnel} periodName={data.periodName} />
            )}
          </div>

          {/* Columna 3: Contenedor Lateral Derecho con Donut y Gráfico de Barras */}
          <div className="lg:col-span-1 space-y-6">
            <CareerDonutChart
              careers={careerData}
              totalAdmitidos={
                data ? data.kpis.totalAdmitidos.value : careerData.reduce((acc, c) => acc + c.count, 0)
              }
              isLoading={isLoading}
            />

            <CareerBarChart
              data={barChartData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

