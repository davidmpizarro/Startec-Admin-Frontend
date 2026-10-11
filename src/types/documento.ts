// ─── Tipos: Módulo de Documentos de Admisión ────────────────────────────────

export type DocumentoTipo = "DNI" | "CERTIFICADO" | "CARTA_COMPROMISO";

export type DocumentoEstado = "EN_REVISION" | "APROBADO" | "OBSERVADO";

export interface DocumentoEstudiante {
  id: string;
  estudianteId: string;
  tipo: DocumentoTipo;
  archivoUrl: string;
  nombreOriginal?: string | null;
  tamanoBytes?: number | null;
  estado: DocumentoEstado;
  motivoObservacion?: string | null;
  fechaSubida?: string | null;
  fechaRevision?: string | null;
}

/** Shape de la respuesta GET /admin/documentos */
export interface PostulanteConDocumentos {
  id: string;
  dni: string;
  nombres: string;
  apellidos: string;
  carreraNombre?: string | null;
  carreraCodigo?: string | null;
  pasoActualMatricula?: number;
  documentos: DocumentoEstudiante[];
}

/** DTO para observar un documento */
export interface ObservarDocumentoDto {
  motivo: string;
}

/** Resumen estadístico del panel de documentos */
export interface DocumentosResumen {
  totalPostulantes: number;
  totalDocumentos: number;
  aprobados: number;
  enRevision: number;
  observados: number;
}
