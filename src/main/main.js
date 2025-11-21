// main.js - VERSIÓN CORREGIDA
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;

console.log('🚀 Iniciando aplicación Electron...');

// ✅ CORRECCIÓN: Declarar la variable GLOBALMENTE
let GeneradorFichaDocx;

try {
    GeneradorFichaDocx = require('./generator/generarDocx.js');
    console.log('Generador DOCX cargado correctamente');
} catch (error) {
    console.error('Error cargando generador DOCX:', error.message);
    // Si hay error, usaremos versión temporal
}

const createWindow = () => {
    console.log('Creando ventana principal...');
    const win = new BrowserWindow({
        minWidth: 1000,
        minHeight: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        }
    });
    
    win.maximize();
    win.loadFile('src/renderer/screens/dashboard.html');

    win.once('ready-to-show', () => {
        win.show();
        console.log('✅ Ventana mostrada');
    });

    win.webContents.openDevTools();
};

// IPC Handlers
ipcMain.handle('ping', () => {
    console.log('Ping recibido');
    return 'pong';
});

ipcMain.handle('abrir-carpeta', async (event, folderPath) => {
    console.log('📁 Abrir carpeta:', folderPath);
    try {
        await shell.openPath(folderPath);
        return { success: true };
    } catch (error) {
        console.error('Error al abrir la ruta:', error);
        return { success: false, error: error.message };
    }
});

// ✅ CORRECCIÓN: Usar el generador DOCX real
ipcMain.handle('generar-ficha', async (event, datosFicha) => {
    console.log('IPC "generar-ficha" RECIBIDO');
    console.log('Datos del formulario:', {
        nombre: datosFicha.nombre,
        fechaPedido: datosFicha.fechaPedido,
        sexo: datosFicha.sexo
    });
    
    try {
        const FICHA_FOLDER = 'D:\\fichas';
        console.log('📁 Usando carpeta:', FICHA_FOLDER);
        
        // Crear carpeta si no existe
        try {
            await fs.access(FICHA_FOLDER);
            console.log('Carpeta existe');
        } catch (error) {
            console.log('Creando carpeta...');
            await fs.mkdir(FICHA_FOLDER, { recursive: true });
            console.log('Carpeta creada');
        }

        // ✅ DECISIÓN: Usar DOCX si está disponible, sino usar TXT temporal
        if (GeneradorFichaDocx) {
            console.log('Generando documento DOCX...');
            
            // Generar documento DOCX
            const buffer = await GeneradorFichaDocx.generarFicha(datosFicha);
            console.log('Documento DOCX generado en memoria');

            // Generar nombre del archivo DOCX
            const nombreCliente = datosFicha.nombre.trim().replace(/\s+/g, '_') || 'ClienteNuevo';
            const fechaPedido = datosFicha.fechaPedido || new Date().toISOString().split('T')[0];
            const fileName = `FICHA_${nombreCliente}_${fechaPedido}.docx`;
            const filePath = path.join(FICHA_FOLDER, fileName);

            console.log('Guardando archivo DOCX:', fileName);
            
            // Guardar archivo DOCX
            await fs.writeFile(filePath, buffer);
            
            console.log('Ficha DOCX guardada exitosamente:', filePath);
            
            return { 
                success: true, 
                message: `Ficha DOCX guardada en: ${filePath}`,
                filePath: filePath
            };
        } else {
            console.log('⚠️ [MAIN] Generador DOCX no disponible, usando TXT temporal');
            
            // ✅ FALLBACK: Crear archivo de texto simple
            const nombreCliente = datosFicha.nombre.trim().replace(/\s+/g, '_') || 'ClienteNuevo';
            const fechaPedido = datosFicha.fechaPedido || new Date().toISOString().split('T')[0];
            const fileName = `FICHA_${nombreCliente}_${fechaPedido}.txt`;
            const filePath = path.join(FICHA_FOLDER, fileName);

            console.log('💾 [MAIN] Creando archivo TXT:', fileName);

            const contenido = `Ficha de Cliente - ${new Date().toISOString()}\n\n` +
                             `Nombre: ${datosFicha.nombre}\n` +
                             `Fecha Pedido: ${datosFicha.fechaPedido}\n` +
                             `Sexo: ${datosFicha.sexo}\n` +
                             `--- FIN ---`;
            
            await fs.writeFile(filePath, contenido, 'utf8');
            
            console.log('🎉 Archivo TXT creado exitosamente:', filePath);
            
            return { 
                success: true, 
                message: `Archivo temporal creado: ${filePath}`,
                filePath: filePath
            };
        }
        
    } catch (error) {
        console.error('Error en generar-ficha:', error);
        return { 
            success: false, 
            error: `Error: ${error.message}` 
        };
    }
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rechazada:', reason);
});

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

