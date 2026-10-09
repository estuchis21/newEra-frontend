import api from "../api/axios";

export interface SaldoCredito {
  id_tipo_credito?: number;
  nombre?: string;
  tipo_credito?: string;
  creditos_disponibles?: number | string;
}

export interface CompraCreditosResponse {
  id_compra?: number;
  message?: string;
  [key: string]: unknown;
}

export interface ResumenCreditos {
  totalCreditos: number;
  detalle: SaldoCredito[];
}

/**
 * GET /creditos/alumno/:idAlumno/saldo
 */
export async function obtenerSaldo(
  idAlumno: number
): Promise<SaldoCredito[] | unknown> {
  const { data } = await api.get(
    `/creditos/alumno/${idAlumno}/saldo`
  );

  return data;
}

/**
 * Obtiene un resumen a partir del endpoint de saldo existente.
 */
export async function obtenerResumenCreditos(
  idAlumno: number
): Promise<ResumenCreditos> {
  const respuesta = await obtenerSaldo(idAlumno);

  const detalle: SaldoCredito[] = Array.isArray(respuesta)
    ? respuesta as SaldoCredito[]
    : [];

  const totalCreditos = detalle.reduce((total, item) => {
    const cantidad = Number(item.creditos_disponibles ?? 0);
    return total + (Number.isFinite(cantidad) ? cantidad : 0);
  }, 0);

  return {
    totalCreditos,
    detalle,
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
