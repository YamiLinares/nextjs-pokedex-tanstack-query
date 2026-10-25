/** Error de una petición HTTP, con el código de estado para decidir reintentos. */
export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.isNotFound;
}
