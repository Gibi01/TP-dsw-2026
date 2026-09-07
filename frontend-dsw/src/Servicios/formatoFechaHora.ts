// src/Servicios/formatoFechaHora.ts
// helpers de formato fecha/hora en es-AR, fuerzo 24hs por las dudas que el navegador use AM/PM

export function formatearHora(fecha: string | Date): string {
  return new Date(fecha).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatearFechaHora(fecha: string | Date): string {
  return new Date(fecha).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
