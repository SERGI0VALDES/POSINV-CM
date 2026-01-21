const path = require('path');

// Ajusta esta ruta para llegar a tus controladores desde este archivo
// const controllerPath = '../../../../server/controllers/';

// IMPORTAMOS LOS CONTROLADORES NECESARIOS //

/* CONTROLADORES PARA USUARIOS =>
const UsuarioController = require(path.join(__dirname, controllerPath, 'usuario/UsuarioController'));
// CONTROLADORES PARA VENTA =>
const ProductoController = require(path.join(__dirname, controllerPath, 'venta/ProductoController'));
const PedidoController = require(path.join(__dirname, controllerPath, 'venta/PedidoController'));
// CONTROLADORES PARA INVENTARIO =>
const InventarioController = require(path.join(__dirname, controllerPath, 'inv/InventarioController'));
const InsumoController = require(path.join(__dirname, controllerPath, 'inv/InsumoController'));
const TelaController = require(path.join(__dirname, controllerPath, 'inv/TelaController'));
const ProdTerminadoController = require(path.join(__dirname, controllerPath, 'inv/ProdTerminadoController'));
const VestidoController = require(path.join(__dirname, controllerPath, 'inv/VestidoController'));
*/

// Exportamos una función que toma ipcMain y el objeto de base de datos (db)
module.exports = (ipcMain, db) => {
    console.log('🔗 Handlers IPC registrados.');

    // Aqui estan los handlers 

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
   
};
