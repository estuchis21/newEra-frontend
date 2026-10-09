import api from "../api/axios";

export interface SaldoCredito {
  id_tipo_credito?: number;
  nombre?: string;
  tipo_credito?: string;
  creditos_disponibles?: number | string;
  [key: string]: unknown;
}

export interface MovimientoCredito {
  id_movimiento?: number;
  tipo_movimiento?: string;
  cantidad?: number | string;
  fecha?: string;
  descripcion?: string;
  [key: string]: unknown;
}

export interface ResumenCreditos {
  saldos: SaldoCredito[];
  movimientos: MovimientoCredito[];
}

export interface CompraCreditosResponse {
  id_compra?: number;
  message?: string;
  init_point?: string;
  sandbox_init_point?: string;
  url?: string;
  [key: string]: unknown;
}

/**
 * GET /creditos/alumno/:idAlumno/saldo
 */
export async function obtenerSaldo(
  idAlumno: number
): Promise<SaldoCredito[]> {
  const { data } = await api.get(
    `/creditos/alumno/${idAlumno}/saldo`
  );

  // Admite tanto un array directo como una respuesta envuelta en .data.
  if (Array.isArray(data)) {
    return data as SaldoCredito[];
  }

  if (data && Array.isArray(data.data)) {
    return data.data as SaldoCredito[];
  }

  return [];
}

/**
 * Obtiene el resumen de créditos.
 *
 * El endpoint de saldo no garantiza que incluya movimientos.
 * Por eso, los movimientos quedan vacíos hasta conectar
 * el endpoint real del historial.
 */
export async function obtenerResumenCreditos(
  idAlumno: number
): Promise<ResumenCreditos> {
  const saldos = await obtenerSaldo(idAlumno);

  return {
    saldos,
    movimientos: [],
  };
}

/**
 * POST /creditos/alumno/:idAlumno/comprar
 */
export async function comprarPaquete(
  idAlumno: number,
  idPaquete: number
): Promise<CompraCreditosResponse> {
  const { data } = await api.post<CompraCreditosResponse>(
    `/creditos/alumno/${idAlumno}/comprar`,
    { idPaquete: Number(idPaquete) }
  );

  return data;
}

const creditosService = {
  obtenerSaldo,
  obtenerResumenCreditos,
  comprarPaquete,
};

export default creditosService;
