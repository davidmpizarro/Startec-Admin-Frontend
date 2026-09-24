"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CourseSession, CreateSessionDto, DayOfWeek } from "@/types/schedule";
import { CalendarPlus, Save } from "lucide-react";

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionToEdit?: CourseSession | null;
  onSave: (data: CreateSessionDto, id?: string) => Promise<void>;
}

export function SessionModal({
  isOpen,
  onClose,
  sessionToEdit,
  onSave,
}: SessionModalProps) {
  const [formData, setFormData] = useState<CreateSessionDto>({
    dia: "LUNES",
    cursoNombre: "",
    cursoCodigo: "",
    horaInicio: "08:00",
    horaFin: "10:30",
    aula: "Lab 304",
    docente: "",
    modalidad: "Laboratorio",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionToEdit) {
      setFormData({
        dia: sessionToEdit.dia,
        cursoNombre: sessionToEdit.cursoNombre,
        cursoCodigo: sessionToEdit.cursoCodigo,
        horaInicio: sessionToEdit.horaInicio,
        horaFin: sessionToEdit.horaFin,
        aula: sessionToEdit.aula,
        docente: sessionToEdit.docente,
        modalidad: sessionToEdit.modalidad,
      });
    } else {
      setFormData({
        dia: "LUNES",
        cursoNombre: "",
        cursoCodigo: "C11-101",
        horaInicio: "08:00",
        horaFin: "10:30",
        aula: "Lab 304",
        docente: "",
        modalidad: "Laboratorio",
      });
    }
    setErrors({});
  }, [sessionToEdit, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.cursoNombre.trim()) {
      newErrors.cursoNombre = "El nombre del curso es obligatorio";
    }
    if (!formData.docente.trim()) {
      newErrors.docente = "El docente asignado es obligatorio";
    }
    if (!formData.aula.trim()) {
      newErrors.aula = "El aula o laboratorio es obligatorio";
    }
    if (!formData.horaInicio || !formData.horaFin) {
      newErrors.horario = "Debe especificar horario de inicio y fin";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await onSave(formData, sessionToEdit ? sessionToEdit.id : undefined);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={sessionToEdit ? "Editar Sesión Semanal" : "Crear Nueva Sesión de Horario"}
      description={`Configuración de sesión académica para la Sección 1A (C11 - Turno Mañana).`}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {sessionToEdit ? (
              <>
                <Save className="mr-2 h-4 w-4" /> Guardar Cambios
              </>
            ) : (
              <>
                <CalendarPlus className="mr-2 h-4 w-4" /> Asignar Sesión
              </>
            )}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Día y Modalidad */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Día de la Semana *
            </label>
            <Select
              value={formData.dia}
              onChange={(e) =>
                setFormData({ ...formData, dia: e.target.value as DayOfWeek })
              }
            >
              <option value="LUNES">Lunes</option>
              <option value="MARTES">Martes</option>
              <option value="MIERCOLES">Miércoles</option>
              <option value="JUEVES">Jueves</option>
              <option value="VIERNES">Viernes</option>
              <option value="SABADO">Sábado</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Modalidad de Sesión
            </label>
            <Select
              value={formData.modalidad}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  modalidad: e.target.value as CreateSessionDto["modalidad"],
                })
              }
            >
              <option value="Laboratorio">Laboratorio Especializado</option>
              <option value="Teoría">Clase Teórica</option>
              <option value="Taller">Taller Aplicado</option>
            </Select>
          </div>
        </div>

        {/* Curso y Código */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la Asignatura / Curso *
            </label>
            <Input
              placeholder="Ej: Desarrollo Web Front-End"
              value={formData.cursoNombre}
              onChange={(e) =>
                setFormData({ ...formData, cursoNombre: e.target.value })
              }
              error={errors.cursoNombre}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Código del Curso
            </label>
            <Input
              placeholder="Ej: C11-103"
              value={formData.cursoCodigo || ""}
              onChange={(e) =>
                setFormData({ ...formData, cursoCodigo: e.target.value })
              }
            />
          </div>
        </div>

        {/* Horarios (Inicio y Fin) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hora de Inicio *
            </label>
            <Input
              type="time"
              value={formData.horaInicio}
              onChange={(e) =>
                setFormData({ ...formData, horaInicio: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hora de Fin *
            </label>
            <Input
              type="time"
              value={formData.horaFin}
              onChange={(e) =>
                setFormData({ ...formData, horaFin: e.target.value })
              }
            />
          </div>
        </div>
        {errors.horario && (
          <p className="text-xs text-red-600">{errors.horario}</p>
        )}

        {/* Aula y Docente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Aula / Laboratorio *
            </label>
            <Input
              placeholder="Ej: Lab 304 - Pabellón C"
              value={formData.aula}
              onChange={(e) =>
                setFormData({ ...formData, aula: e.target.value })
              }
              error={errors.aula}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Docente Asignado *
            </label>
            <Input
              placeholder="Ej: Ing. Carlos Mendoza"
              value={formData.docente}
              onChange={(e) =>
                setFormData({ ...formData, docente: e.target.value })
              }
              error={errors.docente}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
