"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Header } from "@/components/layout/header";
import { paymentsService } from "@/services/payments.service";
import {
  PagoCulqi,
  CuentaPorCobrar,
  TesoreriaResumen,
} from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import {
  CreditCard,
  Banknote,
  Receipt,
  Search,
  Download,
  RefreshCw,
  CheckCircle2,
  Clock,
  Copy,
  Check,
  Bell,
  ShieldCheck,
  Filter,
  DollarSign,
  AlertCircle,
  X,
  ChevronRight,
  Send,
  Building2,
} from "lucide-react";

export default function TesoreriaPage() {
  const [activeTab, setActiveTab] = useState<"culqi" | "cuentasPorCobrar">("culqi");
  const [recaudacionCulqi, setRecaudacionCulqi] = useState<PagoCulqi[]>([]);
  const [cuentasPorCobrar, setCuentasPorCobrar] = useState<CuentaPorCobrar[]>([]);
  const [resumen, setResumen] = useState<TesoreriaResumen>({
    totalRecaudadoCulqi: 0,
    totalTransacciones: 0,
    ticketPromedio: 0,
    totalPorCobrar: 0,
    estudiantesPendientes: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isExporting, setIsExporting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal para Pago Manual
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [selectedCuenta, setSelectedCuenta] = useState<CuentaPorCobrar | null>(null);
  const [metodoManual, setMetodoManual] = useState("Ventanilla Campus Lima - Santa Anita");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Estado para envío de recordatorio
  const [isSendingPush, setIsSendingPush] = useState<string | null>(null);

  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await paymentsService.getTodosLosPagos();
      setRecaudacionCulqi(res.recaudacionCulqi || []);
      setCuentasPorCobrar(res.cuentasPorCobrar || []);
      setResumen(
        res.resumen || {
          totalRecaudadoCulqi: 0,
          totalTransacciones: 0,
          ticketPromedio: 0,
          totalPorCobrar: 0,
          estudiantesPendientes: 0,
        }
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo conectar al endpoint de tesorería.";
      toast({
        title: "Error al cargar tesorería",
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

  // Filtrado reactivo en Tab Culqi
  const filteredCulqi = useMemo(() => {
    return recaudacionCulqi.filter((pago) => {
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        (pago.chargeId && pago.chargeId.toLowerCase().includes(q)) ||
        (pago.transaccionId && pago.transaccionId.toLowerCase().includes(q)) ||
        (pago.estudiante?.dni && pago.estudiante.dni.toLowerCase().includes(q)) ||
        (pago.estudiante?.nombres &&
          pago.estudiante.nombres.toLowerCase().includes(q)) ||
        (pago.estudiante?.apellidos &&
          pago.estudiante.apellidos.toLowerCase().includes(q)) ||
        (pago.estudiante?.carrera?.nombre &&
          pago.estudiante.carrera.nombre.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === "ALL" || pago.estado === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [recaudacionCulqi, searchTerm, statusFilter]);

  // Filtrado reactivo en Tab Cuentas por Cobrar
  const filteredCuentas = useMemo(() => {
    return cuentasPorCobrar.filter((cuenta) => {
      const q = searchTerm.trim().toLowerCase();
      return (
        !q ||
        cuenta.dni.toLowerCase().includes(q) ||
        cuenta.estudiante.toLowerCase().includes(q) ||
        (cuenta.carrera?.nombre &&
          cuenta.carrera.nombre.toLowerCase().includes(q)) ||
        cuenta.concepto.toLowerCase().includes(q)
      );
    });
  }, [cuentasPorCobrar, searchTerm]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast({
      title: "Copiado al portapapeles",
      description: text,
      type: "info",
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCsv = () => {
    try {
      setIsExporting(true);

      if (activeTab === "culqi") {
        const headers = [
          "Cargo ID Culqi",
          "Fecha",
          "Hora",
          "DNI Postulante",
          "Nombres",
          "Apellidos",
          "Carrera",
          "Concepto",
          "Tarjeta",
          "Monto (PEN)",
          "Estado",
        ].join(",");

        const rows = filteredCulqi
          .map((p) => {
            const date = new Date(p.fechaPago);
            const fecha = !isNaN(date.getTime())
              ? date.toLocaleDateString("es-PE")
              : "";
            const hora = !isNaN(date.getTime())
              ? date.toLocaleTimeString("es-PE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            const escape = (val?: string | null | number) => {
              if (val === undefined || val === null) return '""';
              const str = String(val).replace(/"/g, '""');
              return `"${str}"`;
            };

            const tarjetaStr = `${p.tarjeta?.marca || "Tarjeta"} **** ${p.tarjeta?.ultimos4 || "4242"}`;

            return [
              escape(p.chargeId),
              escape(fecha),
              escape(hora),
              escape(p.estudiante?.dni || ""),
              escape(p.estudiante?.nombres || ""),
              escape(p.estudiante?.apellidos || ""),
              escape(p.estudiante?.carrera?.nombre || "Tecsup"),
              escape(p.concepto),
              escape(tarjetaStr),
              Number(p.monto).toFixed(2),
              escape(p.estado),
            ].join(",");
          })
          .join("\n");

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + headers + "\n" + rows], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `recaudacion-culqi-tecsup-${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const headers = [
          "DNI Postulante",
          "Estudiante",
          "Carrera",
          "Concepto",
          "Monto Pendiente (PEN)",
          "Días en Espera",
          "Estado",
          "Fecha Admisión",
        ].join(",");

        const rows = filteredCuentas
          .map((c) => {
            const escape = (val?: string | null | number) => {
              if (val === undefined || val === null) return '""';
              const str = String(val).replace(/"/g, '""');
              return `"${str}"`;
            };

            const fecha = new Date(c.fechaAdmision).toLocaleDateString("es-PE");

            return [
              escape(c.dni),
              escape(c.estudiante),
              escape(c.carrera?.nombre || "Tecsup"),
              escape(c.concepto),
              Number(c.montoPendiente).toFixed(2),
              c.diasEnEspera,
              escape(c.estado),
              escape(fecha),
            ].join(",");
          })
          .join("\n");

        const BOM = "\uFEFF";
        const blob = new Blob([BOM + headers + "\n" + rows], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `cuentas-por-cobrar-tecsup-${new Date().toISOString().slice(0, 10)}.csv`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast({
        title: "Reporte exportado con éxito",
        description: "Archivo CSV generado compatible con Microsoft Excel.",
        type: "success",
      });
    } catch {
      toast({
        title: "Error al exportar",
        description: "No se pudo generar el reporte CSV.",
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenManualModal = (cuenta: CuentaPorCobrar) => {
    setSelectedCuenta(cuenta);
    setMetodoManual("Ventanilla Campus Lima - Santa Anita");
    setManualModalOpen(true);
  };

  const handleConfirmManualPayment = async () => {
    if (!selectedCuenta) return;

    try {
      setIsSubmittingManual(true);
      const res = await paymentsService.registrarPagoManual({
        estudianteId: selectedCuenta.id,
        dni: selectedCuenta.dni,
        monto: selectedCuenta.montoPendiente,
        concepto: "Cuota Matrícula 2027-I (Ventanilla Tecsup)",
        metodo: metodoManual,
      });

      toast({
        title: "Pago registrado exitosamente",
        description: res.message,
        type: "success",
      });

      setManualModalOpen(false);
      setSelectedCuenta(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrar el pago manual";
      toast({
        title: "Error en registro manual",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const handleSendReminder = async (cuenta: CuentaPorCobrar) => {
    try {
      setIsSendingPush(cuenta.id);
      const res = await paymentsService.enviarRecordatorio({
        estudianteId: cuenta.id,
        dni: cuenta.dni,
      });

      toast({
        title: "Notificación Push enviada",
        description: res.message,
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al enviar recordatorio";
      toast({
        title: "Fallo al enviar notificación",
        description: msg,
        type: "error",
      });
    } finally {
      setIsSendingPush(null);
    }
  };

  const formatMonto = (monto: number | string) => {
    const num = typeof monto === "number" ? monto : parseFloat(monto) || 0;
    return `S/ ${num.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (fechaISO: string) => {
    const d = new Date(fechaISO);
    if (isNaN(d.getTime())) return { dateStr: fechaISO, timeStr: "" };
    const dateStr = d.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
    const timeStr = d.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return { dateStr, timeStr };
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <div className="w-full max-w-[1700px] mx-auto px-6 py-8 space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-slate-900">
                Auditoría Financiera de Matrícula
              </h2>
            </div>
            <p className="text-xs text-slate-600 font-normal">
              Supervisión de transacciones confirmadas en pasarela digital y gestión de cartera pendiente de postulantes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting}
              isLoading={isExporting}
              className="text-slate-700 border-slate-200 bg-white hover:bg-slate-50 font-medium shadow-2xs"
            >
              {!isExporting && <Download className="mr-1.5 h-4 w-4 text-slate-600" />}
              {isExporting ? "Exportando..." : "Exportar Reporte (CSV)"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={isLoading}
              className="text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
              title="Refrescar datos"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* ── SISTEMA DE PESTAÑAS (TABS) ────────────────────────────── */}
        <div className="border-b border-slate-200 flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("culqi");
              setSearchTerm("");
            }}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "culqi"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Recaudación Pasarela Culqi
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "culqi"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {recaudacionCulqi.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("cuentasPorCobrar");
              setSearchTerm("");
            }}
            className={`pb-3 px-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === "cuentasPorCobrar"
                ? "border-amber-600 text-amber-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="h-4 w-4" />
            Cuentas por Cobrar
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                activeTab === "cuentasPorCobrar"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {cuentasPorCobrar.length}
            </span>
          </button>
        </div>

        {/* ── CONTENIDO: PESTAÑA 1 - RECAUDACIÓN CULQI ─────────────────── */}
        {activeTab === "culqi" && (
          <div className="space-y-6">
            {/* Top Summary Cards (KPIs) Culqi */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Total Recaudado Culqi */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Recaudación Culqi Total
                  </span>
                  <div className="p-2.5 rounded-lg border bg-emerald-50 text-emerald-700 border-emerald-100 flex items-center justify-center">
                    <Banknote className="h-5 w-5 text-emerald-700" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    {formatMonto(resumen.totalRecaudadoCulqi)}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center font-semibold text-emerald-700">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                    Acreditado en cuenta recaudadora
                  </span>
                  <span className="text-slate-500 font-medium">Pasarela Culqi</span>
                </div>
              </div>

              {/* Total Transacciones Aprobadas */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Transacciones Aprobadas
                  </span>
                  <div className="p-2.5 rounded-lg border bg-blue-50 text-blue-700 border-blue-100 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    {resumen.totalTransacciones}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center font-semibold text-sky-700">
                    <ShieldCheck className="mr-1 h-3.5 w-3.5 text-sky-600" />
                    Culqi Checkout Tokenizado
                  </span>
                  <span className="text-slate-500 font-medium">100% liquidadas</span>
                </div>
              </div>

              {/* Ticket Promedio */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ticket Promedio
                  </span>
                  <div className="p-2.5 rounded-lg border bg-sky-50 text-sky-700 border-sky-100 flex items-center justify-center">
                    <Receipt className="h-5 w-5 text-sky-700" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    {formatMonto(resumen.ticketPromedio)}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Cuota Matrícula 2027-I</span>
                  <span className="text-slate-500 font-medium">Tarifa única</span>
                </div>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por DNI, Cargo ID (chr_...), Estudiante o Carrera..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Filter className="h-3.5 w-3.5 text-slate-400" />
                  <span>Estado:</span>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="APROBADO">Aprobados</option>
                  <option value="PENDIENTE">Pendientes</option>
                  <option value="RECHAZADO">Rechazados</option>
                </select>
                {(searchTerm || statusFilter !== "ALL") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("ALL");
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800"
                  >
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* Tabla Recaudación Culqi */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">
                    Transacciones Procesadas vía Culqi
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                    ({filteredCulqi.length} registradas)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Pasarela Activa:</span>
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                    Culqi API
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse caption-bottom text-xs">
                  <thead className="border-b border-slate-200 bg-slate-100/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Cargo ID Culqi</th>
                      <th className="py-3 px-4">DNI</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4">Carrera</th>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4">Tarjeta</th>
                      <th className="py-3 px-4 text-right">Monto (PEN)</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      Array.from({ length: 4 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-4 px-4"><div className="h-3 w-20 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-3 w-16 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-3.5 w-32 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-4 w-20 bg-slate-200 rounded-full"></div></td>
                          <td className="py-4 px-4 text-right"><div className="h-3.5 w-16 bg-slate-200 rounded ml-auto"></div></td>
                          <td className="py-4 px-4 text-center"><div className="h-5 w-16 bg-slate-200 rounded-full mx-auto"></div></td>
                        </tr>
                      ))
                    ) : filteredCulqi.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-500">
                          <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="font-semibold text-slate-700 text-sm">
                            No se encontraron transacciones Culqi
                          </p>
                          <p className="text-xs text-slate-400">
                            No hay registros coincidentes con los filtros aplicados.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCulqi.map((pago) => {
                        const { dateStr, timeStr } = formatDate(pago.fechaPago);
                        const chargeId = pago.chargeId || pago.transaccionId || pago.id;
                        const estudiante = pago.estudiante;
                        const carreraCodigo = estudiante?.carrera?.codigo || "C24";
                        const carreraNombre = estudiante?.carrera?.nombre || "Diseño y Software";

                        return (
                          <tr key={pago.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Fecha / Hora */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-medium text-slate-800">{dateStr}</div>
                              {timeStr && <div className="text-[11px] text-slate-400">{timeStr}</div>}
                            </td>

                            {/* Cargo ID Culqi */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50/80 border border-blue-200/80 px-2 py-0.5 rounded max-w-[150px] truncate" title={chargeId}>
                                  {chargeId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(chargeId)}
                                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                                  title="Copiar Cargo ID Culqi"
                                >
                                  {copiedId === chargeId ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* DNI */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                {estudiante?.dni || "S/D"}
                              </span>
                            </td>

                            {/* Estudiante */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 leading-tight">
                                {estudiante
                                  ? `${estudiante.nombres || ""} ${estudiante.apellidos || ""}`.trim() || "Postulante"
                                  : "Postulante"}
                              </div>
                            </td>

                            {/* Carrera */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                                  {carreraCodigo}
                                </span>
                                <span className="text-[11px] text-slate-600 truncate max-w-[160px]" title={carreraNombre}>
                                  {carreraNombre}
                                </span>
                              </div>
                            </td>

                            {/* Concepto */}
                            <td className="py-3 px-4">
                              <span className="text-slate-700 font-medium">
                                {pago.concepto}
                              </span>
                            </td>

                            {/* Tarjeta */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                <CreditCard className="h-3 w-3 text-slate-600" />
                                <span className="font-semibold">{pago.tarjeta?.marca || "Visa"}</span>
                                <span className="font-mono text-slate-500">•••• {pago.tarjeta?.ultimos4 || "4242"}</span>
                              </span>
                            </td>

                            {/* Monto (PEN) */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <span className="font-mono text-sm font-bold text-slate-900">
                                {formatMonto(pago.monto)}
                              </span>
                            </td>

                            {/* Estado */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <Badge
                                variant="success"
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 font-semibold"
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                Aprobado
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <span>
                  Mostrando <strong>{filteredCulqi.length}</strong> transacciones liquidadas
                </span>
                <span className="text-[11px] text-slate-400">
                  Conciliación bancaria en tiempo real &bull; Culqi Tokenized Gateway
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── CONTENIDO: PESTAÑA 2 - CUENTAS POR COBRAR ────────────────── */}
        {activeTab === "cuentasPorCobrar" && (
          <div className="space-y-6">
            {/* Top Summary Cards Cuentas por Cobrar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Cartera por Cobrar */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Cartera por Cobrar
                  </span>
                  <div className="p-2.5 rounded-lg border bg-amber-50 text-amber-700 border-amber-100 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-700" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    {formatMonto(resumen.totalPorCobrar)}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center font-semibold text-amber-700">
                    <Clock className="mr-1 h-3.5 w-3.5 text-amber-600" />
                    Liquidaciones generadas pendientes
                  </span>
                  <span className="text-slate-500 font-medium">Admisión 2027-I</span>
                </div>
              </div>

              {/* Postulantes Pendientes */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Postulantes con Vacante por Confirmar
                  </span>
                  <div className="p-2.5 rounded-lg border bg-blue-50 text-blue-700 border-blue-100 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-blue-700" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-3xl font-bold text-slate-900 tracking-tight">
                    {resumen.estudiantesPendientes}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center font-semibold text-sky-700">
                    Pendientes de pago o depósito
                  </span>
                  <span className="text-slate-500 font-medium">Gestión activa</span>
                </div>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar postulante por DNI, Nombre o Carrera..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Limpiar búsqueda
                </Button>
              )}
            </div>

            {/* Tabla Cuentas por Cobrar */}
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-slate-800">
                    Postulantes Admitidos con Liquidación Pendiente
                  </span>
                  <span className="text-xs font-normal text-slate-500">
                    ({filteredCuentas.length} por liquidar)
                  </span>
                </div>
                <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                  Seguimiento de Vacantes
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse caption-bottom text-xs">
                  <thead className="border-b border-slate-200 bg-slate-100/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">DNI</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4">Carrera</th>
                      <th className="py-3 px-4">Concepto</th>
                      <th className="py-3 px-4 text-right">Monto Pendiente</th>
                      <th className="py-3 px-4 text-center">Días en Espera</th>
                      <th className="py-3 px-4 text-center">Estado</th>
                      <th className="py-3 px-4 text-right">Acciones de Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, idx) => (
                        <tr key={idx} className="animate-pulse">
                          <td className="py-4 px-4"><div className="h-3 w-16 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-3.5 w-32 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-3 w-28 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4"><div className="h-3 w-24 bg-slate-200 rounded"></div></td>
                          <td className="py-4 px-4 text-right"><div className="h-3.5 w-16 bg-slate-200 rounded ml-auto"></div></td>
                          <td className="py-4 px-4 text-center"><div className="h-4 w-12 bg-slate-200 rounded mx-auto"></div></td>
                          <td className="py-4 px-4 text-center"><div className="h-5 w-24 bg-slate-200 rounded-full mx-auto"></div></td>
                          <td className="py-4 px-4 text-right"><div className="h-7 w-36 bg-slate-200 rounded ml-auto"></div></td>
                        </tr>
                      ))
                    ) : filteredCuentas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2" />
                          <p className="font-semibold text-slate-700 text-sm">
                            ¡Sin pagos pendientes en cartera!
                          </p>
                          <p className="text-xs text-slate-400">
                            Todos los postulantes admitidos se encuentran al día o no coinciden con la búsqueda.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCuentas.map((cuenta) => {
                        const carreraCodigo = cuenta.carrera?.codigo || "C24";
                        const carreraNombre = cuenta.carrera?.nombre || "Tecsup Carrera";

                        return (
                          <tr key={cuenta.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* DNI */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                {cuenta.dni}
                              </span>
                            </td>

                            {/* Estudiante */}
                            <td className="py-3 px-4">
                              <div className="font-semibold text-slate-900 leading-tight">
                                {cuenta.estudiante}
                              </div>
                              {cuenta.telefono && (
                                <div className="text-[11px] text-slate-400">
                                  Tel: {cuenta.telefono}
                                </div>
                              )}
                            </td>

                            {/* Carrera */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                                  {carreraCodigo}
                                </span>
                                <span className="text-[11px] text-slate-600 truncate max-w-[160px]" title={carreraNombre}>
                                  {carreraNombre}
                                </span>
                              </div>
                            </td>

                            {/* Concepto */}
                            <td className="py-3 px-4">
                              <span className="text-slate-700 font-medium">
                                {cuenta.concepto}
                              </span>
                            </td>

                            {/* Monto Pendiente */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <span className="font-mono text-sm font-bold text-amber-900">
                                {formatMonto(cuenta.montoPendiente)}
                              </span>
                            </td>

                            {/* Días en Espera */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                <Clock className="h-3 w-3 text-slate-500" />
                                {cuenta.diasEnEspera} {cuenta.diasEnEspera === 1 ? "día" : "días"}
                              </span>
                            </td>

                            {/* Estado */}
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <Badge
                                variant="warning"
                                className="inline-flex items-center gap-1 px-2.5 py-0.5 font-semibold text-[11px]"
                              >
                                <Clock className="h-3 w-3" />
                                Liquidación Generada
                              </Badge>
                            </td>

                            {/* Acciones */}
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenManualModal(cuenta)}
                                  className="h-8 px-2.5 text-xs text-blue-700 border-blue-200 bg-blue-50/70 hover:bg-blue-100 font-semibold shadow-2xs"
                                  title="Registrar pago presencial o por ventanilla"
                                >
                                  <Receipt className="mr-1 h-3.5 w-3.5" />
                                  Pago Manual
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={isSendingPush === cuenta.id}
                                  onClick={() => handleSendReminder(cuenta)}
                                  className="h-8 px-2 text-xs text-slate-600 hover:text-amber-800 hover:bg-amber-50"
                                  title="Enviar recordatorio push a la app"
                                >
                                  <Send
                                    className={`h-3.5 w-3.5 ${
                                      isSendingPush === cuenta.id ? "animate-pulse text-amber-600" : ""
                                    }`}
                                  />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                <span>
                  Mostrando <strong>{filteredCuentas.length}</strong> expedientes con pago pendiente
                </span>
                <span className="text-[11px] text-slate-400">
                  Las acciones de pago manual acreditan de inmediato el avance del postulante a Paso 6
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: REGISTRAR PAGO MANUAL ───────────────────────────── */}
      {manualModalOpen && selectedCuenta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Registrar Pago en Ventanilla
                  </h3>
                  <p className="text-xs text-slate-500">
                    Liquidación manual de cuota de matrícula
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Postulante:</span>
                  <span className="font-semibold text-slate-900">{selectedCuenta.estudiante}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">DNI:</span>
                  <span className="font-mono font-semibold text-slate-800">{selectedCuenta.dni}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Carrera:</span>
                  <span className="text-slate-700 truncate max-w-[200px]">{selectedCuenta.carrera?.nombre || "Tecsup"}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="font-semibold text-slate-700">Monto a Liquidar:</span>
                  <span className="font-mono text-sm font-bold text-emerald-700">
                    {formatMonto(selectedCuenta.montoPendiente)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Modalidad de Pago / Canal
                </label>
                <select
                  value={metodoManual}
                  onChange={(e) => setMetodoManual(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs font-medium focus:border-blue-500 focus:outline-none"
                >
                  <option value="Ventanilla Campus Lima - Santa Anita">
                    Ventanilla Campus Lima - Santa Anita
                  </option>
                  <option value="Depósito Bancario BCP (Cuenta Recaudadora)">
                    Depósito Bancario BCP (Cuenta Recaudadora)
                  </option>
                  <option value="Depósito Bancario BBVA (Recaudo Tecsup)">
                    Depósito Bancario BBVA (Recaudo Tecsup)
                  </option>
                  <option value="Transferencia Interbancaria CCI">
                    Transferencia Interbancaria CCI
                  </option>
                  <option value="PagoEfectivo / CIP Acreditado">
                    PagoEfectivo / CIP Acreditado
                  </option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
                Al confirmar, se generará una constancia de pago con código institucional y el postulante pasará automáticamente al estado <strong>MATRICULADO CONFIRMADO</strong> en PostgreSQL.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-3 border-t border-slate-100 bg-slate-50/60">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setManualModalOpen(false)}
                disabled={isSubmittingManual}
                className="text-xs"
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmManualPayment}
                disabled={isSubmittingManual}
                isLoading={isSubmittingManual}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm"
              >
                <Check className="mr-1.5 h-4 w-4" />
                Confirmar e Ingresar Pago
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
