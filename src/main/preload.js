// ...archivo /posinvcm/src/main/preload

const { 
  contextBridge, 
  ipcRenderer 
} = require('electron');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  
  // generador de fichas (compacto)
  generarFicha: (datosFicha) => ipcRenderer.invoke('generar-ficha', datosFicha),
  // abrir carpeta (compacto)
  abrirCarpeta: (ruta) => ipcRenderer.invoke('abrir-carpeta', ruta),
  ping: () => ipcRenderer.invoke('ping'),

});
