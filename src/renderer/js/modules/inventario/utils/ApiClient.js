import { ENDPOINTS } from '../constants/endpoints.js';

export class ApiClient {
  async enviarDatos(categoria, datos, modo, id) {
    const endpoint = ENDPOINTS[categoria];
    if (!endpoint) {
      throw new Error(`Endpoint no definido para: ${categoria}`);
    }

    const url = modo === 'editar' ? `${endpoint}/${id}` : endpoint;
    const method = modo === 'editar' ? 'PATCH' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.message || 'Error en el servidor');
    }

    return { success: true, data: resultado };
  }

  async obtenerPorId(categoria, id) {
    const endpoint = ENDPOINTS[categoria];
    if (!endpoint) {
      throw new Error(`Endpoint no definido para: ${categoria}`);
    }

    const response = await fetch(`${endpoint}/${id}`);
    
    if (!response.ok) {
      throw new Error('No se pudo obtener los datos');
    }

    return await response.json();
  }

  async eliminar(categoria, id) {
    const endpoint = ENDPOINTS[categoria];
    if (!endpoint) {
      throw new Error(`Endpoint no definido para: ${categoria}`);
    }

    const response = await fetch(`${endpoint}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al eliminar');
    }

    return { success: true };
  }
}