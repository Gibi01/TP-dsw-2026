export class ErrorApi extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
  }
}

export class BadRequestError extends ErrorApi {
  constructor(message = 'Solicitud inválida') {
    super(message, 400);
  }
}

export class UnauthorizedError extends ErrorApi {
  constructor(message = 'No autenticado') {
    super(message, 401);
  }
}

export class ForbiddenError extends ErrorApi {
  constructor(message = 'No tenés permisos para realizar esta acción') {
    super(message, 403);
  }
}

export class NotFoundError extends ErrorApi {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends ErrorApi {
  constructor(message = 'Conflicto con el estado actual del recurso') {
    super(message, 409);
  }
}
