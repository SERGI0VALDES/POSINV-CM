// preload.js - CON DEBUG DETALLADO
const { contextBridge, ipcRenderer } = require('electron');

// console.log('🔧 Script de [PRELOAD] cargado');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {

    generarFicha: (datosFicha) => {

    console.log('📤 [PRELOAD] generarFicha llamado con datos:', datosFicha.nombre);
    console.log('🔄 [PRELOAD] Invocando IPC generar-ficha...');
    
    try {
      const promise = ipcRenderer.invoke('generar-ficha', datosFicha);
      console.log('PC invocado, promise creada');
      return promise;
    } catch (error) {
      console.error('❌ [PRELOAD] Error en ipcRenderer.invoke:', error);
      throw error;
    }
  },
  
  abrirCarpeta: (ruta) => {
    console.log('abrirCarpeta llamado:', ruta);
    return ipcRenderer.invoke('abrir-carpeta', ruta);
  },
  
  ping: () => {
    console.log('📤 [PRELOAD] ping llamado');
    return ipcRenderer.invoke('ping');
  },

  // Handlers (DB)

  // USUARIOS
    usuarios: {
        getAll: () => ipcRenderer.invoke('usuarios:getAll'),
        login: (user, pass) => ipcRenderer.invoke('usuarios:login', user, pass)
    },
    
    // PRODUCTOS
    productos: {
        getAll: () => ipcRenderer.invoke('productos:getAll'),
        create: (data) => ipcRenderer.invoke('productos:create', data),
        bajoStock: () => ipcRenderer.invoke('productos:bajoStock')
    },
    
  // INSUMOS
  insumos: {
    getAll: () => ipcRenderer.invoke('insumos:getAll'),
    getById: (id) => ipcRenderer.invoke('insumos:getById', id),
    create: (data) => ipcRenderer.invoke('insumos:create', data),
    update: (id, data) => ipcRenderer.invoke('insumos:update', id, data),
    delete: (id) => ipcRenderer.invoke('insumos:delete', id),
    getByUnidad: (unidad) => ipcRenderer.invoke('insumos:getByUnidad', unidad),
    getTotalMetros: () => ipcRenderer.invoke('insumos:getTotalMetros')
  },
    
// TELAS
  telas: {
    getAll: () => ipcRenderer.invoke('telas:getAll'),
    getById: (id) => ipcRenderer.invoke('telas:getById', id),
    create: (data) => ipcRenderer.invoke('telas:create', data),
    update: (id, data) => ipcRenderer.invoke('telas:update', id, data),
    delete: (id) => ipcRenderer.invoke('telas:delete', id),
    getByComposicion: (comp) => ipcRenderer.invoke('telas:getByComposicion', comp),
    getEstadisticas: () => ipcRenderer.invoke('telas:getEstadisticas'),
    getBajaLongitud: (long) => ipcRenderer.invoke('telas:getBajaLongitud', long)
  },
    
// VESTIDOS
  vestidos: {
    getAll: () => ipcRenderer.invoke('vestidos:getAll'),
    getById: (id) => ipcRenderer.invoke('vestidos:getById', id),
    getBySku: (sku) => ipcRenderer.invoke('vestidos:getBySku', sku),
    create: (data) => ipcRenderer.invoke('vestidos:create', data),
    update: (id, data) => ipcRenderer.invoke('vestidos:update', id, data),
    delete: (id) => ipcRenderer.invoke('vestidos:delete', id),
    getByColor: (color) => ipcRenderer.invoke('vestidos:getByColor', color),
    getDisponibles: () => ipcRenderer.invoke('vestidos:getDisponibles'),
    getEstadisticas: () => ipcRenderer.invoke('vestidos:getEstadisticas'),
    getColores: () => ipcRenderer.invoke('vestidos:getColores')
  },

// PRODUCTOS TERMINADOS
  prodTerminados: {
    getAll: () => ipcRenderer.invoke('prodTerminados:getAll'),
    create: (data) => ipcRenderer.invoke('prodTerminados:create', data),
    getByTipo: (tipo) => ipcRenderer.invoke('prodTerminados:getByTipo', tipo)
  }
});

// console.log('✅ [PRELOAD] APIs expuestas correctamente');