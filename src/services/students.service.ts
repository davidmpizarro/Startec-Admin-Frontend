import { apiClient } from "@/lib/api-client";
import { PaginatedResult } from "@/types/api";
import {
  ImportEstudianteDto,
  ImportStudentsResult,
  PreAdmitStudentDto,
  Student,
  StudentActionResult,
  StudentFilters,
  StudentStatus,
  UpdateStudentDto,
  getCarreraNombre,
} from "@/types/student";

interface PrismaEstudianteRaw {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  correoInstitucional?: string | null;
  correoPersonal?: string | null;
  telefono?: string | null;
  estadoMatricula: string;
  biometriaRegistrada: boolean;
  horarioLiberado: boolean;
  pasoActualMatricula?: number;
  createdAt?: string;
  carrera?: {
    id: string;
    codigo: string;
    nombre: string;
    sede?: string;
  } | null;
  seccion?: {
    id: string;
    codigoSeccion: string;
    ciclo?: number;
    periodo?: string;
    aulaBase?: string | null;
  } | null;
}

function mapPrismaEstudiante(raw: PrismaEstudianteRaw): Student {
  let estado: StudentStatus = "PRE_ADMITIDO";
  if (raw.estadoMatricula === "MATRICULADO_CONFIRMADO") {
    estado = "MATRICULADO";
  } else if (raw.estadoMatricula === "PAGADO_PENDIENTE_HORARIO") {
    estado = "PAGO_PENDIENTE";
  } else if (raw.estadoMatricula === "EN_PROCESO") {
    estado = "ADMITIDO";
  } else {
    estado = "PRE_ADMITIDO";
  }

  // Carrera y Sección respetando estrictamente el código oficial
  const carreraCodigo = (raw.carrera?.codigo || "C24").trim();
  const carreraNombre =
    getCarreraNombre(carreraCodigo) ||
    raw.carrera?.nombre ||
    "Diseño y Desarrollo de Software";

  const seccionCodigo = raw.seccion?.codigoSeccion || "Por Asignar";

  // En Fase 1 el horario está bloqueado (horarioLiberado = false)
  const horarioAsignado = Boolean(raw.horarioLiberado);

  return {
    id: raw.id,
    dni: raw.dni,
    nombres: raw.nombres,
    apellidos: raw.apellidos,
    correoPersonal: raw.correoPersonal || null,
    correoInstitucional: raw.correoInstitucional || null,
    email: raw.correoPersonal || raw.correoInstitucional || `${raw.dni}@tecsup.edu.pe`,
    telefono: raw.telefono || "987654321",
    carreraCodigo,
    carreraNombre,
    seccion: seccionCodigo,
    estado,
    estadoMatricula: raw.estadoMatricula,
    biometria: raw.biometriaRegistrada ? "COMPLETADA" : "PENDIENTE",
    horarioAsignado,
    horarioCodigo: raw.horarioLiberado && raw.seccion ? `HOR-${carreraCodigo}-${seccionCodigo}` : undefined,
    fechaRegistro: raw.createdAt || new Date().toISOString(),
    periodoIngreso: raw.seccion?.periodo || "2027-I",
    pasoActualMatricula: raw.pasoActualMatricula ?? 1,
  };
}

