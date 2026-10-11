"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  FileCheck2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  X,
  FileText,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TablePagination } from "@/components/ui/table-pagination";
import { useToast } from "@/components/ui/toast";
import { documentosService } from "@/services/documentos.service";
import {
  PostulanteConDocumentos,
  DocumentoEstudiante,
  DocumentoTipo,
  DocumentoEstado,
} from "@/types/documento";
import { cn } from "@/lib/utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

const TIPO_LABEL: Record<DocumentoTipo, string> = {
  DNI: "DNI / Documento de Identidad",
  CERTIFICADO: "Certificado de Estudios Secundarios",
  CARTA_COMPROMISO: "Carta de Compromiso",
};

const TIPO_COLOR: Record<DocumentoTipo, string> = {
  DNI: "bg-blue-50 text-blue-800 border-blue-200",
  CERTIFICADO: "bg-violet-50 text-violet-800 border-violet-200",
  CARTA_COMPROMISO: "bg-amber-50 text-amber-800 border-amber-200",
};

const ESTADO_CONFIG: Record<
  DocumentoEstado,
  { label: string; icon: React.ElementType; classes: string }
> = {
  EN_REVISION: {
    label: "En Revisión",
    icon: Clock,
    classes: "bg-amber-50 text-amber-700 border-amber-200",
  },
  APROBADO: {
    label: "Aprobado",
    icon: CheckCircle2,
    classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  OBSERVADO: {
    label: "Observado",
    icon: AlertCircle,
    classes: "bg-red-50 text-red-700 border-red-200",
  },
};

function EstadoBadge({ estado }: { estado: DocumentoEstado }) {
  const cfg = ESTADO_CONFIG[estado];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
        cfg.classes
      )}
    >
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

// ─── Componente principal: tabla de documentos ───────────────────────────────

interface DocumentosTableProps {
  postulantes: PostulanteConDocumentos[];
  isLoading: boolean;
  onRefresh: () => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  page?: number;
  onPageChange?: (page: number) => void;
}

