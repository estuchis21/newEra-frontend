/**
 * Utilidades compartidas para exportar información visible en los dashboards.
 * El archivo se genera en el navegador y no envía datos a servicios externos.
 */
export type FilaCSV = Record<string, string | number | boolean | null | undefined>;

const escaparCSV = (valor: FilaCSV[string]): string => {
  const texto = valor === null || valor === undefined ? "" : String(valor);
  return `"${texto.replace(/"/g, '""')}"`;
};

export function exportarCSV(
  nombreArchivo: string,
  filas: FilaCSV[],
): void {
  if (!filas.length) {
    window.alert("No hay datos para exportar.");
    return;
  }

  const columnas = Array.from(
    filas.reduce((set, fila) => {
      Object.keys(fila).forEach((columna) => set.add(columna));
      return set;
    }, new Set<string>()),
  );

  const contenido = [
    columnas.map(escaparCSV).join(";"),
    ...filas.map((fila) =>
      columnas.map((columna) => escaparCSV(fila[columna])).join(";"),
    ),
  ].join("\r\n");

  // BOM UTF-8 para que Excel interprete correctamente los acentos.
  const blob = new Blob(["\uFEFF", contenido], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombreArchivo.endsWith(".csv")
    ? nombreArchivo
    : `${nombreArchivo}.csv`;
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  URL.revokeObjectURL(url);
}

export function fechaLocal(valor?: string | Date | null): string {
  if (!valor) return "";
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime())
    ? String(valor)
    : fecha.toLocaleDateString("es-AR");
}

export function estadoNormalizado(valor?: string | null): string {
  return String(valor ?? "").trim().toLocaleLowerCase("es-AR");
}
