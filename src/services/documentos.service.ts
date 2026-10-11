// ─── Servicio: Documentos de Admisión ────────────────────────────────────────
import { apiClient } from "@/lib/api-client";
import {
  PostulanteConDocumentos,
  ObservarDocumentoDto,
  DocumentoEstudiante,
} from "@/types/documento";

/**
 * Respuesta genérica de NestJS para operaciones sobre documentos.
 */
interface DocumentoResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const documentosService = {
  /**
   * GET /admin/documentos
   * Lista todos los postulantes con sus documentos asociados.
   */
  async getDocumentos(): Promise<PostulanteConDocumentos[]> {
    const res = await apiClient<
      | DocumentoResponse<PostulanteConDocumentos[]>
      | PostulanteConDocumentos[]
    >("/admin/documentos");

    if (Array.isArray(res)) return res;
    if (res && "data" in res && Array.isArray(res.data)) return res.data;
    return [];
  },

  /**
   * PATCH /admin/documentos/:documentoId/aprobar
   * Aprueba un documento específico.
   */
  async aprobarDocumento(documentoId: string): Promise<DocumentoEstudiante> {
    const res = await apiClient<DocumentoResponse<DocumentoEstudiante>>(
      `/admin/documentos/${documentoId}/aprobar`,
      { method: "PATCH" }
    );
    return res.data;
  },

  /**
   * PATCH /admin/documentos/:documentoId/observar
   * Marca un documento como observado con un motivo.
   */
  async observarDocumento(
    documentoId: string,
    dto: ObservarDocumentoDto
  ): Promise<DocumentoEstudiante> {
    const res = await apiClient<DocumentoResponse<DocumentoEstudiante>>(
      `/admin/documentos/${documentoId}/observar`,
      {
        method: "PATCH",
        body: JSON.stringify(dto),
      }
    );
    return res.data;
  },
};
