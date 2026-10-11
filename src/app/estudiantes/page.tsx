"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { StudentFilters } from "@/components/estudiantes/student-filters";
import { StudentTable } from "@/components/estudiantes/student-table";
import { PreAdmitModal } from "@/components/estudiantes/pre-admit-modal";
import { EditStudentModal } from "@/components/estudiantes/edit-student-modal";
import { DeleteConfirmDialog } from "@/components/estudiantes/delete-confirm-dialog";
import { ImportCsvModal } from "@/components/estudiantes/import-csv-modal";
import {
  ActionDialog,
  StudentActionType,
} from "@/components/estudiantes/action-dialog";
import { studentsService } from "@/services/students.service";
import {
  PreAdmitStudentDto,
  Student,
  StudentFilters as IStudentFilters,
} from "@/types/student";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Download,
  RefreshCw,
  Upload,
  X,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const STEP_NAMES: Record<string | number, string> = {
  1: "Inicia tu experiencia Tecsup (Bienvenida)",
  2: "Actualiza tu perfil (Datos Personales)",
  3: "Carga tus documentos (Expediente Digital)",
  4: "Pago de Matrícula (Liquidación)",
  5: "Pasarela de pagos (Transacción Financiera)",
  6: "Confirmación de matrícula (Conformidad)",
  7: "Conoce tu carrera (Malla y Asignación)",
  8: "Conquista el campus (Activación e Inducción)",
};

function EstudiantesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pasoParam = searchParams.get("pasoActualMatricula");
  const modoParam = searchParams.get("modoPaso") as "alcanzaron" | "rezagados" | null;

  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [stepStats, setStepStats] = useState<{
    alcanzaron: number;
    rezagados: number;
    totalPadron: number;
  } | null>(null);

  const [filters, setFilters] = useState<IStudentFilters>({
    search: "",
    carrera: "ALL",
    estado: "ALL",
    pasoActualMatricula: pasoParam ? Number(pasoParam) : undefined,
    modoPaso: modoParam === "rezagados" ? "rezagados" : "alcanzaron",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    if (pasoParam) {
      const p = Number(pasoParam);
      const m = modoParam === "rezagados" ? "rezagados" : "alcanzaron";
      if (!isNaN(p)) {
        setFilters((prev) => {
          if (prev.pasoActualMatricula === p && prev.modoPaso === m) return prev;
          return { ...prev, pasoActualMatricula: p, modoPaso: m, page: 1 };
        });
      }
    } else {
      setFilters((prev) => {
        if (prev.pasoActualMatricula === undefined && prev.modoPaso === "alcanzaron") return prev;
        return { ...prev, pasoActualMatricula: undefined, modoPaso: "alcanzaron", page: 1 };
      });
    }
  }, [pasoParam, modoParam]);

  // Modals state
  const [isPreAdmitOpen, setIsPreAdmitOpen] = useState(false);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] =
    useState<Student | null>(null);
  const [activeActionType, setActiveActionType] =
    useState<StudentActionType | null>(null);
  const [selectedStudentForEdit, setSelectedStudentForEdit] =
    useState<Student | null>(null);
  const [selectedStudentForDelete, setSelectedStudentForDelete] =
    useState<Student | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { toast } = useToast();

  const loadStudents = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await studentsService.getStudents(filters);
      setStudents(res.items);
      setTotal(res.total);
      setPage(res.page);
      setTotalPages(res.totalPages);
      setStepStats(res.stepStats || null);
    } catch {
      toast({
        title: "Error al cargar estudiantes",
        description: "No se pudo conectar al endpoint de NestJS.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleFilterChange = (newFilters: Partial<IStudentFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSwitchModoPaso = (modo: "alcanzaron" | "rezagados") => {
    setFilters((prev) => ({ ...prev, modoPaso: modo, page: 1 }));
    if (filters.pasoActualMatricula) {
      router.push(`/estudiantes?pasoActualMatricula=${filters.pasoActualMatricula}&modoPaso=${modo}`);
    }
  };

  const handleClearStepFilter = () => {
    setFilters((prev) => ({
      ...prev,
      pasoActualMatricula: undefined,
      modoPaso: "alcanzaron",
      page: 1,
    }));
    setStepStats(null);
    router.push("/estudiantes");
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      carrera: "ALL",
      estado: "ALL",
      pasoActualMatricula: undefined,
      modoPaso: "alcanzaron",
      page: 1,
      limit: 10,
    });
    setStepStats(null);
    router.push("/estudiantes");
  };

  const handlePageSizeChange = (newLimit: number) => {
    setFilters((prev) => ({
      ...prev,
      limit: newLimit,
      page: 1,
    }));
  };

  const handleOpenAction = (student: Student, action: StudentActionType) => {
    setSelectedStudentForAction(student);
    setActiveActionType(action);
  };

  const handleConfirmAction = async (
    student: Student,
    actionType: StudentActionType
  ) => {
    try {
      if (actionType === "reset-password") {
        const res = await studentsService.resetPassword(student.id);
        toast({
          title: "Contraseña restablecida",
          description: res.message,
          type: "success",
        });
      } else if (actionType === "reset-biometrics") {
        const res = await studentsService.resetBiometrics(student.id);
        toast({
          title: "Biometría restablecida",
          description: res.message,
          type: "info",
        });
      } else if (actionType === "release-schedule") {
        const res = await studentsService.releaseSchedule(student.id);
        toast({
          title: "Horario liberado",
          description: res.message,
          type: "warning",
        });
      }
      loadStudents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al procesar acción";
      toast({
        title: "Error en la operación",
        description: msg,
        type: "error",
      });
    }
  };

  const handleConfirmDelete = async (student: Student) => {
    try {
      await studentsService.deleteStudent(student.id);
      toast({
        title: "Estudiante eliminado con éxito",
        description: `El expediente de ${student.nombres} ${student.apellidos} (DNI ${student.dni}) ha sido eliminado permanentemente.`,
        type: "success",
      });
      loadStudents();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al eliminar el estudiante";
      toast({
        title: "Error al eliminar",
        description: msg,
        type: "error",
      });
    }
  };

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const fullRes = await studentsService.getStudents({
        search: filters.search,
        carrera: filters.carrera,
        estado: filters.estado,
        pasoActualMatricula: filters.pasoActualMatricula,
        modoPaso: filters.modoPaso,
        page: 1,
        limit: 10000,
      });

      const allStudents = fullRes.items;
      if (allStudents.length === 0) {
        toast({
          title: "Sin registros para exportar",
          description: "No se encontraron estudiantes con los filtros actuales.",
          type: "warning",
        });
        return;
      }

      const headers =
        "DNI,Nombres,Apellidos,Correo Personal,Correo Institucional,Carrera,Sección,Estado Matrícula,Biometría,Horario Liberado";

      const escapeField = (val: string | null | undefined) => {
        const text = String(val ?? "").replace(/"/g, '""');
        return `"${text}"`;
      };

      const rows = allStudents
        .map((s) => {
          const dni = escapeField(s.dni);
          const nombres = escapeField(s.nombres);
          const apellidos = escapeField(s.apellidos);
          const correoPersonal = escapeField(s.correoPersonal || "");
          const correoInstitucional = escapeField(
            s.correoInstitucional || "Pendiente"
          );
          const carrera = escapeField(
            s.carreraNombre
              ? `${s.carreraCodigo} - ${s.carreraNombre}`
              : s.carreraCodigo
          );
          const seccion = escapeField(s.seccion || "Por Asignar");
          const estado = escapeField(s.estado);
          const biometria = escapeField(s.biometria);
          const horario = escapeField(
            s.horarioAsignado ? "HABILITADO" : "BLOQUEADO"
          );

          return `${dni},${nombres},${apellidos},${correoPersonal},${correoInstitucional},${carrera},${seccion},${estado},${biometria},${horario}`;
        })
        .join("\n");

      const BOM = "\uFEFF";
      const blob = new Blob([BOM + headers + "\n" + rows], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `padron-estudiantes-tecsup-${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Padrón exportado con éxito",
        description: `Se exportaron ${allStudents.length} expedientes completos con codificación UTF-8 compatible con Excel.`,
        type: "success",
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al exportar el archivo CSV";
      toast({
        title: "Error al exportar",
        description: msg,
        type: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <div className="w-full max-w-[1700px] mx-auto px-6 py-8 space-y-6">
        {/* Page Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Expedientes Académicos y Postulantes
            </h2>
            <p className="text-xs text-slate-600 font-normal">
              Gestiona el estado de ingreso, credenciales y asignaciones de vacante por sección.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportCsvOpen(true)}
              className="text-blue-700 border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 font-semibold shadow-2xs"
            >
              <Upload className="mr-1.5 h-4 w-4 text-blue-600" />
              Importar CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={isExporting}
              isLoading={isExporting}
              className="text-slate-700 border-slate-200 bg-white hover:bg-slate-50 font-medium shadow-2xs"
            >
              {!isExporting && <Download className="mr-1.5 h-4 w-4" />}
              {isExporting ? "Exportando..." : "Exportar CSV"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadStudents}
              className="text-slate-700 border-slate-200 bg-white hover:bg-slate-50 shadow-2xs"
              title="Refrescar lista"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => setIsPreAdmitOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Pre-admitir Estudiante
            </Button>
          </div>
        </div>

        {/* Active Step Filter Banner with Dual Selector */}
        {filters.pasoActualMatricula && (
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-xl border border-sky-200 bg-sky-50/95 p-4 text-xs text-sky-950 shadow-xs">
            <div className="flex items-start sm:items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0284C7] font-extrabold text-white text-xs shadow-xs">
                {filters.pasoActualMatricula}
              </span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">
                    Hito de Matrícula: Paso {filters.pasoActualMatricula}
                  </span>
                  <span className="text-slate-400 font-medium">—</span>
                  <span className="text-slate-700 font-medium">
                    {STEP_NAMES[String(filters.pasoActualMatricula)] || "Etapa institucional"}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  {filters.modoPaso === "rezagados" ? (
                    <>
                      Mostrando a los{" "}
                      <strong className="text-amber-800 font-semibold">
                        {stepStats ? stepStats.rezagados : 0} postulantes rezagados
                      </strong>{" "}
                      que aún no alcanzan este hito (&lt; Paso {filters.pasoActualMatricula}). Requieren seguimiento de admisión.
                    </>
                  ) : (
                    <>
                      Mostrando a los{" "}
                      <strong className="text-sky-800 font-semibold">
                        {stepStats ? stepStats.alcanzaron : 0} postulantes
                      </strong>{" "}
                      que alcanzaron o superaron este hito (≥ Paso {filters.pasoActualMatricula}). Coincide 1 a 1 con el Embudo.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Dual Tabs Selector & Clear Button */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white/90 p-1 shadow-2xs">
                {/* Tab: Alcanzaron el hito */}
                <button
                  type="button"
                  onClick={() => handleSwitchModoPaso("alcanzaron")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    (filters.modoPaso ?? "alcanzaron") === "alcanzaron"
                      ? "bg-[#0284C7] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Alcanzaron el hito</span>
                  <span
                    className={cn(
                      "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                      (filters.modoPaso ?? "alcanzaron") === "alcanzaron"
                        ? "bg-white/20 text-white"
                        : "bg-sky-100 text-sky-800"
                    )}
                  >
                    {stepStats ? stepStats.alcanzaron : "..."}
                  </span>
                </button>

                {/* Tab: Rezagados / Pendientes */}
                <button
                  type="button"
                  onClick={() => handleSwitchModoPaso("rezagados")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer",
                    filters.modoPaso === "rezagados"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-amber-800 hover:bg-amber-50/70"
                  )}
                >
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  <span>Rezagados / Pendientes</span>
                  <span
                    className={cn(
                      "ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold",
                      filters.modoPaso === "rezagados"
                        ? "bg-white/20 text-white"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {stepStats ? stepStats.rezagados : "..."}
                  </span>
                </button>
              </div>

              {/* Clear Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearStepFilter}
                className="border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-medium text-xs h-8 shrink-0 cursor-pointer shadow-2xs"
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Quitar filtro
              </Button>
            </div>
          </div>
        )}

        {/* Filters */}
        <StudentFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Paginated Table */}
        <StudentTable
          students={students}
          total={total}
          page={page}
          totalPages={totalPages}
          pageSize={filters.limit || 10}
          onPageSizeChange={handlePageSizeChange}
          isLoading={isLoading}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onActionClick={handleOpenAction}
          onEditClick={(student) => setSelectedStudentForEdit(student)}
          onDeleteClick={(student) => setSelectedStudentForDelete(student)}
        />
      </div>

      {/* Modal Pre-admitir */}
      <PreAdmitModal
        isOpen={isPreAdmitOpen}
        onClose={() => setIsPreAdmitOpen(false)}
        onSuccess={loadStudents}
      />

      {/* Modal Importar CSV Masivo */}
      <ImportCsvModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        onSuccess={loadStudents}
      />

      {/* Modal Editar Estudiante */}
      <EditStudentModal
        isOpen={Boolean(selectedStudentForEdit)}
        student={selectedStudentForEdit}
        onClose={() => setSelectedStudentForEdit(null)}
        onSuccess={loadStudents}
      />

      {/* Dialogo Confirmación Eliminar Estudiante */}
      <DeleteConfirmDialog
        isOpen={Boolean(selectedStudentForDelete)}
        student={selectedStudentForDelete}
        onClose={() => setSelectedStudentForDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Action Dialog (Reset Password, Reset Biometrics, Release Schedule) */}
      <ActionDialog
        isOpen={Boolean(selectedStudentForAction && activeActionType)}
        onClose={() => {
          setSelectedStudentForAction(null);
          setActiveActionType(null);
        }}
        student={selectedStudentForAction}
        actionType={activeActionType}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}

export default function EstudiantesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0284C7] border-t-transparent" />
            <span>Cargando padrón de estudiantes...</span>
          </div>
        </div>
      }
    >
      <EstudiantesContent />
    </Suspense>
  );
}