export function DocumentosTable({
  postulantes,
  isLoading,
  onRefresh,
  pageSize = 10,
  onPageSizeChange,
  page: controlledPage,
  onPageChange,
}: DocumentosTableProps) {
  const { toast } = useToast();

  const [internalPage, setInternalPage] = useState(1);
  const isControlled =
    typeof controlledPage === "number" && typeof onPageChange === "function";
  const currentPage = isControlled ? controlledPage : internalPage;

  const totalItems = postulantes.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (isControlled) {
        onPageChange(newPage);
      } else {
        setInternalPage(newPage);
      }
    },
    [isControlled, onPageChange]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      handlePageChange(1);
    }
  }, [currentPage, totalPages, handlePageChange]);

  const paginatedPostulantes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return postulantes.slice(start, start + pageSize);
  }, [postulantes, currentPage, pageSize]);

  // ── Modal de revisión ──
  const [selected, setSelected] = useState<PostulanteConDocumentos | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Estado de acciones en progreso ──
  const [processingId, setProcessingId] = useState<string | null>(null);

  // ── Modal de observación (motivo) ──
  const [observarDoc, setObservarDoc] = useState<DocumentoEstudiante | null>(null);
  const [motivoInput, setMotivoInput] = useState("");
  const [isObservandoOpen, setIsObservandoOpen] = useState(false);

  const handleOpenRevision = (p: PostulanteConDocumentos) => {
    setSelected(p);
    setIsModalOpen(true);
  };

  const handleAprobar = async (doc: DocumentoEstudiante) => {
    try {
      setProcessingId(doc.id);
      await documentosService.aprobarDocumento(doc.id);
      toast({
        title: "Documento aprobado",
        description: `${TIPO_LABEL[doc.tipo]} marcado como APROBADO.`,
        type: "success",
      });
      onRefresh();
      // Actualizar el estado local del modal sin cerrar
      if (selected) {
        setSelected((prev) =>
          prev
            ? {
                ...prev,
                documentos: prev.documentos.map((d) =>
                  d.id === doc.id
                    ? { ...d, estado: "APROBADO", fechaRevision: new Date().toISOString() }
                    : d
                ),
              }
            : null
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al aprobar el documento";
      toast({ title: "Error al aprobar", description: msg, type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenObservar = (doc: DocumentoEstudiante) => {
    setObservarDoc(doc);
    setMotivoInput("");
    setIsObservandoOpen(true);
  };

  const handleConfirmObservar = async () => {
    if (!observarDoc || !motivoInput.trim()) return;
    try {
      setProcessingId(observarDoc.id);
      await documentosService.observarDocumento(observarDoc.id, {
        motivo: motivoInput.trim(),
      });
      toast({
        title: "Documento observado",
        description: `${TIPO_LABEL[observarDoc.tipo]} marcado con observación.`,
        type: "warning",
      });
      onRefresh();
      if (selected) {
        setSelected((prev) =>
          prev
            ? {
                ...prev,
                documentos: prev.documentos.map((d) =>
                  d.id === observarDoc.id
                    ? {
                        ...d,
                        estado: "OBSERVADO",
                        motivoObservacion: motivoInput.trim(),
                        fechaRevision: new Date().toISOString(),
                      }
                    : d
                ),
              }
            : null
        );
      }
      setIsObservandoOpen(false);
      setObservarDoc(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al observar el documento";
      toast({ title: "Error al observar", description: msg, type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Tabla principal ─────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-4 w-4 text-violet-600" />
            <span className="font-semibold text-sm text-slate-800">
              Expedientes de Postulantes
            </span>
            <span className="text-xs text-slate-500">
              ({postulantes.length} postulantes con documentos)
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="border-b border-slate-200 bg-slate-100/80 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Postulante</th>
                <th className="py-3 px-4">DNI</th>
                <th className="py-3 px-4">Carrera</th>
                <th className="py-3 px-4">Paso</th>
                <th className="py-3 px-4">Docs Cargados</th>
                <th className="py-3 px-4 text-center">Estado Global</th>
                <th className="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="py-4 px-4">
                          <div className="h-3 w-24 bg-slate-200 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))
                : postulantes.length === 0
                ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-16 text-center text-slate-400"
                    >
                      <FileCheck2 className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600 text-sm">
                        No hay documentos cargados aún
                      </p>
                      <p className="text-xs">
                        Los postulantes que suban sus archivos aparecerán aquí.
                      </p>
                    </td>
                  </tr>
                )
                : paginatedPostulantes.map((p) => {
                    const totalDocs = p.documentos.length;
                    const aprobados = p.documentos.filter(
                      (d) => d.estado === "APROBADO"
                    ).length;
                    const observados = p.documentos.filter(
                      (d) => d.estado === "OBSERVADO"
                    ).length;

                    const globalEstado: DocumentoEstado =
                      observados > 0
                        ? "OBSERVADO"
                        : aprobados === totalDocs && totalDocs > 0
                        ? "APROBADO"
                        : "EN_REVISION";

                    return (
                      <tr
                        key={p.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {p.nombres} {p.apellidos}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            {p.dni}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {p.carreraCodigo}
                            </span>
                            <span
                              className="text-[11px] text-slate-600 truncate max-w-[140px]"
                              title={p.carreraNombre ?? ""}
                            >
                              {p.carreraNombre}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200">
                            {p.pasoActualMatricula ?? 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {p.documentos.map((d) => (
                              <span
                                key={d.id}
                                className={cn(
                                  "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border",
                                  TIPO_COLOR[d.tipo]
                                )}
                              >
                                <FileText className="h-2.5 w-2.5" />
                                {d.tipo === "DNI"
                                  ? "DNI"
                                  : d.tipo === "CERTIFICADO"
                                  ? "CERT"
                                  : "CARTA"}
                              </span>
                            ))}
                            {totalDocs === 0 && (
                              <span className="text-slate-400 italic text-[10px]">
                                Sin archivos
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <EstadoBadge estado={globalEstado} />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenRevision(p)}
                            className="text-violet-700 border-violet-200 hover:bg-violet-50 font-semibold text-xs h-7"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            Revisar
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        currentCount={paginatedPostulantes.length}
        entityName="documentos"
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPageSizeChange={onPageSizeChange ?? (() => {})}
        pageSizeMode="input"
      />

      {/* ── Modal de revisión por estudiante ─────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelected(null);
        }}
        title="Revisión de Documentos"
        description={
          selected
            ? `${selected.nombres} ${selected.apellidos} — DNI ${selected.dni}`
            : ""
        }
        maxWidth="2xl"
      >
        {selected && (
          <div className="space-y-4">
            {/* Info cabecera */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="h-10 w-10 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-violet-700" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 text-sm">
                  {selected.nombres} {selected.apellidos}
                </div>
                <div className="text-xs text-slate-500">
                  DNI: {selected.dni} · {selected.carreraCodigo} —{" "}
                  {selected.carreraNombre}
                </div>
              </div>
            </div>

            {/* Lista de documentos */}
            {selected.documentos.length === 0 ? (
              <p className="text-center py-8 text-slate-400 text-sm">
                Este postulante aún no ha cargado documentos.
              </p>
            ) : (
              <div className="space-y-3">
                {selected.documentos.map((doc) => {
                  const isProcesando = processingId === doc.id;
                  return (
                    <div
                      key={doc.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all"
                    >
                      {/* Info del documento */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 border",
                            TIPO_COLOR[doc.tipo]
                          )}
                        >
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 text-sm">
                            {TIPO_LABEL[doc.tipo]}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {doc.nombreOriginal ?? "Archivo sin nombre"}
                            {doc.tamanoBytes
                              ? ` · ${(doc.tamanoBytes / 1024 / 1024).toFixed(2)} MB`
                              : ""}
                          </div>
                          <div className="mt-1">
                            <EstadoBadge estado={doc.estado} />
                          </div>
                          {doc.estado === "OBSERVADO" &&
                            doc.motivoObservacion && (
                              <p className="mt-1 text-xs text-red-600 italic">
                                Motivo: {doc.motivoObservacion}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Ver archivo */}
                        <a
                          href={doc.archivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver
                        </a>

                        {/* Aprobar */}
                        <Button
                          size="sm"
                          onClick={() => handleAprobar(doc)}
                          disabled={isProcesando || doc.estado === "APROBADO"}
                          isLoading={isProcesando}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-8 disabled:opacity-50"
                        >
                          {!isProcesando && (
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          Aprobar
                        </Button>

                        {/* Observar */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenObservar(doc)}
                          disabled={isProcesando || doc.estado === "OBSERVADO"}
                          className="text-red-700 border-red-200 hover:bg-red-50 font-semibold text-xs h-8 disabled:opacity-50"
                        >
                          <AlertCircle className="h-3.5 w-3.5 mr-1" />
                          Observar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ── Modal: motivo de observación ────────────────────────────────── */}
      <Modal
        isOpen={isObservandoOpen}
        onClose={() => {
          setIsObservandoOpen(false);
          setObservarDoc(null);
        }}
        title="Observar Documento"
        description={
          observarDoc
            ? `Ingresa el motivo de observación para: ${TIPO_LABEL[observarDoc.tipo]}`
            : ""
        }
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsObservandoOpen(false);
                setObservarDoc(null);
              }}
              className="text-slate-700 border-slate-200"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmObservar}
              disabled={!motivoInput.trim() || processingId !== null}
              isLoading={processingId !== null}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              <AlertCircle className="h-4 w-4 mr-1.5" />
              Confirmar Observación
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            Motivo de observación{" "}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            value={motivoInput}
            onChange={(e) => setMotivoInput(e.target.value)}
            placeholder="Ej: El documento está ilegible, falta la firma del director, el nombre no coincide con el DNI..."
            rows={4}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400 resize-none"
          />
          <p className="text-xs text-slate-500">
            Este motivo será visible para el postulante en la app móvil.
          </p>
        </div>
      </Modal>
    </div>
  );
}
