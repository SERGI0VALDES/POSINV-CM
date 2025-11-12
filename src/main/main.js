// main.js - VERSIÓN CORREGIDA
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

const createWindow = () => {
  const win = new BrowserWindow({
    minWidth: 1000,
    minHeight: 800,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false // ⚠️ Temporalmente para debugging
    }
  });
  
  win.maximize();
  
  // Carga el dashboard directamente
  win.loadFile('src/renderer/screens/dashboard.html');

  win.once('ready-to-show', () => {
    win.show();
  });

  // Abrir DevTools para debugging
  win.webContents.openDevTools();
};

// IPC Handlers
ipcMain.handle('ping', () => {
  return 'pong';
});

ipcMain.handle('abrir-carpeta', async (event, folderPath) => {
  try {
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    console.error('Error al abrir la ruta:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('generar-ficha', async (event, datosFicha) => {
  try {
    const FICHA_FOLDER = 'D:\\fichas';
    
    // Crear carpeta si no existe
    try {
      await fs.access(FICHA_FOLDER);
    } catch (error) {
      await fs.mkdir(FICHA_FOLDER, { recursive: true });
    }

    // Plantilla de la ficha
    const TEMPLATE_CONTENT = `DATOS DEL CLIENTE
Nombre: {nombre} Edad: {edad} Sexo: {sexo}
FECHAS
Fecha pedido: {fechaPedido} Fecha prueba: {fechaPrueba} Fecha entrega: {fechaEntrega}
MEDIDAS
Ancho espalda: {anchoEspalda} Largo de talle frente: {largoTalleFrente} 
Largo talle espalda: {largoTalleEspalda} Largo total: {largoTotal}
Busto: {busto} Cintura: {cintura} Cadera: {cadera} Hombro: {hombro} Escote: {escote}
Tirante: {tirante} Largo manga: {largoManga} Puño: {puno} 
Largo falda o pantalon: {largoFalda}
Largo exterior: {largoExterior} Largo interior: {largoInterior} Bastilla: {bastilla} Rodilla: {rodilla}
INFORMACIÓN ADICIONAL
{anotaciones}`;

    // Reemplazar marcadores
    let fichaContent = TEMPLATE_CONTENT;
    for (const [key, value] of Object.entries(datosFicha)) {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      fichaContent = fichaContent.replace(placeholder, value || '');
    }

    // Generar nombre del archivo
    const nombreCliente = datosFicha.nombre.trim().replace(/\s+/g, '_') || 'ClienteNuevo';
    const fechaPedido = datosFicha.fechaPedido || new Date().toISOString().split('T')[0];
    const fileName = `FICHA_${nombreCliente}_${fechaPedido}.txt`;
    const filePath = path.join(FICHA_FOLDER, fileName);

    // Escribir archivo
    await fs.writeFile(filePath, fichaContent, 'utf8');
    
    return { 
      success: true, 
      message: `Ficha guardada en: ${filePath}`,
      filePath: filePath
    };
    
  } catch (error) {
    console.error('Error al generar ficha:', error);
    return { 
      success: false, 
      error: `Error al guardar la ficha: ${error.message}` 
    };
  }
});

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});