export const studentsService = {
  async getStudents(filters: StudentFilters = {}): Promise<PaginatedResult<Student>> {
    const {
      search = "",
      carrera = "",
      estado = "ALL",
      pasoActualMatricula,
      modoPaso = "alcanzaron",
      page = 1,
      limit = 10,
    } = filters;

    try {
      // 1. Consumir el endpoint real de NestJS: GET http://localhost:3000/estudiantes
      const response = await apiClient<
        { success: boolean; data: PrismaEstudianteRaw[] } | PrismaEstudianteRaw[]
      >("/estudiantes");

      let rawList: PrismaEstudianteRaw[] = [];
      if (Array.isArray(response)) {
        rawList = response;
      } else if (response && Array.isArray(response.data)) {
        rawList = response.data;
      }

      // 2. Mapear datos reales de PostgreSQL devueltos por Prisma
      let mappedStudents = rawList.map(mapPrismaEstudiante);

      if (mappedStudents.length > 0) {
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          mappedStudents = mappedStudents.filter(
            (s) =>
              s.dni.includes(q) ||
              s.nombres.toLowerCase().includes(q) ||
              s.apellidos.toLowerCase().includes(q) ||
              `${s.nombres} ${s.apellidos}`.toLowerCase().includes(q) ||
              s.email.toLowerCase().includes(q) ||
              (s.correoPersonal && s.correoPersonal.toLowerCase().includes(q))
          );
        }

        if (carrera && carrera !== "ALL") {
          mappedStudents = mappedStudents.filter((s) => s.carreraCodigo === carrera);
        }

        if (estado && estado !== "ALL") {
          mappedStudents = mappedStudents.filter((s) => s.estado === estado);
        }

        let stepStats:
          | { alcanzaron: number; rezagados: number; totalPadron: number }
          | undefined = undefined;

        if (pasoActualMatricula !== undefined && pasoActualMatricula !== "ALL") {
          const targetStep = Number(pasoActualMatricula);
          const totalBase = mappedStudents.length;

          // 1. Condición estricta para quienes alcanzaron o superaron el hito
          const alcanzaronCount = mappedStudents.filter(
            (s) => (s.pasoActualMatricula ?? 1) >= targetStep
          ).length;

          // 2. Condición estricta para rezagados / pendientes de alcanzar el hito
          const rezagadosCount = mappedStudents.filter(
            (s) => (s.pasoActualMatricula ?? 1) < targetStep
          ).length;

          stepStats = {
            alcanzaron: alcanzaronCount,
            rezagados: rezagadosCount,
            totalPadron: totalBase,
          };

          if (modoPaso === "rezagados") {
            mappedStudents = mappedStudents.filter(
              (s) => (s.pasoActualMatricula ?? 1) < targetStep
            );
          } else {
            // Por defecto: correspondencia directa 1:1 con el embudo
            mappedStudents = mappedStudents.filter(
              (s) => (s.pasoActualMatricula ?? 1) >= targetStep
            );
          }
        }

        const total = mappedStudents.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const items = mappedStudents.slice(startIndex, startIndex + limit);

        return {
          items,
          total,
          page,
          limit,
          totalPages,
          stepStats,
        };
      }

      return {
        items: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
      };
    } catch (error) {
      console.error("[studentsService.getStudents] Fallo de conexión o red con NestJS (/estudiantes):", error);
      // Retorna lista vacía en lugar de datos falsos simulados para evitar enmascarar errores de red
      return {
        items: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
      };
    }
  },

  async preAdmitStudent(dto: PreAdmitStudentDto): Promise<Student> {
    const carreraCodigo = (dto.carreraCodigo || "C24").trim();
    const carreraNombre = dto.carreraNombre || getCarreraNombre(carreraCodigo);

    const payload = {
      dni: dto.dni.trim(),
      nombres: dto.nombres.trim(),
      apellidos: dto.apellidos.trim(),
      correoPersonal: (dto.correoPersonal || dto.email)?.trim() || null,
      telefono: dto.telefono?.trim() || null,
      carreraCodigo,
      carreraNombre,
      seccionCodigo:
        dto.seccion && dto.seccion !== "PENDIENTE" && dto.seccion !== "Por Asignar"
          ? dto.seccion
          : null,
    };

    const res = await apiClient<
      | { success: boolean; data: PrismaEstudianteRaw; message?: string }
      | PrismaEstudianteRaw
    >("/estudiantes/pre-admitir", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const rawStudent =
      res && "data" in res && res.data ? res.data : (res as PrismaEstudianteRaw);
    return mapPrismaEstudiante(rawStudent);
  },

  async updateStudent(id: string, dto: UpdateStudentDto): Promise<Student> {
    const payload: Record<string, any> = {};
    if (dto.nombres !== undefined) payload.nombres = dto.nombres.trim();
    if (dto.apellidos !== undefined) payload.apellidos = dto.apellidos.trim();
    if (dto.email !== undefined || dto.correoPersonal !== undefined)
      payload.correoPersonal = (dto.correoPersonal || dto.email)?.trim();
    if (dto.correoInstitucional !== undefined)
      payload.correoInstitucional = dto.correoInstitucional?.trim();
    if (dto.telefono !== undefined) payload.telefono = dto.telefono.trim();
    if (dto.carreraCodigo !== undefined) payload.carreraCodigo = dto.carreraCodigo;
    if (dto.seccion !== undefined || dto.seccionCodigo !== undefined)
      payload.seccionCodigo = dto.seccion || dto.seccionCodigo;
    if (dto.estado !== undefined) {
      if (dto.estado === "MATRICULADO") payload.estadoMatricula = "MATRICULADO_CONFIRMADO";
      else if (dto.estado === "PAGO_PENDIENTE") payload.estadoMatricula = "PAGADO_PENDIENTE_HORARIO";
      else if (dto.estado === "ADMITIDO") payload.estadoMatricula = "EN_PROCESO";
      else payload.estadoMatricula = "NO_INICIADO";
    }

    const res = await apiClient<
      | { success: boolean; data: PrismaEstudianteRaw; message?: string }
      | PrismaEstudianteRaw
    >(`/estudiantes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    const rawStudent =
      res && "data" in res && res.data ? res.data : (res as PrismaEstudianteRaw);
    return mapPrismaEstudiante(rawStudent);
  },

  async deleteStudent(id: string): Promise<boolean> {
    await apiClient<{ success: boolean; message: string }>(`/estudiantes/${id}`, {
      method: "DELETE",
    });
    return true;
  },

  async formalizarMatricula(studentId: string): Promise<Student> {
    const res = await apiClient<
      | { success: boolean; data: PrismaEstudianteRaw; message?: string }
      | PrismaEstudianteRaw
    >(`/estudiantes/${studentId}/formalizar-matricula`, {
      method: "POST",
    });
    const rawStudent =
      res && "data" in res && res.data ? res.data : (res as PrismaEstudianteRaw);
    return mapPrismaEstudiante(rawStudent);
  },

  async resetPassword(studentId: string): Promise<StudentActionResult> {
    return await apiClient<StudentActionResult>(
      `/estudiantes/${studentId}/reset-password`,
      { method: "POST" }
    );
  },

  async resetBiometrics(studentId: string): Promise<StudentActionResult> {
    return await apiClient<StudentActionResult>(
      `/estudiantes/${studentId}/reset-biometrics`,
      { method: "POST" }
    );
  },

  async releaseSchedule(studentId: string): Promise<StudentActionResult> {
    return await apiClient<StudentActionResult>(
      `/estudiantes/${studentId}/release-schedule`,
      { method: "POST" }
    );
  },

  async importStudentsCsv(
    estudiantes: ImportEstudianteDto[]
  ): Promise<ImportStudentsResult> {
    return await apiClient<ImportStudentsResult>("/estudiantes/importar-csv", {
      method: "POST",
      body: JSON.stringify({ estudiantes }),
    });
  },
};
