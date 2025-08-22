// Exportar servicios de API
export { cotizacionService } from './api/cotizacionApiService';
export { clientCotizacionService } from './api/clientCotizacionService';
export { BaseApiService, ApiError } from './api/baseApiService';
export { authService } from './api/authService';
export { contactoService } from './api/contactoService';

// Exportar interfaces del dominio
export type { CotizacionData, CotizacionResponse } from './domain/interfaces/cotizacionInterfaces';
export type { Contacto, ContactoResponse } from './api/contactoService';
export type { LoginResponse, LoginCredentials } from './api/authService';

// Exportar casos de uso
export { CotizacionFormatter } from './application/useCases/cotizacionUseCase';