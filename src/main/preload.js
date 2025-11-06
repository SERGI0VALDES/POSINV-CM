const { contextBridge, ipcRenderer } = require('electron');

// Exponemos una función llamada 'openExternalPath' a la ventana del renderizador.
contextBridge.exposeInMainWorld('appAPI', {
    openExternalPath: (path) => {
        // Cuando se llama a esta función desde el renderer.js, envía un mensaje IPC
        // con el canal 'open-external-path' y la ruta como argumento.
        ipcRenderer.send('open-external-path', path);
    }
});