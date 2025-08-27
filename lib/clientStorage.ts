import { ClientData } from '@/services';

const CLIENT_STORAGE_KEY = 'suncar_client_data';

export const clientStorage = {
  // Guardar datos del cliente
  setClientData: (clientData: ClientData): void => {
    try {
      localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clientData));
    } catch (error) {
      console.error('Error al guardar datos del cliente:', error);
    }
  },

  // Obtener datos del cliente
  getClientData: (): ClientData | null => {
    try {
      const data = localStorage.getItem(CLIENT_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error al obtener datos del cliente:', error);
      return null;
    }
  },

  // Verificar si hay un cliente guardado
  isClientStored: (): boolean => {
    try {
      const data = localStorage.getItem(CLIENT_STORAGE_KEY);
      return data !== null;
    } catch (error) {
      console.error('Error al verificar cliente guardado:', error);
      return false;
    }
  },

  // Limpiar datos del cliente
  clearClientData: (): void => {
    try {
      localStorage.removeItem(CLIENT_STORAGE_KEY);
    } catch (error) {
      console.error('Error al limpiar datos del cliente:', error);
    }
  }
};