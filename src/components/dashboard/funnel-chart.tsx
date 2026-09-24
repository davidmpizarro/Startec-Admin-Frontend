"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FunnelStep } from "@/types/metrics";
import { ArrowDown, AlertTriangle, CheckCircle2, Clock, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

interface FunnelChartProps {
  steps: FunnelStep[];
  periodName: string;
}

interface StepStatus {
  label: string;
  variant: "success" | "info" | "warning" | "neutral";
  badgeClass: string;
  icon?: React.ReactNode;
}

function getStepStatus(
  cantidad: number,
  porcentaje: number,
  pasoIndex: number
): StepStatus {
  // Si no hay postulantes en este paso aún
  if (cantidad === 0) {
    return {
      label: "En Espera",
      variant: "neutral",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      icon: <Hourglass className="h-3 w-3 shrink-0 text-slate-500" />,
    };
  }

  // Paso inicial o tasa óptima
  if (pasoIndex === 0 || porcentaje >= 75) {
    return {
      label: "Conforme",
      variant: "success",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />,
    };
  }

  // Tráfico activo regular
  if (porcentaje >= 40) {
    return {
      label: "En Progreso",
      variant: "info",
      badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
      icon: <Clock className="h-3 w-3 shrink-0 text-sky-600" />,
    };
  }

  // Requiere atención de admisión
  return {
    label: "En Seguimiento",
    variant: "warning",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    icon: <AlertTriangle className="h-3 w-3 shrink-0 text-amber-600" />,
  };
}

const STEP_ROADMAP: Record<number, { title: string; subtitle: string }> = {
  1: {
    title: "Paso 1: Inicia tu experiencia Tecsup",
    subtitle: "Bienvenida y acceso al sistema institucional",
  },
  2: {
    title: "Paso 2: Actualiza tu perfil",
    subtitle: "Validación de datos personales y de contacto",
  },
  3: {
    title: "Paso 3: Carga tus documentos",
    subtitle: "Expediente digital y certificados de admisión",
  },
  4: {
    title: "Paso 4: Pago de Matrícula",
    subtitle: "Liquidación y selección de modalidad de pago",
  },
  5: {
    title: "Paso 5: Pasarela de pagos",
    subtitle: "Transacción financiera y procesamiento en pasarela",
  },
  6: {
    title: "Paso 6: Confirmación de matrícula",
    subtitle: "Generación de constancia y conformidad de vacante",
  },
  7: {
    title: "Paso 7: Conoce tu carrera",
    subtitle: "Malla curricular, plan de estudios y asignación académica",
  },
  8: {
    title: "Paso 8: Conquista el campus",
    subtitle: "Activación de credenciales institucionales e inducción presencial",
  },
};

export function FunnelChart({ steps, periodName }: FunnelChartProps) {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const router = useRouter();

  const initialCount = steps[0]?.count > 0 ? steps[0].count : 1;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex flex-row items-center justify-between pb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Flujo del Proceso de Matrícula
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Seguimiento de la tasa de conversión en cada hito del proceso de matrícula
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-block h-2 w-2 rounded-full bg-[#0284C7]" />
          Volumen activo
        </div>
      </div>

      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const percentageOfTotal = ((step.count / initialCount) * 100).toFixed(1);
          const isSelected = selectedStep === step.stepNumber;
          const stepStatus = getStepStatus(step.count, Number(percentageOfTotal), idx);

          const roadmap = STEP_ROADMAP[step.stepNumber];
          const displayTitle = step.titulo || step.name || roadmap?.title || `Paso ${step.stepNumber}`;
          const displaySubtitle = step.subtitulo || step.tag || step.shortName || roadmap?.subtitle || "";

          return (
            <div
              key={step.stepNumber}
              onClick={() => {
                setSelectedStep(step.stepNumber);
                router.push(`/estudiantes?pasoActualMatricula=${step.stepNumber}`);
              }}
              className={cn(
                "group relative cursor-pointer rounded-lg border p-4 transition-all duration-150 hover:bg-slate-50/80 hover:shadow-sm",
                isSelected
                  ? "border-[#0284C7]/50 bg-sky-50/40 shadow-xs"
                  : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 group-hover:bg-[#0D1627] group-hover:text-white transition-colors">
                    {step.stepNumber}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#0284C7] transition-colors">
                      {displayTitle}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {displaySubtitle} • Paso {step.stepNumber} de 8
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors",
                      stepStatus.badgeClass
                    )}
                  >
                    {stepStatus.icon}
                    {stepStatus.label}
                  </span>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      {step.count.toLocaleString("es-PE")}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">postulantes</span>
                    <div className="text-[11px] text-slate-400">
                      {percentageOfTotal}% del total inicial
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Bar Indicator */}
              <div className="mt-3 relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-500",
                    stepStatus.variant === "warning"
                      ? "bg-amber-500"
                      : stepStatus.variant === "neutral"
                      ? "bg-slate-300"
                      : "bg-[#0284C7]"
                  )}
                  style={{
                    width:
                      step.count === 0
                        ? "0%"
                        : `${Math.max(4, (step.count / initialCount) * 100)}%`,
                  }}
                />
              </div>

              {/* Conversion details row */}
              {idx > 0 && (
                <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center gap-1 text-slate-600">
                    <ArrowDown className="h-3 w-3 text-slate-400" />
                    <span>
                      Conversión desde paso anterior:{" "}
                      <strong className="text-slate-800 font-semibold">
                        {step.conversionFromPrevious}%
                      </strong>
                    </span>
                  </div>

                  {step.dropoffRate > 0 && (
                    <span
                      className={cn(
                        "font-medium",
                        step.dropoffRate > 15 ? "text-amber-700" : "text-slate-500"
                      )}
                    >
                      Pendientes: {step.dropoffRate}%
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Funnel Summary Footer */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 text-xs text-slate-700 border border-slate-200">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>
            <strong className="text-slate-900 font-semibold">Eficiencia Global del Embudo:</strong>{" "}
            {((steps[steps.length - 1]?.count / initialCount) * 100).toFixed(1)}% de postulantes iniciales finalizan matrícula con cuenta institucional activa.
          </span>
        </div>
        <div className="text-slate-500">
          Fuente: Base de Datos PostgreSQL de Admisión Tecsup
        </div>
      </div>
    </div>
  );
}
