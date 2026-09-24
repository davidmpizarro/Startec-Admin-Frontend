"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  PreAdmitStudentDto,
  CARRERAS_TECSUP,
  getCarreraNombre,
} from "@/types/student";
import { UserPlus, ShieldAlert } from "lucide-react";
import { studentsService } from "@/services/students.service";
import { useToast } from "@/components/ui/toast";

interface PreAdmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onSubmit?: (dto: PreAdmitStudentDto) => Promise<void>;
}

export function PreAdmitModal({
  isOpen,
  onClose,
  onSuccess,
  onSubmit,
}: PreAdmitModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PreAdmitStudentDto>({
    dni: "",
    nombres: "",
    apellidos: "",
    correoPersonal: "",
    email: "",
    telefono: "",
    carreraCodigo: "C24",
    seccion: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.dni.trim()) {
      newErrors.dni = "El DNI es obligatorio";
    } else if (!/^\d{8}$/.test(formData.dni.trim())) {
      newErrors.dni = "El DNI debe contener exactamente 8 dígitos numéricos";
    }

    if (!formData.nombres.trim()) {
      newErrors.nombres = "El nombre es obligatorio";
    }

    if (!formData.apellidos.trim()) {
      newErrors.apellidos = "Los apellidos son obligatorios";
    }

    const emailVal = (formData.correoPersonal || formData.email || "").trim();
    if (!emailVal) {
      newErrors.email = "El correo personal de contacto es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      newErrors.email = "Ingrese un correo válido (ej: usuario@gmail.com)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const personalEmail = (formData.correoPersonal || formData.email || "").trim();
      const carreraCodigo = (formData.carreraCodigo || "C24").trim();
      const carreraNombre = getCarreraNombre(carreraCodigo);

      const dataToSend: PreAdmitStudentDto = {
        ...formData,
        carreraCodigo,
        carreraNombre,
        email: personalEmail,
        correoPersonal: personalEmail,
      };

      if (onSubmit) {
        await onSubmit(dataToSend);
      } else {
        await studentsService.preAdmitStudent(dataToSend);
      }

      toast({
        title: "Estudiante pre-admitido con éxito (Fase 1)",
        description:
          "Registrado con correo personal y horario bloqueado. Puede ingresar a StarTec Móvil con su DNI.",
        type: "success",
      });

      // Reset form
      setFormData({
        dni: "",
        nombres: "",
        apellidos: "",
        correoPersonal: "",
        email: "",
        telefono: "",
        carreraCodigo: "C24",
        seccion: "",
      });

      onClose();

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Error al registrar el estudiante en el sistema";
      toast({
        title: "Error de registro",
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
      title="Pre-admitir Nuevo Estudiante (Fase 1)"
      description="Registrar a un postulante admitido preliminarmente. Su horario permanecerá bloqueado hasta formalizar su matrícula."
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="default"
            onClick={handleSubmit}
            isLoading={isLoading}
            className="bg-blue-600 hover:bg-blue-700 font-bold"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Registrar Pre-admisión
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* DNI */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            DNI (Documento Nacional de Identidad) *
          </label>
          <Input
            placeholder="Ej: 72849102"
            maxLength={8}
            value={formData.dni}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setFormData({ ...formData, dni: val });
              if (errors.dni) setErrors((prev) => ({ ...prev, dni: "" }));
            }}
            error={errors.dni}
          />
        </div>

        {/* Nombres y Apellidos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombres *
            </label>
            <Input
              placeholder="Ej: Alejandro Rodrigo"
              value={formData.nombres}
              onChange={(e) => {
                setFormData({ ...formData, nombres: e.target.value });
                if (errors.nombres) setErrors((prev) => ({ ...prev, nombres: "" }));
              }}
              error={errors.nombres}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Apellidos *
            </label>
            <Input
              placeholder="Ej: Gutiérrez Palacios"
              value={formData.apellidos}
              onChange={(e) => {
                setFormData({ ...formData, apellidos: e.target.value });
                if (errors.apellidos) setErrors((prev) => ({ ...prev, apellidos: "" }));
              }}
              error={errors.apellidos}
            />
          </div>
        </div>

        {/* Carrera y Sección */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Carrera Tecsup *
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
              <option value="">Pendiente / Por asignar en matrícula</option>
              <option value="1A">Sección 1A (Turno Mañana)</option>
              <option value="1B">Sección 1B (Turno Tarde)</option>
            </Select>
          </div>
        </div>

        {/* Email & Teléfono */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Correo Personal / Contacto *
            </label>
            <Input
              type="email"
              placeholder="ejemplo@gmail.com"
              value={formData.correoPersonal || formData.email}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  correoPersonal: e.target.value,
                  email: e.target.value,
                });
                if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
              }}
              error={errors.email}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Teléfono Celular
            </label>
            <Input
              placeholder="Ej: 987654321"
              maxLength={9}
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
            />
          </div>
        </div>

        {/* Notice Fase 1 */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50/70 p-3 text-xs text-blue-800 border border-blue-100">
          <ShieldAlert className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            <strong>Fase 1 (Pre-admisión):</strong> El estudiante queda registrado con su correo personal y horario bloqueado. Al formalizar su matrícula en la app móvil (Fase 2), se autogenerará su correo institucional @tecsup.edu.pe y se confirmará su sección.
          </span>
        </div>
      </form>
    </Modal>
  );
}
