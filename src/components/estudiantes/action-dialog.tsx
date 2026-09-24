"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/student";
import { KeyRound, Fingerprint, CalendarX, AlertTriangle } from "lucide-react";

export type StudentActionType = "reset-password" | "reset-biometrics" | "release-schedule";

interface ActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  actionType: StudentActionType | null;
  onConfirm: (student: Student, actionType: StudentActionType) => Promise<void>;
}

export function ActionDialog({
  isOpen,
  onClose,
  student,
  actionType,
  onConfirm,
}: ActionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!student || !actionType) return null;

  const getActionConfig = () => {
    switch (actionType) {
      case "reset-password":
        return {
          title: "Resetear Contraseña",
          description: `¿Confirmas el restablecimiento de la contraseña para ${student.nombres} ${student.apellidos}?`,
          icon: <KeyRound className="h-6 w-6 text-amber-600" />,
          buttonVariant: "default" as const,
          buttonText: "Generar Nueva Contraseña",
          buttonColor: "bg-amber-600 hover:bg-amber-700",
          warning:
            "Se generará una contraseña temporal aleatoria y se revocará la sesión activa del alumno en el portal de autoservicio.",
        };
      case "reset-biometrics":
        return {
          title: "Resetear Validación Biométrica",
          description: `¿Deseas reiniciar el enrolamiento biométrico de ${student.nombres} ${student.apellidos}?`,
          icon: <Fingerprint className="h-6 w-6 text-sky-600" />,
          buttonVariant: "default" as const,
          buttonText: "Reiniciar Biometría",
          buttonColor: "bg-sky-600 hover:bg-sky-700",
          warning:
            "El estado de biometría volverá a 'PENDIENTE'. El postulante deberá presentarse en los tótems del Campus Santa Anita para re-escanear huellas y rostro.",
        };
      case "release-schedule":
        return {
          title: "Liberar Horario y Sección",
          description: `¿Liberar vacante de la sección ${student.seccion} para ${student.nombres} ${student.apellidos}?`,
          icon: <CalendarX className="h-6 w-6 text-red-600" />,
          buttonVariant: "destructive" as const,
          buttonText: "Liberar Vacante",
          buttonColor: "bg-red-600 hover:bg-red-700",
          warning:
            `La vacante en la sección ${student.seccion} (Carrera ${student.carreraCodigo}) quedará disponible inmediatamente para otro estudiante en lista de espera.`,
        };
    }
  };

  const config = getActionConfig();

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm(student, actionType);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={config.title}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            className={config.buttonColor}
            onClick={handleConfirm}
            isLoading={isLoading}
          >
            {config.buttonText}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
          {config.icon}
        </div>
        <div className="space-y-3">
          <p className="text-sm text-slate-700 font-medium">
            {config.description}
          </p>

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-200">
            <div>
              <span className="font-semibold text-slate-700">DNI:</span> {student.dni}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Carrera:</span> {student.carreraCodigo} - {student.carreraNombre}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Sección actual:</span> {student.seccion}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{config.warning}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
