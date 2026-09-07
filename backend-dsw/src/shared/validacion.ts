import { BadRequestError } from './errores.js';

// arma el sanitizedInput solo con los campos permitidos, ignora los undefined
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

// para el POST, chequea que los campos obligatorios esten y no vacios
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
