// ...archivo /posinvcm/src/main/preload

const { 
  contextBridge, 
  ipcRenderer 
} = require('electron');

// Url del servidor de Nest
const BASE_URL = 'http://localhost:3000'; 

// Funcion auxiliar para contrlar las peticiones hacia la api...

const apiRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la petición');
    }
    return await response.json();
  } catch (error) {
    console.error(`[API ERROR] en ${endpoint}:`, error);
    throw error;
  }
};

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  
  // generador de fichas (compacto)
  generarFicha: (datosFicha) => ipcRenderer.invoke('generar-ficha', datosFicha),
  // abrir carpeta (compacto)
  abrirCarpeta: (ruta) => ipcRenderer.invoke('abrir-carpeta', ruta),
  ping: () => ipcRenderer.invoke('ping'),

  // Código antiguo, que hacian lo mismo de arriba "más extensos" funcionales
  /*
  generarFicha: (datosFicha) => {
    try {
      const promise = ipcRenderer.invoke('generar-ficha', datosFicha);
      return promise;
    } catch (error) {
      throw error;
    }
  },
  abrirCarpeta: (ruta) => {
    console.log('abrirCarpeta llamado:', ruta);
    return ipcRenderer.invoke('abrir-carpeta', ruta);
  },
  ping: () => { console.log('📤 [PRELOAD] ping llamado'); 
    return ipcRenderer.invoke('ping');
  },*/


  // CONTROLADORES  =>
  usuarios: {
    getAll: () => apiRequest('/usuairos'),
    login: (nombreUsuario, password) => apiRequest('/usuarios/login', {
      method: 'POST',
      body: JSON.stringify({ nombreUsuario, password}),
    }),
  },
  // Controlador maestro para el funcionamiento del inventario
  productos: {
    getAll: () => apiRequest('/productos-maestro'),
    bajoStock: () => apiRequest('/productos-maestro/bajo-stock'),
  },
  insumos: {
    getAll: () => apiRequest('/insumos'),
    getById: (id) => apiRequest(`/insumos/${id}`),
    create: (data) => apiRequest('/insumo', {method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/insumos/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/insumos/${id}`, { method: 'DELETE' }),
  },
  telas: {
    getAll: () => apiRequest('/telas'),
    getById: (id) => apiRequest(`/telas/${id}`),
    create: (data) => apiRequest('/telas', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/telas/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/telas/${id}`, { method: 'DELETE' }),
  },
  // Se unifico vestidos con los productos terminados, ambos usan el mismo controlador en NestJs
  prodTerminados: {
    getAll: () => apiRequest('/productos-terminados'),
    getByTipo: (tipo) => apiRequest(`/productos-terminados/buscar?tipoProducto=${tipo}`),
    create: (data) => apiRequest('/productos-terminados', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => apiRequest(`/productos-terminados/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id) => apiRequest(`/productos-terminados/${id}`, { method: 'DELETE' }),
  },
  // Nuevo controlador
  pedidos: {
    getAll: () => apiRequest('/pedidos'),
    getById: (id) => apiRequest(`/pedidos/${id}`),
    create: (data) => apiRequest('/pedidos', { method: 'POST', body: JSON.stringify(data) }),
  }

});

// console.log('✅ [PRELOAD] APIs expuestas correctamente');