"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { WeeklyGrid } from "@/components/horarios/weekly-grid";
import { SessionModal } from "@/components/horarios/session-modal";
import { schedulesService } from "@/services/schedules.service";
import {
  CourseSession,
  CreateSessionDto,
  SectionDetails,
} from "@/types/schedule";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { RefreshCw, Layers } from "lucide-react";

export default function HorariosPage() {
  const [section, setSection] = useState<SectionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<CourseSession | null>(null);

  const { toast } = useToast();

  const loadSection = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await schedulesService.getSection1ADetails();
      setSection(data);
    } catch {
      toast({
        title: "Error de carga",
        description: "No se pudo recuperar la programación de la Sección 1A.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSection();
  }, [loadSection]);

  const handleOpenCreateModal = () => {
    setSessionToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (session: CourseSession) => {
    setSessionToEdit(session);
    setIsModalOpen(true);
  };

  const handleSaveSession = async (dto: CreateSessionDto, id?: string) => {
    try {
      if (id) {
        await schedulesService.updateSession({ ...dto, id });
        toast({
          title: "Sesión actualizada",
          description: `El curso ${dto.cursoNombre} (${dto.dia}) fue modificado exitosamente.`,
          type: "success",
        });
      } else {
        await schedulesService.createSession(dto);
        toast({
          title: "Nueva sesión programada",
          description: `Sesión de ${dto.cursoNombre} asignada al día ${dto.dia} (${dto.horaInicio} - ${dto.horaFin}).`,
          type: "success",
        });
      }
      loadSection();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al guardar sesión";
      toast({
        title: "Error al guardar",
        description: msg,
        type: "error",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await schedulesService.deleteSession(sessionId);
      toast({
        title: "Sesión eliminada",
        description: "El bloque horario ha sido retirado de la Sección 1A.",
        type: "info",
      });
      loadSection();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar";
      toast({
        title: "Error al eliminar sesión",
        description: msg,
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <div className="w-full max-w-[1700px] mx-auto px-6 py-8 space-y-6">
        {/* Navigation & Section quick info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Gestión de Secciones y Horarios Semanales
            </h2>
            <p className="text-xs text-slate-600 font-normal">
              Configura las 5 sesiones presenciales y de laboratorio para los estudiantes admitidos.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs text-slate-700 font-medium">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Campus Santa Anita • Pabellón C</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadSection}
              className="text-slate-700"
              title="Refrescar horario"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Weekly Grid Content */}
        {isLoading || !section ? (
          <div className="h-96 rounded-xl border border-slate-200 bg-white p-6 animate-pulse flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <span>Cargando programación semanal de la sección 1A...</span>
            </div>
          </div>
        ) : (
          <WeeklyGrid
            section={section}
            onNewSession={handleOpenCreateModal}
            onEditSession={handleOpenEditModal}
            onDeleteSession={handleDeleteSession}
          />
        )}
      </div>

      {/* Modal Form to Create or Edit */}
      <SessionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSessionToEdit(null);
        }}
        sessionToEdit={sessionToEdit}
        onSave={handleSaveSession}
      />
    </div>
  );
}
