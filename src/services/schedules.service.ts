import { apiClient } from "@/lib/api-client";
import {
  CourseSession,
  CreateSessionDto,
  SectionDetails,
  UpdateSessionDto,
} from "@/types/schedule";

let IN_MEMORY_SECTION_1A: SectionDetails = {
  codigo: "1A",
  carreraCodigo: "C11",
  carreraNombre: "Diseño y Desarrollo de Software",
  semestre: "2027-I",
  turno: "Mañana",
  tutor: "Ing. Carlos Mendoza (Coordinador Académico)",
  aulaPrincipal: "Laboratorio Especializado 304 - Pabellón C",
  totalEstudiantes: 28,
  capacidadMaxima: 32,
  sesiones: [
    {
      id: "ses-101",
      dia: "LUNES",
      cursoCodigo: "C11-101",
      cursoNombre: "Algoritmos y Estructura de Datos",
      horaInicio: "08:00",
      horaFin: "10:30",
      aula: "Lab 304",
      docente: "Ing. Marco Silva",
      colorTag: "bg-blue-50 border-blue-200 text-blue-800",
      modalidad: "Laboratorio",
      vacantesOcupadas: 28,
      vacantesTotales: 32,
    },
    {
      id: "ses-102",
      dia: "MARTES",
      cursoCodigo: "C11-102",
      cursoNombre: "Base de Datos Relacionales",
      horaInicio: "08:00",
      horaFin: "11:15",
      aula: "Lab 302",
      docente: "Mg. Diana Salazar",
      colorTag: "bg-emerald-50 border-emerald-200 text-emerald-800",
      modalidad: "Laboratorio",
      vacantesOcupadas: 28,
      vacantesTotales: 32,
    },
    {
      id: "ses-103",
      dia: "MIERCOLES",
      cursoCodigo: "C11-103",
      cursoNombre: "Desarrollo Web Front-End (Next.js)",
      horaInicio: "10:45",
      horaFin: "13:15",
      aula: "Lab 301",
      docente: "Ing. Carlos Mendoza",
      colorTag: "bg-purple-50 border-purple-200 text-purple-800",
      modalidad: "Laboratorio",
      vacantesOcupadas: 28,
      vacantesTotales: 32,
    },
    {
      id: "ses-104",
      dia: "JUEVES",
      cursoCodigo: "C11-104",
      cursoNombre: "Arquitectura y Sistemas Operativos",
      horaInicio: "08:00",
      horaFin: "10:30",
      aula: "Aula C-201",
      docente: "Ing. Jorge Ramos",
      colorTag: "bg-amber-50 border-amber-200 text-amber-800",
      modalidad: "Teoría",
      vacantesOcupadas: 28,
      vacantesTotales: 32,
    },
    {
      id: "ses-105",
      dia: "VIERNES",
      cursoCodigo: "C11-105",
      cursoNombre: "Taller de Programación Orientada a Objetos",
      horaInicio: "09:00",
      horaFin: "12:15",
      aula: "Lab 305",
      docente: "Ing. Patricia Morales",
      colorTag: "bg-rose-50 border-rose-200 text-rose-800",
      modalidad: "Taller",
      vacantesOcupadas: 28,
      vacantesTotales: 32,
    },
  ],
};

export const schedulesService = {
  async getSection1ADetails(): Promise<SectionDetails> {
    try {
      return await apiClient<SectionDetails>("/secciones/1A/sesiones");
    } catch {
      return { ...IN_MEMORY_SECTION_1A };
    }
  },

  async createSession(dto: CreateSessionDto): Promise<CourseSession> {
    try {
      return await apiClient<CourseSession>("/secciones/1A/sesiones", {
        method: "POST",
        body: JSON.stringify(dto),
      });
    } catch {
      const newSession: CourseSession = {
        id: `ses-${Date.now().toString().slice(-4)}`,
        dia: dto.dia,
        cursoCodigo: dto.cursoCodigo || `C11-${Math.floor(100 + Math.random() * 900)}`,
        cursoNombre: dto.cursoNombre,
        horaInicio: dto.horaInicio,
        horaFin: dto.horaFin,
        aula: dto.aula,
        docente: dto.docente,
        modalidad: dto.modalidad,
        colorTag: "bg-indigo-50 border-indigo-200 text-indigo-800",
        vacantesOcupadas: IN_MEMORY_SECTION_1A.totalEstudiantes,
        vacantesTotales: IN_MEMORY_SECTION_1A.capacidadMaxima,
      };

      IN_MEMORY_SECTION_1A.sesiones.push(newSession);
      return newSession;
    }
  },

  async updateSession(dto: UpdateSessionDto): Promise<CourseSession> {
    try {
      return await apiClient<CourseSession>(`/secciones/1A/sesiones/${dto.id}`, {
        method: "PUT",
        body: JSON.stringify(dto),
      });
    } catch {
      const idx = IN_MEMORY_SECTION_1A.sesiones.findIndex((s) => s.id === dto.id);
      if (idx !== -1) {
        IN_MEMORY_SECTION_1A.sesiones[idx] = {
          ...IN_MEMORY_SECTION_1A.sesiones[idx],
          ...(dto.dia && { dia: dto.dia }),
          ...(dto.cursoNombre && { cursoNombre: dto.cursoNombre }),
          ...(dto.horaInicio && { horaInicio: dto.horaInicio }),
          ...(dto.horaFin && { horaFin: dto.horaFin }),
          ...(dto.aula && { aula: dto.aula }),
          ...(dto.docente && { docente: dto.docente }),
          ...(dto.modalidad && { modalidad: dto.modalidad }),
        };
        return IN_MEMORY_SECTION_1A.sesiones[idx];
      }
      throw new Error("Sesión no encontrada");
    }
  },

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      await apiClient<{ success: boolean }>(`/secciones/1A/sesiones/${sessionId}`, {
        method: "DELETE",
      });
      return true;
    } catch {
      IN_MEMORY_SECTION_1A.sesiones = IN_MEMORY_SECTION_1A.sesiones.filter(
        (s) => s.id !== sessionId
      );
      return true;
    }
  },
};
