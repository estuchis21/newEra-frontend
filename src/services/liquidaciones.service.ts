import api from "../api/axios";

export interface LiquidacionProfesor {
  id_liquidacion: number;
  id_reserva: number;
  monto_base: number | string;
  porcentaje: number | string;
  monto_profesor: number | string;
  monto_academia: number | string;
  fecha_generacion: string;
  estado: "Pendiente" | "Pagado" | "Anulado" | string;
}

export async function obtenerLiquidacionesProfesor(
  idProfesor: number,
): Promise<LiquidacionProfesor[]> {
  const response = await api.get<LiquidacionProfesor[]>(
    `/profesores/liquidaciones/${idProfesor}`,
  );

  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray((response.data as any)?.data)) return (response.data as any).data;
  return [];
}
