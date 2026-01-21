// src/main/ipc/controllerLoader.js
const path = require('path');

// 4 saltos para llegar a la raiz del proyecto
const appRoot = path.join(__dirname, '..', '..','..','..');

/**
 * Carga y registro todos los controladores IPC.
 * @param {Electron.IpcMain} ipcMain - El objeto ipcMain de Electron.
 * @param {Database} db - La instancia de la base de datos.
 */

const loadControllers = (ipcMain, db) => {

    console.log('🔄 Cargando todos los Controllers IPC...');

    // Generamos las rutas absolutas para cada controlador
    // 'auth/AuthController.js',
    const controllers = [
        
        'usuario/UsuarioController.js',
        'venta/ProductoController.js',
        'venta/PedidoController.js',
        'inv/InventarioController.js',
        'inv/InsumoController.js',
        'inv/TelaController.js',
        'inv/VestidoController.js',
        'inv/ProdTerminadoController.js',
    ].map(relativePath => 
        require(path.join(appRoot, 'server', 'controllers', relativePath))
    );

    // Iteramos sobre cada controlador y lo inicializamos, pasándole ipcMain y db
    controllers.forEach(ControllerModule => {
        // Asumimos que cada módulo exporta una función que toma ipcMain y db
        if (typeof ControllerModule === 'function') { // error aqui <-
            new ControllerModule(ipcMain, db);
        } else {
            console.warn(`⚠️ Módulo no válido encontrado: ${ControllerModule}`);
        }
    });

    console.log('✅ Carga de Controllers IPC finalizada.');
};

module.exports = loadControllers;