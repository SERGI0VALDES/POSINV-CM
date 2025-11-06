const { app, BrowserWindow } = require('electron')
const { ipcMain, shell } = require('electron');
const path = require('path');

// Escuchamos el evento IPC que viene del preload script
ipcMain.on('open-external-path', (event, path) => {
    console.log(`Solicitud de apertura de ruta recibida: ${path}`);
    
    // shell.openPath() es el método de Electron para abrir carpetas/archivos
    shell.openPath(path)
        .then(result => {
            if (result) {
                console.error('Error al abrir la ruta:', result);
            }
        })
        .catch(err => {
            console.error('Error durante la ejecución de openPath:', err);
        });
});

const createWindow = () => {
  const win = new BrowserWindow({
    minWidth: 1000,
    minHeight: 800,
    show: false, // <--- 1. Oculta la ventana al crearla
    // Configuración de seguridad
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Asegúrate que la ruta sea correcta
      contextIsolation: true, 
      nodeIntegration: false,
    }
  })
  
  // 1. Inicia la ventana en estado maximizado
  win.maximize()

  win.loadFile('src/renderer/screens/dashboard.html')

  win.once('ready-to-show', () => {
    win.show()
  })
  
}

app.whenReady().then(() => {
  createWindow()
})