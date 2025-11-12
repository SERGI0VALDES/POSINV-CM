// preload.js - VERSIÓN SIMPLIFICADA Y FUNCIONAL
const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Para generar fichas
  generarFicha: (datosFicha) => ipcRenderer.invoke('generar-ficha', datosFicha),
  
  // Para abrir carpetas
  abrirCarpeta: (ruta) => ipcRenderer.invoke('abrir-carpeta', ruta),
  
  // Verificar conexión
  ping: () => ipcRenderer.invoke('ping')
});