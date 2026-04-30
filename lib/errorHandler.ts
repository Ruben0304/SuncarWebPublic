/**
 * Manejador global de errores para llamadas al backend
 * Proporciona mensajes amigables y consistentes
 */

export interface ErrorResponse {
  message: string
  code?: string
  details?: unknown
}

export class APIError extends Error {
  code?: string
  details?: unknown

  constructor(message: string, code?: string, details?: unknown) {
    super(message)
    this.name = 'APIError'
    this.code = code
    this.details = details
  }
}

/**
 * Mensajes amigables para diferentes tipos de errores
 */
const FRIENDLY_MESSAGES = {
  network: 'Estamos trabajando en mejoras. Por favor, intenta nuevamente en unos momentos.',
  timeout: 'La solicitud está tomando más tiempo del esperado. Estamos optimizando nuestros servicios.',
  server: 'Estamos realizando mejoras en nuestros sistemas. Volveremos pronto.',
  notFound: 'El recurso solicitado no está disponible en este momento.',
  unauthorized: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
  forbidden: 'No tienes permisos para acceder a este recurso.',
  validation: 'Por favor, verifica los datos ingresados.',
  default: 'Estamos trabajando en mejoras para ofrecerte un mejor servicio. Intenta nuevamente pronto.',
}

/**
 * Determina el tipo de error y retorna un mensaje amigable
 */
export function getErrorMessage(error: unknown): string {
  // Error de red
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return FRIENDLY_MESSAGES.network
  }

  // Error de API personalizado
  if (error instanceof APIError) {
    return error.message
  }

  // Error con respuesta HTTP
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status

    switch (status) {
      case 401:
        return FRIENDLY_MESSAGES.unauthorized
      case 403:
        return FRIENDLY_MESSAGES.forbidden
      case 404:
        return FRIENDLY_MESSAGES.notFound
      case 408:
        return FRIENDLY_MESSAGES.timeout
      case 422:
        return FRIENDLY_MESSAGES.validation
      case 500:
      case 502:
      case 503:
      case 504:
        return FRIENDLY_MESSAGES.server
      default:
        return FRIENDLY_MESSAGES.default
    }
  }

  // Error genérico
  if (error instanceof Error) {
    // No mostrar mensajes técnicos al usuario
    console.error('Error técnico:', error.message)
    return FRIENDLY_MESSAGES.default
  }

  return FRIENDLY_MESSAGES.default
}

/**
 * Wrapper para fetch que maneja errores automáticamente
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new APIError(
        getErrorMessage({ status: response.status }),
        errorData.code,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    // Si ya es un APIError, lo lanzamos tal cual
    if (error instanceof APIError) {
      throw error
    }

    // Para otros errores, creamos un APIError con mensaje amigable
    throw new APIError(getErrorMessage(error))
  }
}

/**
 * Hook para manejar errores en componentes
 */
export function handleComponentError(error: unknown): ErrorResponse {
  const message = getErrorMessage(error)
  
  console.error('Error en componente:', error)
  
  return {
    message,
    code: error instanceof APIError ? error.code : undefined,
    details: error instanceof APIError ? error.details : undefined,
  }
}

/**
 * Logger de errores para desarrollo
 */
export function logError(error: unknown, context?: string) {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 Error${context ? ` en ${context}` : ''}`)
    console.error(error)
    if (error instanceof Error) {
      console.error('Stack:', error.stack)
    }
    console.groupEnd()
  }
}
