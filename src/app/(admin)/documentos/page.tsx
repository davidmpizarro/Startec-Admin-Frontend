"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { DocumentosTable } from "@/components/documentos/documentos-table";
import { documentosService } from "@/services/documentos.service";
import {
  PostulanteConDocumentos,
  DocumentoEstado,
  DocumentosResumen,
} from "@/types/documento";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  FileCheck2,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
} from "lucide-react";

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div
          className={`p-2.5 rounded-lg border flex items-center justify-center ${colorClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 text-3xl font-bold text-slate-900 tracking-tight">
        {value}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DocumentosPage() {
  const { toast } = useToast();
  const [postulantes, setPostulantes] = useState<PostulanteConDocumentos[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<DocumentoEstado | "ALL">(
    "ALL"
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  // Resetear a la primera página cuando cambian los filtros
  useEffect(() => {
    setPage(1);
  }, [searchTerm, estadoFilter]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await documentosService.getDocumentos();
      setPostulantes(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo conectar con el servidor.";
      toast({
        title: "Error al cargar documentos",
        description: msg,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Resumen KPIs ──────────────────────────────────────────────────────────
  const resumen: DocumentosResumen = useMemo(() => {
    let aprobados = 0;
    let enRevision = 0;
    let observados = 0;
    let totalDocumentos = 0;

    postulantes.forEach((p) => {
      p.documentos.forEach((d) => {
        totalDocumentos++;
        if (d.estado === "APROBADO") aprobados++;
        else if (d.estado === "EN_REVISION") enRevision++;
        else if (d.estado === "OBSERVADO") observados++;
      });
    });

    return {
      totalPostulantes: postulantes.length,
      totalDocumentos,
      aprobados,
      enRevision,
      observados,
    };
  }, [postulantes]);

  // ── Filtrado reactivo ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return postulantes.filter((p) => {
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.dni.includes(q) ||
        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(q) ||
        (p.carreraNombre && p.carreraNombre.toLowerCase().includes(q));

      if (!matchSearch) return false;

      if (estadoFilter === "ALL") return true;

      // Filtrar por estado global: si algún doc tiene ese estado lo incluimos
      return p.documentos.some((d) => d.estado === estadoFilter);
    });
  }, [postulantes, searchTerm, estadoFilter]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <div className="w-full max-w-[1700px] mx-auto px-6 py-8 space-y-6">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">
                Validación de Documentos de Admisión
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-800 border border-violet-200">
                <FileCheck2 className="h-3.5 w-3.5 text-violet-600" />
                Expedientes Digitales
              </span>
            </div>
            <p className="text-xs text-slate-600 font-normal">
              Revisa, aprueba u observa los documentos cargados por cada
              postulante en su proceso de admisión.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
            title="Refrescar datos"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>

        {/* ── KPIs ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <KpiCard
            label="Postulantes"
            value={resumen.totalPostulantes}
            icon={FileCheck2}
            colorClass="bg-violet-50 text-violet-700 border-violet-100"
          />
          <KpiCard
            label="Aprobados"
            value={resumen.aprobados}
            icon={CheckCircle2}
            colorClass="bg-emerald-50 text-emerald-700 border-emerald-100"
          />
          <KpiCard
            label="En Revisión"
            value={resumen.enRevision}
            icon={Clock}
            colorClass="bg-amber-50 text-amber-700 border-amber-100"
          />
          <KpiCard
            label="Observados"
            value={resumen.observados}
            icon={AlertCircle}
            colorClass="bg-red-50 text-red-700 border-red-100"
          />
        </div>

        {/* ── Barra de búsqueda y filtro ────────────────────────────────── */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por DNI, nombre o carrera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-violet-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span>Estado doc:</span>
            </div>
            <select
              value={estadoFilter}
              onChange={(e) =>
                setEstadoFilter(e.target.value as DocumentoEstado | "ALL")
              }
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:border-violet-500 focus:outline-none"
            >
              <option value="ALL">Todos</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="APROBADO">Aprobados</option>
              <option value="OBSERVADO">Observados</option>
            </select>
            {(searchTerm || estadoFilter !== "ALL") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setEstadoFilter("ALL");
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* ── Tabla de documentos ──────────────────────────────────────── */}
        <DocumentosTable
          postulantes={filtered}
          isLoading={isLoading}
          onRefresh={loadData}
          page={page}
          onPageChange={setPage}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </div>
  );
}
