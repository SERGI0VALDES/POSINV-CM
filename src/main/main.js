// En tu archivo JS principal (ej: app.js o main.js)


const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { spawn } = require('child_process') // Necesario para Nestjs


console.log('[INICIANDO PUNTO DE VENTA E INVENTARIO CREACIONES MADRIZ (POSINVCM)]');
console.log('------------------------------------------------------------------');

let serverProcess; // Control de procesos de NestJS
let GeneradorFichaDocx; // Existente...

// Carga del documento generador de DOCX
try {
    GeneradorFichaDocx = require('./generator/generarDocx.js');
    console.log('Generador de archivos (DOCX): OK');
} catch (error) {
    console.error('Error cargando generador DOCX:', error.message);
}

// Función: Iniciar Servidor NestJS
function startBackend() {
    const { spawn } = require('child_process');
    const path = require('path');
    const isDev = !app.isPackaged;
    
    // 1. Definición de rutas según el entorno
    // En desarrollo usamos tu ruta fija. En producción usamos la carpeta interna de la App.
    const backendPath = isDev 
        ? 'D:\\POSINVCM\\server' 
        : path.join(process.resourcesPath, 'server'); 

    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    
    let args;
    if (isDev) {
        // Modo Desarrollo: Ejecuta a través de npm para usar Nest CLI
        args = ['run', 'start', '--prefix', backendPath];
    } else {
        // Modo Producción: Ejecuta el archivo compilado directamente 
        // usando el binario de Node que ya viene dentro de Electron
        args = [path.join(backendPath, 'dist', 'main.js')];
    }

    console.log(`[SISTEMA]: Iniciando servidor desde ${backendPath}`);
    console.log(`[SISTEMA]: Modo: ${isDev ? 'DESARROLLO' : 'PRODUCCIÓN'}`);

    // 2. Lanzamiento del proceso
    serverProcess = spawn(isDev ? command : process.execPath, args, { 
        shell: isDev, // Shell necesario solo para npm en Windows
        cwd: backendPath,
        env: { 
            ...process.env, 
            NODE_ENV: isDev ? 'development' : 'production' 
        }
    });

    // 3. Listeners de Salida Estándar (Logs normales)
    serverProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        if (output) {
            console.log(`[NestJS]: ${output}`);
        }
    });

    // 4. Listeners de Errores del Servidor
    serverProcess.stderr.on('data', (data) => {
        const errorOutput = data.toString().trim();
        if (errorOutput) {
            console.error(`[NestJS-Error]: ${errorOutput}`);
        }
    });

    // 5. Listener de Error al Iniciar (ej. ruta no encontrada)
    serverProcess.on('error', (err) => {
        console.error('❌ Error crítico: No se pudo lanzar el proceso NestJS.');
        console.error(`Detalle: ${err.message}`);
    });

    // 6. Listener de Cierre de Proceso
    serverProcess.on('exit', (code, signal) => {
        if (code !== null) {
            console.log(`[SISTEMA]: El servidor NestJS terminó con código ${code}`);
        } else {
            console.log(`[SISTEMA]: El servidor NestJS fue terminado por la señal ${signal}`);
        }
    });
}


const createWindow = () => {

    console.log('Ventana principal: Creada(OK)');
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
    });

    win.webContents.openDevTools();
};

// IPC Handlers básicos
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

process.on('unhandledRejection', (reason) => {
    console.error('Promise rechazada:', reason);
});

app.whenReady().then(async() => {

    console.log('Entorno: OK')
        
    // 1. Levantamos el servidor de NestJS
    startBackend();    

    // 2. Nota. la BD la maneja ahora NestJS internamente

    // 3. Espera para que el servidor responda antes de abrir la ventana
    // en un futuro podemos usar un "Health Check"
    setTimeout(() => {
        createWindow();
        // registrarHandlers(ipcMain); // Adaptar si handlers necesita conexión
    }, 3000); 

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

/*
LIMPIEZA CRÍTICA
*/

const killBackend = () => {
    if (serverProcess) {
        console.log('Deteniendo servidor NestJS (Kill Tree)...');
        const { exec } = require('child_process');
        // /T mata los procesos hijos (el server), /F es forzado
        exec(`taskkill /pid ${serverProcess.pid} /T /F`, (err) => {
            if (err) console.error('Error al cerrar backend:', err.message);
        });
    }
};

// Se dispara cuando se cierran las ventanas
app.on('window-all-closed', () => {
    killBackend();
    if (process.platform !== 'darwin') app.quit();
});

// Se dispara justo antes de que la app se cierre definitivamente
app.on('before-quit', () => {
    killBackend();
});

// Manejo de errores globales
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});