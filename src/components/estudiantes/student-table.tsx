"use client";

import React from "react";
import { Student } from "@/types/student";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  KeyRound,
  Fingerprint,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  XCircle,
  CalendarCheck,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react";
import { StudentActionType } from "./action-dialog";

interface StudentTableProps {
  students: Student[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onActionClick: (student: Student, action: StudentActionType) => void;
  onEditClick?: (student: Student) => void;
  onDeleteClick?: (student: Student) => void;
}

export function StudentTable({
  students,
  total,
  page,
  totalPages,
  isLoading,
  onPageChange,
  onActionClick,
  onEditClick,
  onDeleteClick,
}: StudentTableProps) {
  const getStatusBadge = (status: Student["estado"]) => {
    const badgeStyle =
      "inline-flex items-center whitespace-nowrap px-3 py-1 text-xs font-semibold";
    switch (status) {
      case "MATRICULADO":
        return (
          <Badge variant="success" className={badgeStyle}>
            Matriculado
          </Badge>
        );
      case "ADMITIDO":
        return (
          <Badge variant="default" className={badgeStyle}>
            Admitido
          </Badge>
        );
      case "PRE_ADMITIDO":
        return (
          <Badge variant="info" className={badgeStyle}>
            Pre-admitido
          </Badge>
        );
      case "PAGO_PENDIENTE":
        return (
          <Badge variant="warning" className={badgeStyle}>
            Pago Pendiente
          </Badge>
        );
      case "OBSERVADO":
        return (
          <Badge variant="destructive" className={badgeStyle}>
            Observado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className={badgeStyle}>
            {status}
          </Badge>
        );
    }
  };

  const getBiometricBadge = (biometria: Student["biometria"]) => {
    switch (biometria) {
      case "COMPLETADA":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Validada
          </span>
        );
      case "PENDIENTE":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-amber-600">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Pendiente
          </span>
        );
      case "FALLIDA":
        return (
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium text-red-600">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            Observada
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left border-collapse">
          <TableHeader>
            <TableRow>
              <TableHead className="w-24 whitespace-nowrap px-2.5 py-2.5 text-xs">DNI</TableHead>
              <TableHead className="whitespace-nowrap px-2.5 py-2.5 text-xs">Estudiante</TableHead>
              <TableHead className="whitespace-nowrap px-2.5 py-2.5 text-xs">Carrera / Sección</TableHead>
              <TableHead className="whitespace-nowrap px-2.5 py-2.5 text-xs">Hito de Matrícula</TableHead>
              <TableHead className="whitespace-nowrap px-2.5 py-2.5 text-xs">Estado Admisión</TableHead>
              <TableHead className="whitespace-nowrap px-2.5 py-2.5 text-xs">Biometría</TableHead>
              <TableHead className="whitespace-nowrap px-2.5 py-2.5 text-xs">Horario Asignado</TableHead>
              <TableHead className="whitespace-nowrap w-44 px-2.5 py-2.5 text-right text-xs">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <span>Cargando padrón de estudiantes...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-slate-500">
                  No se encontraron estudiantes con los criterios seleccionados.
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => (
                <TableRow key={student.id}>
                  {/* DNI */}
                  <TableCell className="font-mono font-semibold text-slate-900 whitespace-nowrap px-2.5 py-2.5 text-xs md:text-sm">
                    {student.dni}
                  </TableCell>

                  {/* Student info & Email */}
                  <TableCell className="whitespace-nowrap px-2.5 py-2.5">
                    <div className="flex flex-col space-y-0.5">
                      <span className="font-semibold text-slate-900 whitespace-nowrap text-xs md:text-sm">
                        {student.apellidos}, {student.nombres}
                      </span>
                      <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
                        {student.correoPersonal || student.email}
                      </span>
                      {student.correoInstitucional ? (
                        <span className="text-[11px] text-blue-700 font-mono flex items-center gap-1 whitespace-nowrap">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 inline-block shrink-0" />
                          {student.correoInstitucional}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded w-fit whitespace-nowrap">
                          Institucional: Pendiente
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Career & Section (Vertical Hierarchy) */}
                  <TableCell className="whitespace-nowrap px-2.5 py-2.5">
                    <div className="flex flex-col gap-1.5 items-start">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap shrink-0">
                          {student.carreraCodigo}
                        </span>
                        <span
                          className="text-xs text-slate-800 font-medium truncate max-w-[200px]"
                          title={student.carreraNombre}
                        >
                          {student.carreraNombre}
                        </span>
                      </div>

                      {student.seccion &&
                      student.seccion !== "Por Asignar" &&
                      student.seccion !== "PENDIENTE" ? (
                        <span className="inline-flex items-center font-bold text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                          Sección {student.seccion}
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 whitespace-nowrap">
                          Por Asignar
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Step in Funnel */}
                  <TableCell className="whitespace-nowrap px-2.5 py-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-800 shadow-2xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-sky-600 inline-block shrink-0" />
                      Paso {student.pasoActualMatricula ?? 1} / 8
                    </span>
                  </TableCell>

                  {/* Admission Status */}
                  <TableCell className="whitespace-nowrap px-2.5 py-2.5">
                    {getStatusBadge(student.estado)}
                  </TableCell>

                  {/* Biometric Status */}
                  <TableCell className="whitespace-nowrap px-2.5 py-2.5">
                    {getBiometricBadge(student.biometria)}
                  </TableCell>

                  {/* Schedule (Fase 1: Bloqueado / Fase 2: Asignado) */}
                  <TableCell className="whitespace-nowrap px-2.5 py-2.5">
                    {student.horarioAsignado ? (
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                        <CalendarCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        {student.horarioCodigo || `Secc. ${student.seccion}`}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1 text-xs font-medium text-amber-800 bg-amber-50 rounded-full border border-amber-200">
                        <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        Pendiente de Matrícula
                      </span>
                    )}
                  </TableCell>

                  {/* Row Actions - Ordered: Clave, Biometría, Liberar, Editar, Eliminar */}
                  <TableCell className="whitespace-nowrap w-44 px-2.5 py-2.5 text-right">
                    <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
                      {/* 1° Clave */}
                      <button
                        type="button"
                        title="Cambiar clave"
                        onClick={() => onActionClick(student, "reset-password")}
                        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-300 transition-colors shadow-2xs cursor-pointer"
                      >
                        <KeyRound className="h-4 w-4 text-amber-600" />
                      </button>

                      {/* 2° Biometría */}
                      <button
                        type="button"
                        title="Biometría"
                        onClick={() => onActionClick(student, "reset-biometrics")}
                        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-sky-700 hover:bg-sky-50 hover:border-sky-300 transition-colors shadow-2xs cursor-pointer"
                      >
                        <Fingerprint className="h-4 w-4 text-sky-600" />
                      </button>

                      {/* 3° Liberar Horario */}
                      <button
                        type="button"
                        title="Liberar horario"
                        disabled={!student.horarioAsignado}
                        onClick={() => onActionClick(student, "release-schedule")}
                        className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 disabled:opacity-30 disabled:pointer-events-none transition-colors shadow-2xs cursor-pointer"
                      >
                        <CalendarCheck className="h-4 w-4 text-emerald-600" />
                      </button>

                      {/* 4° Editar */}
                      {onEditClick && (
                        <button
                          type="button"
                          title="Editar expediente"
                          onClick={() => onEditClick(student)}
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </button>
                      )}

                      {/* 5° Eliminar */}
                      {onDeleteClick && (
                        <button
                          type="button"
                          title="Eliminar estudiante"
                          onClick={() => onDeleteClick(student)}
                          className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors shadow-2xs cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2">
        <p className="text-xs text-slate-500">
          Mostrando <span className="font-semibold text-slate-800">{students.length}</span> de{" "}
          <span className="font-semibold text-slate-800">{total}</span> estudiantes registrados
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="h-8 px-2.5"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          <span className="text-xs font-semibold text-slate-700 px-2">
            Página {page} de {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="h-8 px-2.5"
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
