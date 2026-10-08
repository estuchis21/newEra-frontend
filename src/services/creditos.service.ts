import api from "../api/axios";

export interface SaldoCredito {
  id_tipo_credito: number;
  tipo_credito: string;
  saldo: number;
}

export interface MovimientoCredito {
  id_movimiento: number;
  cantidad: number;
  tipo: "COMPRA" | "CONSUMO" | "DEVOLUCION" | "AJUSTE" | string;
  fecha: string;
  descripcion?: string;
  tipo_credito: string;
  paquete?: string | null;
}

export interface ResumenCreditos {
  saldos: SaldoCredito[];
  movimientos: MovimientoCredito[];
}

export async function obtenerResumenCreditos(idAlumno: number): Promise<ResumenCreditos> {
  const response = await api.get(`/alumnos/creditos/${idAlumno}`);
  const data = response.data?.data ?? response.data;
  return {
    saldos: Array.isArray(data?.saldos) ? data.saldos : [],
    movimientos: Array.isArray(data?.movimientos) ? data.movimientos : [],
  };
}
