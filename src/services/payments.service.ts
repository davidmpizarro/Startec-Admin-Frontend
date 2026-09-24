import { apiClient } from "@/lib/api-client";
import { TesoreriaResponse, PagoCulqi } from "@/types/payment";

export const paymentsService = {
  async getTodosLosPagos(): Promise<TesoreriaResponse> {
    return apiClient<TesoreriaResponse>("/matricula/pagos/todos");
  },

  async registrarPagoManual(data: {
    estudianteId?: string;
    dni?: string;
    monto?: number;
    concepto?: string;
    metodo?: string;
  }): Promise<{ success: boolean; message: string; pago: PagoCulqi }> {
    return apiClient("/matricula/pagar-manual", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async enviarRecordatorio(data: {
    estudianteId?: string;
    dni?: string;
  }): Promise<{ success: boolean; message: string }> {
    return apiClient("/matricula/recordatorio-pago", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
