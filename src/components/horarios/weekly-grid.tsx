"use client";

import React, { useState } from "react";
import { CourseSession, DayOfWeek, SectionDetails } from "@/types/schedule";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  Pencil,
  Trash2,
  Users,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklyGridProps {
  section: SectionDetails;
  onNewSession: () => void;
  onEditSession: (session: CourseSession) => void;
  onDeleteSession: (sessionId: string) => Promise<void>;
}

const DAYS_OF_WEEK: { key: DayOfWeek; label: string; short: string }[] = [
  { key: "LUNES", label: "Lunes", short: "LUN" },
  { key: "MARTES", label: "Martes", short: "MAR" },
  { key: "MIERCOLES", label: "Miércoles", short: "MIE" },
  { key: "JUEVES", label: "Jueves", short: "JUE" },
  { key: "VIERNES", label: "Viernes", short: "VIE" },
];

export function WeeklyGrid({
  section,
  onNewSession,
  onEditSession,
  onDeleteSession,
}: WeeklyGridProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar esta sesión de clase de la sección 1A?")) {
      try {
        setDeletingId(id);
        await onDeleteSession(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getSessionsForDay = (day: DayOfWeek) => {
    return section.sesiones.filter((s) => s.dia === day);
  };

  const occupancyPercent = Math.round(
    (section.totalEstudiantes / section.capacidadMaxima) * 100
  );

  return (
    <div className="space-y-6">
      {/* Section 1A Header Card */}
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50/50 via-white to-sky-50/40 shadow-xs">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-blue-700 text-white font-bold">
                  Sección {section.codigo}
                </Badge>
                <Badge variant="outline" className="border-blue-300 text-blue-800 bg-white">
                  {section.carreraCodigo} - {section.carreraNombre}
                </Badge>
                <Badge variant="secondary">{section.semestre}</Badge>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                Horario Semanal: Sección 1A (Turno {section.turno})
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-2">
                <span>{section.tutor}</span> • <span>{section.aulaPrincipal}</span>
              </p>
            </div>

            {/* Stats & Add Button */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs min-w-[140px]">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                    Ocupación
                  </span>
                  <span className="font-bold text-slate-900">{occupancyPercent}%</span>
                </div>
                <div className="text-sm font-bold text-slate-800">
                  {section.totalEstudiantes} / {section.capacidadMaxima} matriculados
                </div>
                <div className="mt-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${occupancyPercent}%` }}
                  />
                </div>
              </div>

              <Button
                onClick={onNewSession}
                className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Nueva Sesión
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Visual Columns (Lunes a Viernes) */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            Programación de 5 Sesiones Semanales (Lunes a Viernes)
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Total asignadas: {section.sesiones.length} sesiones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {DAYS_OF_WEEK.map((day) => {
            const daySessions = getSessionsForDay(day.key);

            return (
              <div
                key={day.key}
                className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/50 p-3"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2 mb-3">
                  <span className="font-bold text-sm text-slate-900">
                    {day.label}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {daySessions.length} {daySessions.length === 1 ? "sesión" : "sesiones"}
                  </Badge>
                </div>

                {/* Day Sessions List */}
                <div className="space-y-3 flex-1">
                  {daySessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 rounded-lg border border-dashed border-slate-200 bg-white/60 p-4 text-center">
                      <Clock className="h-6 w-6 text-slate-300 mb-1" />
                      <span className="text-xs text-slate-400">Sin sesiones programadas</span>
                    </div>
                  ) : (
                    daySessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "group relative flex flex-col rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-md bg-white",
                          session.colorTag
                        )}
                      >
                        {/* Course & Modality */}
                        <div className="flex items-start justify-between gap-1 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {session.cursoCodigo}
                          </span>
                          <span className="text-[10px] font-semibold bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700">
                            {session.modalidad}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-2">
                          {session.cursoNombre}
                        </h4>

                        {/* Details */}
                        <div className="mt-2.5 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                            <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>
                              {session.horaInicio} - {session.horaFin}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{session.aula}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{session.docente}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-200/60 pt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-600 hover:text-blue-700 hover:bg-blue-100/50"
                            onClick={() => onEditSession(session)}
                            title="Editar sesión"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={deletingId === session.id}
                            className="h-7 w-7 p-0 text-slate-600 hover:text-red-700 hover:bg-red-100/50"
                            onClick={() => handleDelete(session.id)}
                            title="Eliminar sesión"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Sessions Overview Table */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-blue-600" />
            Catálogo de Cursos Asignados a la Sección 1A (5 Sesiones)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Resumen consolidado para los docentes y Secretaría Académica de Tecsup
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100">
            {section.sesiones.map((session, index) => (
              <div
                key={session.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 font-bold text-xs text-blue-700">
                    0{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {session.cursoNombre}
                      </span>
                      <span className="font-mono text-xs text-slate-400">
                        ({session.cursoCodigo})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Docente: <strong className="text-slate-700">{session.docente}</strong> • {session.modalidad}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-semibold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {session.dia} {session.horaInicio} - {session.horaFin}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {session.aula}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditSession(session)}
                      className="h-8 text-xs"
                    >
                      <Pencil className="h-3 w-3 mr-1" /> Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
