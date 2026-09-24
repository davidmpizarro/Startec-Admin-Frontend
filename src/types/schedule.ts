export type DayOfWeek =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO";

export interface CourseSession {
  id: string;
  dia: DayOfWeek;
  cursoCodigo: string;
  cursoNombre: string;
  horaInicio: string; // "08:00"
  horaFin: string; // "10:30"
  aula: string; // "Lab 302"
  docente: string; // "Ing. Carlos Mendoza"
  colorTag: string;
  modalidad: "Laboratorio" | "Teoría" | "Taller";
  vacantesOcupadas: number;
  vacantesTotales: number;
}

export interface SectionDetails {
  codigo: string; // "1A"
  carreraCodigo: string; // "C11"
  carreraNombre: string; // "Diseño y Desarrollo de Software"
  semestre: string; // "2027-I"
  turno: "Mañana" | "Tarde" | "Noche";
  tutor: string;
  aulaPrincipal: string;
  totalEstudiantes: number;
  capacidadMaxima: number;
  sesiones: CourseSession[];
}

export interface CreateSessionDto {
  dia: DayOfWeek;
  cursoNombre: string;
  cursoCodigo?: string;
  horaInicio: string;
  horaFin: string;
  aula: string;
  docente: string;
  modalidad: "Laboratorio" | "Teoría" | "Taller";
}

export interface UpdateSessionDto extends Partial<CreateSessionDto> {
  id: string;
}
