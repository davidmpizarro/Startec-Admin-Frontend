"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Student } from "@/types/student";
import { Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onConfirm: (student: Student) => Promise<void>;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  student,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!student) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm(student);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Expediente de Estudiante"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            isLoading={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar Expediente
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div className="space-y-3">
          <p className="text-sm text-slate-800 font-semibold">
            ¿Estás seguro de eliminar el expediente del estudiante{" "}
            <span className="text-slate-900 underline">
              {student.nombres} {student.apellidos}
            </span>{" "}
            con DNI <span className="font-mono font-bold">{student.dni}</span>? Esta acción es irreversible.
          </p>

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1 border border-slate-200">
            <div>
              <span className="font-semibold text-slate-700">Carrera:</span>{" "}
              {student.carreraCodigo} - {student.carreraNombre}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Sección:</span>{" "}
              {student.seccion}
            </div>
            <div>
              <span className="font-semibold text-slate-700">Estado actual:</span>{" "}
              {student.estado}
            </div>
          </div>

          <p className="text-xs text-red-600 font-medium">
            Se eliminarán todos los registros asociados, historial de matrícula y pagos vinculados en la base de datos de PostgreSQL.
          </p>
        </div>
      </div>
    </Modal>
  );
}
