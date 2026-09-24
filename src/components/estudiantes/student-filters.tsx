import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  StudentFilters as IStudentFilters,
  StudentStatus,
  CARRERAS_TECSUP,
} from "@/types/student";

interface StudentFiltersProps {
  filters: IStudentFilters;
  onFilterChange: (newFilters: Partial<IStudentFilters>) => void;
  onReset: () => void;
}

export function StudentFilters({
  filters,
  onFilterChange,
  onReset,
}: StudentFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-3 items-center justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
        {/* Search by DNI or Name */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por DNI (8 dígitos), nombres o apellidos..."
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            className="pl-9 bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-blue-500"
          />
        </div>

        {/* Filter by Carrera */}
        <div className="w-full sm:w-64">
          <Select
            value={filters.carrera || "ALL"}
            onChange={(e) => onFilterChange({ carrera: e.target.value, page: 1 })}
            className="bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
          >
            <option value="ALL">Todas las Carreras</option>
            {CARRERAS_TECSUP.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.codigo} - {c.nombre}
              </option>
            ))}
          </Select>
        </div>

        {/* Filter by Estado */}
        <div className="w-full sm:w-56">
          <Select
            value={filters.estado || "ALL"}
            onChange={(e) =>
              onFilterChange({
                estado: e.target.value as StudentStatus | "ALL",
                page: 1,
              })
            }
            className="bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="PRE_ADMITIDO">Pre-admitido</option>
            <option value="ADMITIDO">Admitido</option>
            <option value="MATRICULADO">Matriculado</option>
            <option value="PAGO_PENDIENTE">Pago Pendiente</option>
            <option value="OBSERVADO">Observado</option>
          </Select>
        </div>

        {/* Filter by Paso del Embudo */}
        <div className="w-full sm:w-52">
          <Select
            value={filters.pasoActualMatricula ? String(filters.pasoActualMatricula) : "ALL"}
            onChange={(e) =>
              onFilterChange({
                pasoActualMatricula: e.target.value === "ALL" ? undefined : Number(e.target.value),
                modoPaso: "alcanzaron",
                page: 1,
              })
            }
            className="bg-white border-slate-300 text-slate-900 focus:ring-blue-500"
          >
            <option value="ALL">Todos los Hitos (1-8)</option>
            <option value="1">Hito 1: Bienvenida</option>
            <option value="2">Hito 2: Perfil de Postulante</option>
            <option value="3">Hito 3: Expediente Digital</option>
            <option value="4">Hito 4: Pago de Matrícula</option>
            <option value="5">Hito 5: Pasarela de Pagos</option>
            <option value="6">Hito 6: Confirmación de Vacante</option>
            <option value="7">Hito 7: Conoce tu Carrera</option>
            <option value="8">Hito 8: Campus y Matrícula</option>
          </Select>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="default"
        onClick={onReset}
        title="Restablecer filtros"
        className="w-full md:w-auto text-slate-700 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 shrink-0 shadow-2xs"
      >
        <RotateCcw className="mr-1.5 h-4 w-4 text-slate-500" />
        Limpiar
      </Button>
    </div>
  );
}
