export type StudentStatus =
  | "PRE_ADMITIDO"
  | "ADMITIDO"
  | "MATRICULADO"
  | "PAGO_PENDIENTE"
  | "OBSERVADO";

export type BiometricStatus = "PENDIENTE" | "COMPLETADA" | "FALLIDA";

export interface Student {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  correoPersonal?: string | null;
  correoInstitucional?: string | null;
  email: string;
  telefono: string;
  carreraCodigo: string; // e.g., 'C24'
  carreraNombre: string; // e.g., 'Diseño y Desarrollo de Software'
  seccion: string; // e.g., '1A' o 'Por Asignar'
  estado: StudentStatus;
  estadoMatricula?: string;
  biometria: BiometricStatus;
  horarioAsignado: boolean;
  horarioCodigo?: string;
  fechaRegistro: string;
  periodoIngreso: string;
  pasoActualMatricula?: number;
}

export interface StudentFilters {
  search?: string;
  carrera?: string;
  estado?: StudentStatus | "ALL";
  pasoActualMatricula?: number | "ALL";
  modoPaso?: "alcanzaron" | "rezagados";
  page?: number;
  limit?: number;
}

export interface PreAdmitStudentDto {
  dni: string;
  nombres: string;
  apellidos: string;
  correoPersonal?: string;
  email?: string;
  telefono?: string;
  carreraCodigo: string;
  carreraNombre?: string;
  seccion?: string;
}

export interface UpdateStudentDto {
  nombres?: string;
  apellidos?: string;
  email?: string;
  correoPersonal?: string;
  correoInstitucional?: string;
  telefono?: string;
  carreraCodigo?: string;
  seccion?: string;
  seccionCodigo?: string;
  estado?: StudentStatus;
  biometria?: BiometricStatus;
}

export interface StudentActionResult {
  success: boolean;
  message: string;
  studentId: string;
  data?: {
    temporaryPassword?: string;
    biometricResetAt?: string;
    releasedSection?: string;
  };
}

export interface ImportEstudianteDto {
  dni: string;
  nombres: string;
  apellidos: string;
  correoPersonal?: string;
  telefono?: string;
  carreraCodigo?: string;
}

export interface ImportStudentsResult {
  totalRecibidos: number;
  insertados: number;
  omitidosPorDuplicado: number;
  fallidos: number;
  errores: Array<{ fila: number; motivo: string }>;
}

export interface CarreraTecsup {
  codigo: string;
  nombre: string;
}

export const CARRERAS_TECSUP: readonly CarreraTecsup[] = [
  { codigo: "C1", nombre: "Procesos Químicos y Metalúrgicos" },
  { codigo: "C5", nombre: "Electrónica y Automatización Industrial" },
  { codigo: "C11", nombre: "Operaciones Mineras" },
  { codigo: "C12", nombre: "Producción y Gestión Industrial" },
  { codigo: "C14", nombre: "Aviónica y Mecánica Aeronáutica" },
  { codigo: "C16", nombre: "Mecatrónica Industrial" },
  { codigo: "C20", nombre: "Administración de Redes y Comunicaciones" },
  { codigo: "C21", nombre: "Mantenimiento de Maquinaria Pesada" },
  { codigo: "C22", nombre: "Mantenimiento de Maquinaria de Planta" },
  { codigo: "C23", nombre: "Electricidad Industrial" },
  { codigo: "C24", nombre: "Diseño y Desarrollo de Software" },
  { codigo: "C25", nombre: "Diseño Industrial" },
  { codigo: "C26", nombre: "Diseño y Desarrollo de Videojuegos" },
  { codigo: "C28", nombre: "Big data y Ciencia de Datos" },
  { codigo: "D12", nombre: "Ciencia de Datos" },
  { codigo: "D13", nombre: "Logística Digital" },
  { codigo: "D14", nombre: "Modelado y Animación Digital" },
] as const;

export function getCarreraNombre(codigo: string): string {
  if (!codigo) return "Carrera no especificada";
  const found = CARRERAS_TECSUP.find(
    (c) => c.codigo.toUpperCase() === codigo.trim().toUpperCase()
  );
  return found ? found.nombre : codigo;
}

