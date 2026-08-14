import { BadRequestError } from './errores.js';

// Arma el sanitizedInput a partir de los campos permitidos, descartando undefined.
export function limpiarInput(
  body: Record<string, unknown>,
  campos: string[]
): Record<string, unknown> {
  const sanitizedInput: Record<string, unknown> = {};
  for (const campo of campos) {
    if (body[campo] !== undefined) {
      sanitizedInput[campo] = body[campo];
    }
  }
  return sanitizedInput;
}

// Para creación (POST): exige que los campos obligatorios estén presentes y no vacíos.
export function validarCamposRequeridos(
  sanitizedInput: Record<string, unknown>,
  camposRequeridos: string[]
): void {
  const faltantes = camposRequeridos.filter((campo) => {
    const valor = sanitizedInput[campo];
    return valor === undefined || valor === null || valor === '';
  });
  if (faltantes.length > 0) {
    throw new BadRequestError(
      `Faltan campos obligatorios: ${faltantes.join(', ')}`
    );
  }
}

export function parsearIdNumerico(valor: string): number {
  const id = Number.parseInt(valor, 10);
  if (Number.isNaN(id)) {
    throw new BadRequestError(`El id "${valor}" no es válido`);
  }
  return id;
}
