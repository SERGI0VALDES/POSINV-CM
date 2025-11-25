const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs').promises;


console.log('🚀 Iniciando aplicación Electron...');

// ✅ CORRECCIÓN: Declarar la variable GLOBALMENTE
let GeneradorFichaDocx;
let dbInitialized = false;

// ✅ NUEVO: Inicializar base de datos
async function initializeDatabase() {
    try {
        console.log('📊 Inicializando base de datos...');
        
        // Usar TU connection.js existente
        const getDatabase = require('../../server/database/connection.js');
        const db = getDatabase();
        
        console.log('✅ Base de datos inicializada via connection.js');
        return true;
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
        return false;
    }
}

// GeneradorFichaDocx
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

// ✅ CORRECCIÓN
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

// ✅ NUEVA FUNCIÓN: Registrar todos los handlers IPC
function registerDatabaseHandlers(
    UsuarioController,
    ProductoController,
    PedidoController,
    InventarioController,
    InsumoController,
    TelaController,
    VestidoController,
    ProdTerminadoController
) {
    //
    ipcMain.handle('prodTerminados:getAll', async () => {
    try {
        return { success: true, data: ProdTerminadoController.getAll() };
    } catch (error) {
        return { success: false, error: error.message };
    }
    });

ipcMain.handle('prodTerminados:create', async (event, data) => {
    try {
        return { success: true, data: ProdTerminadoController.create(data) };
    } catch (error) {
        return { success: false, error: error.message };
    }
    });
    // ========== USUARIOS ==========
    ipcMain.handle('usuarios:getAll', async () => {
        try {
            return { success: true, data: UsuarioController.getAll() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('usuarios:login', async (event, nombreUsuario, password) => {
        try {
            return { success: true, data: UsuarioController.login(nombreUsuario, password) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ========== PRODUCTOS ==========
    ipcMain.handle('productos:getAll', async () => {
        try {
            return { success: true, data: ProductoController.getAll() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('productos:create', async (event, data) => {
        try {
            return { success: true, data: ProductoController.create(data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('productos:bajoStock', async () => {
        try {
            return { success: true, data: ProductoController.getBajoStock() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ========== PEDIDOS ==========
    ipcMain.handle('pedidos:getAll', async () => {
        try {
            return { success: true, data: PedidoController.getAll() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('pedidos:create', async (event, data) => {
        try {
            return { success: true, data: PedidoController.create(data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ========== INVENTARIO ==========
    ipcMain.handle('inventario:getAll', async () => {
        try {
            return { success: true, data: InventarioController.getAll() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('inventario:registrar', async (event, data) => {
        try {
            return { success: true, data: InventarioController.registrarMovimiento(data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ========== INSUMOS ==========
    ipcMain.handle('insumos:getAll', async () => {
        try {
            return { success: true, data: InsumoController.getAll() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('insumos:getById', async (event, id) => {
        try {
            return { success: true, data: InsumoController.getById(id) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('insumos:create', async (event, data) => {
        try {
            return { success: true, data: InsumoController.create(data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('insumos:update', async (event, id, data) => {
        try {
            return { success: true, data: InsumoController.update(id, data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('insumos:delete', async (event, id) => {
        try {
            return { success: true, data: InsumoController.delete(id) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('insumos:getByUnidad', async (event, unidad) => {
        try {
            return { success: true, data: InsumoController.getByUnidad(unidad) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('insumos:getTotalMetros', async () => {
        try {
            return { success: true, data: InsumoController.getTotalMetros() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ========== TELAS ==========
    ipcMain.handle('telas:getAll', async () => {
        try {
            return { success: true, data: TelaController.getAll() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('telas:getById', async (event, id) => {
        try {
            return { success: true, data: TelaController.getById(id) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('telas:create', async (event, data) => {
        try {
            return { success: true, data: TelaController.create(data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('telas:update', async (event, id, data) => {
        try {
            return { success: true, data: TelaController.update(id, data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('telas:delete', async (event, id) => {
        try {
            return { success: true, data: TelaController.delete(id) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('telas:getByComposicion', async (event, composicion) => {
        try {
            return { success: true, data: TelaController.getByComposicion(composicion) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('telas:getEstadisticas', async () => {
        try {
            return { success: true, data: TelaController.getEstadisticas() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('telas:getBajaLongitud', async (event, longitudMinima) => {
        try {
            return { success: true, data: TelaController.getBajaLongitud(longitudMinima) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ========== VESTIDOS ==========
    ipcMain.handle('vestidos:getAll', async () => {
        try {
            return { success: true, data: VestidoController.getAll() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:getById', async (event, id) => {
        try {
            return { success: true, data: VestidoController.getById(id) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:getBySku', async (event, sku) => {
        try {
            return { success: true, data: VestidoController.getBySku(sku) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:create', async (event, data) => {
        try {
            return { success: true, data: VestidoController.create(data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:update', async (event, id, data) => {
        try {
            return { success: true, data: VestidoController.update(id, data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:delete', async (event, id) => {
        try {
            return { success: true, data: VestidoController.delete(id) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:getByColor', async (event, color) => {
        try {
            return { success: true, data: VestidoController.getByColor(color) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:getDisponibles', async () => {
        try {
            return { success: true, data: VestidoController.getDisponibles() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:getEstadisticas', async () => {
        try {
            return { success: true, data: VestidoController.getEstadisticas() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('vestidos:getColores', async () => {
        try {
            return { success: true, data: VestidoController.getColores() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    // ========== PRODUCTOS TERMINADOS ==========
    
    
    ipcMain.handle('prodTerminados:getAll', async () => {
        try {
            return { success: true, data: ProdTerminadoController.getAll() };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('prodTerminados:create', async (event, data) => {
        try {
            return { success: true, data: ProdTerminadoController.create(data) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('prodTerminados:getByTipo', async (event, tipo) => {
        try {
            return { success: true, data: ProdTerminadoController.getByTipo(tipo) };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
    
}

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rechazada:', reason);
});

app.whenReady().then(async() => {
    // Inicializar base de datos PRIMERO
    await initializeDatabase();
    
    // Luego cargar los controllers (DESPUÉS de la BD)
    if (dbInitialized) {
        try {
            // ✅ CORRECCIÓN: Usar las rutas correctas de tus controllers
            const UsuarioController = require('./server/controllers/usuario/UsuarioController.js');
            const ProductoController = require('./server/controllers/venta/ProductoController.js');
            const PedidoController = require('./server/controllers/venta/PedidoController.js');
            const InventarioController = require('./server/controllers/inv/InventarioController.js');
            const InsumoController = require('./server/controllers/inv/InsumoController.js');
            const TelaController = require('./server/controllers/inv/TelaController.js');
            const VestidoController = require('./server/controllers/inv/VestidoController.js');
            const ProdTerminadoController = require('./server/controllers/inv/ProdTerminadoController.js');
            
            // Registrar handlers IPC para la base de datos
            registerDatabaseHandlers(
                UsuarioController,
                ProductoController,
                PedidoController,
                InventarioController,
                InsumoController,
                TelaController,
                VestidoController,
                ProdTerminadoController
            );
            
            console.log('✅ Controllers cargados y handlers registrados');
        } catch (error) {
            console.error('❌ Error cargando controllers:', error);
        }
    }
    
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Cerrar la base de datos cuando la app se cierra
app.on('before-quit', () => {
    if (global.databaseInstance) {
        global.databaseInstance.close();
        console.log('🔒 Base de datos cerrada');
    }
});