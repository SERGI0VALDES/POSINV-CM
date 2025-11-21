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
      console.log('✅ [PRELOAD] IPC invocado, promise creada');
      return promise;
    } catch (error) {
      console.error('❌ [PRELOAD] Error en ipcRenderer.invoke:', error);
      throw error;
    }
  },
  
  abrirCarpeta: (ruta) => {
    console.log('📤 [PRELOAD] abrirCarpeta llamado:', ruta);
    return ipcRenderer.invoke('abrir-carpeta', ruta);
  },
  
  ping: () => {
    console.log('📤 [PRELOAD] ping llamado');
    return ipcRenderer.invoke('ping');
  }
});

// console.log('✅ [PRELOAD] APIs expuestas correctamente');