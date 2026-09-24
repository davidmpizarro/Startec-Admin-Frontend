"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Student,
  StudentStatus,
  UpdateStudentDto,
  CARRERAS_TECSUP,
} from "@/types/student";
import { Save, UserCheck } from "lucide-react";
import { studentsService } from "@/services/students.service";
import { useToast } from "@/components/ui/toast";

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onSuccess: () => void;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: EditStudentModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<UpdateStudentDto>({
    nombres: "",
    apellidos: "",
    email: "",
    telefono: "",
    carreraCodigo: "C24",
    seccion: "1A",
    estado: "PRE_ADMITIDO",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        nombres: student.nombres || "",
        apellidos: student.apellidos || "",
        email: student.email || "",
        telefono: student.telefono || "",
        carreraCodigo: student.carreraCodigo || "C24",
        seccion: student.seccion || "1A",
        estado: student.estado || "PRE_ADMITIDO",
      });
      setErrors({});
    }
  }, [student, isOpen]);

  if (!student) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombres?.trim()) {
      newErrors.nombres = "El nombre es obligatorio";
    }
    if (!formData.apellidos?.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsLoading(true);
      await studentsService.updateStudent(student.id, formData);
      toast({
        title: "Estudiante actualizado con éxito",
        description: `Los datos de ${formData.nombres} ${formData.apellidos} han sido guardados correctamente.`,
        type: "success",
      });
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al actualizar el estudiante";
      toast({
        title: "Error al actualizar",
        description: msg,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Expediente de Estudiante"
      description={`Modificar información de admisión y matrícula para el DNI ${student.dni}.`}
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
            <Save className="mr-2 h-4 w-4" />
            Guardar Cambios
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* DNI (Solo lectura) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            DNI (Identificador Único - No modificable)
          </label>
          <Input value={student.dni} disabled className="bg-slate-50 font-mono" />
        </div>

        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombres *
            </label>
            <Input
              value={formData.nombres}
              onChange={(e) =>
                setFormData({ ...formData, nombres: e.target.value })
              }
              error={errors.nombres}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apellidos *
            </label>
            <Input
              value={formData.apellidos}
              onChange={(e) =>
                setFormData({ ...formData, apellidos: e.target.value })
              }
              error={errors.apellidos}
            />
          </div>
        </div>

        {/* Carrera y Sección */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Carrera Tecsup
            </label>
            <Select
              value={formData.carreraCodigo}
              onChange={(e) =>
                setFormData({ ...formData, carreraCodigo: e.target.value })
              }
            >
              {CARRERAS_TECSUP.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.codigo} - {c.nombre}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Sección Asignada
            </label>
            <Select
              value={formData.seccion}
              onChange={(e) =>
                setFormData({ ...formData, seccion: e.target.value })
              }
            >
              <option value="1A">Sección 1A (Turno Mañana)</option>
              <option value="1B">Sección 1B (Turno Tarde)</option>
            </Select>
          </div>
        </div>

        {/* Estado y Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado de Matrícula
            </label>
            <Select
              value={formData.estado}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estado: e.target.value as StudentStatus,
                })
              }
            >
              <option value="PRE_ADMITIDO">Pre-admitido</option>
              <option value="ADMITIDO">Admitido</option>
              <option value="MATRICULADO">Matriculado</option>
              <option value="PAGO_PENDIENTE">Pago Pendiente</option>
              <option value="OBSERVADO">Observado</option>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teléfono Celular
            </label>
            <Input
              value={formData.telefono}
              maxLength={9}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
            />
          </div>
        </div>

        {/* Correo institucional */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Correo Institucional
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
      </form>
    </Modal>
  );
}
