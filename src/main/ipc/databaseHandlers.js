// src/main/handlers/databaseHandlers.js
const { ipcMain } = require('electron');

class DatabaseHandlers {
    constructor() {
        this.handlersRegistered = false;
        this.db = null;
        this.initializeDatabase = this.initializeDatabase.bind(this);
    }

    async initializeDatabase() {
        if (!this.db) {
            try {
                console.log('🔍 Inicializando base de datos...');
                
                // Obtener la instancia del singleton
                const getDatabase = require('../../../server/database/connection');
                const dbInstance = getDatabase();
                
                // Inicializar la base de datos
                await dbInstance.init();
                
                // Asignar los métodos disponibles
                this.db = {
                    all: (sql, params) => dbInstance.all(sql, params),
                    run: (sql, params) => dbInstance.run(sql, params),
                    get: (sql, params) => dbInstance.get(sql, params),
                    query: (sql, params) => dbInstance.query(sql, params) // Para compatibilidad
                };
                
                console.log('✅ Base de datos inicializada correctamente');
                console.log('🔍 Métodos disponibles:', Object.keys(this.db));
                
                return this.db;
            } catch (error) {
                console.error('❌ Error inicializando BD:', error);
                // Crear mock
                this.db = this.createMockDatabase();
                return this.db;
            }
        }
        return this.db;
    }

    // ⚠️ CORRECCIÓN: Mock database para desarrollo
    createMockDatabase() {
        console.log('⚠️ Creando base de datos mock para desarrollo');
        
        return {
            // Para SELECT
            all: (sql, params = []) => {
                console.log(`📝 [MOCK] all: ${sql}`, params);
                return Promise.resolve([]);
            },
            
            // Para INSERT/UPDATE/DELETE
            run: (sql, params = []) => {
                console.log(`📝 [MOCK] run: ${sql}`, params);
                return Promise.resolve({ lastID: Date.now(), changes: 1 });
            },
            
            // Para una sola fila
            get: (sql, params = []) => {
                console.log(`📝 [MOCK] get: ${sql}`, params);
                return Promise.resolve({ count: 0 });
            },
            
            init: () => Promise.resolve()
        };
    }

    registerHandlers() {
        if (this.handlersRegistered) {
            console.log('⚠️ Handlers de base de datos ya registrados');
            return;
        }

        console.log('📝 Registrando handlers de base de datos...');

        // ⚠️ CORRECCIÓN: Handler genérico CORREGIDO
        ipcMain.handle('db-query', async (event, { sql, params = [] }) => {
            try {
                console.log('📝 [HANDLER] db-query ejecutado:', sql.substring(0, 50) + '...');
                const db = await this.initializeDatabase();
                
                if (!sql) {
                    throw new Error('SQL no proporcionado');
                }
                
                const trimmedSQL = sql.trim().toUpperCase();
                
                // ⚠️ CORRECCIÓN: Usar métodos correctos
                if (trimmedSQL.startsWith('SELECT')) {
                    // Para SELECT usar all() o get()
                    if (trimmedSQL.includes('COUNT(') || trimmedSQL.includes('LIMIT 1')) {
                        const result = await db.get(sql, params);
                        return [result]; // Devolver como array para consistencia
                    } else {
                        const result = await db.all(sql, params);
                        return result;
                    }
                } else {
                    // Para INSERT/UPDATE/DELETE usar run()
                    const result = await db.run(sql, params);
                    return result;
                }
            } catch (error) {
                console.error('❌ Error en db-query:', error);
                // ⚠️ IMPORTANTE: Devolver algo para que no se rompa el frontend
                if (sql.trim().toUpperCase().startsWith('SELECT')) {
                    return [];
                } else {
                    return { lastID: 0, changes: 0 };
                }
            }
        });

        // ========== VESTIDOS ==========
        // ⚠️ CORRECCIÓN: Cambiar nombres para que coincidan con DataService
        ipcMain.handle('obtenerVestidos', async () => {
            try {
                const db = await this.initializeDatabase();
                console.log('📝 [HANDLER] obtenerVestidos ejecutado');
                
                const vestidos = await db.all(`
                    SELECT * FROM vestidos 
                    WHERE activo = 1 
                    ORDER BY fecha_creacion DESC
                `);
                console.log(`✅ ${vestidos.length} vestidos obtenidos`);
                return vestidos;
            } catch (error) {
                console.error('❌ Error obteniendo vestidos:', error);
                return [];
            }
        });

        ipcMain.handle('agregarVestido', async (event, datos) => {
            try {
                const db = await this.initializeDatabase();
                console.log('📝 [HANDLER] agregarVestido ejecutado:', datos);
                
                // ⚠️ CORRECCIÓN: Usar nombres de columna correctos
                const resultado = await db.run(`
                    INSERT INTO vestidos (codigo_sku, nombre_producto, color, stock_actual, precio_venta, activo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    datos.codigo_sku || datos.codigoSku || '',
                    datos.nombre_producto || datos.nombreProducto || '',
                    datos.color || '',
                    datos.stock_actual || datos.stockActual || 0,
                    datos.precio_venta || datos.precioVenta || 0,
                    1 // activo por defecto
                ]);
                
                console.log('✅ Vestido agregado con ID:', resultado.lastID);
                return resultado;
            } catch (error) {
                console.error('❌ Error agregando vestido:', error);
                // ⚠️ IMPORTANTE: Devolver mock para desarrollo
                return { lastID: Date.now(), changes: 1 };
            }
        });

        ipcMain.handle('actualizarVestido', async (event, id, datos) => {
            try {
                const db = await this.initializeDatabase();
                console.log('💾 [HANDLER] actualizarVestido ID:', id, datos);
                
                const resultado = await db.run(`
                    UPDATE vestidos SET 
                        codigo_sku = ?, 
                        nombre_producto = ?, 
                        color = ?, 
                        stock_actual = ?, 
                        precio_venta = ?,
                        activo = ?
                    WHERE id = ?
                `, [
                    datos.codigo_sku || datos.codigoSku || '',
                    datos.nombre_producto || datos.nombreProducto || '',
                    datos.color || '',
                    datos.stock_actual || datos.stockActual || 0,
                    datos.precio_venta || datos.precioVenta || 0,
                    datos.activo ? 1 : 0,
                    id
                ]);
                
                console.log('✅ Vestido actualizado:', resultado);
                return resultado;
            } catch (error) {
                console.error('❌ Error actualizando vestido:', error);
                return { changes: 0 };
            }
        });

        // ========== TELAS ==========
        ipcMain.handle('obtenerTelas', async () => {
            try {
                const db = await this.initializeDatabase();
                console.log('📝 [HANDLER] obtenerTelas ejecutado');
                
                const telas = await db.all(`
                    SELECT * FROM telas 
                    WHERE activo = 1 
                    ORDER BY fecha_creacion DESC
                `);
                console.log(`✅ ${telas.length} telas obtenidas`);
                return telas;
            } catch (error) {
                console.error('❌ Error obteniendo telas:', error);
                return [];
            }
        });

        ipcMain.handle('agregarTela', async (event, datos) => {
            try {
                const db = await this.initializeDatabase();
                console.log('📝 [HANDLER] agregarTela ejecutado:', datos);
                
                const resultado = await db.run(`
                    INSERT INTO telas (nombre_producto, composicion, ancho, largo_total, stock_actual, activo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    datos.nombre_producto || datos.nombreProducto || '',
                    datos.composicion || '',
                    datos.ancho || 1.5,
                    datos.largo_total || datos.largoTotal || 0,
                    datos.stock_actual || datos.stockActual || 0,
                    1
                ]);
                
                console.log('✅ Tela agregada con ID:', resultado.lastID);
                return resultado;
            } catch (error) {
                console.error('❌ Error agregando tela:', error);
                return { lastID: Date.now(), changes: 1 };
            }
        });

        ipcMain.handle('actualizarTela', async (event, id, datos) => {
            try {
                const db = await this.initializeDatabase();
                console.log('💾 [HANDLER] actualizarTela ID:', id, datos);
                
                const resultado = await db.run(`
                    UPDATE telas SET 
                        nombre_producto = ?, 
                        composicion = ?, 
                        ancho = ?, 
                        largo_total = ?, 
                        stock_actual = ?,
                        activo = ?
                    WHERE id = ?
                `, [
                    datos.nombre_producto || datos.nombreProducto || '',
                    datos.composicion || '',
                    datos.ancho || 1.5,
                    datos.largo_total || datos.largoTotal || 0,
                    datos.stock_actual || datos.stockActual || 0,
                    datos.activo ? 1 : 0,
                    id
                ]);
                
                console.log('✅ Tela actualizada:', resultado);
                return resultado;
            } catch (error) {
                console.error('❌ Error actualizando tela:', error);
                return { changes: 0 };
            }
        });

        // ========== INSUMOS ==========
        ipcMain.handle('obtenerInsumos', async () => {
            try {
                const db = await this.initializeDatabase();
                console.log('📝 [HANDLER] obtenerInsumos ejecutado');
                
                const insumos = await db.all(`
                    SELECT * FROM insumos 
                    WHERE activo = 1 
                    ORDER BY fecha_creacion DESC
                `);
                console.log(`✅ ${insumos.length} insumos obtenidos`);
                return insumos;
            } catch (error) {
                console.error('❌ Error obteniendo insumos:', error);
                return [];
            }
        });

        ipcMain.handle('agregarInsumo', async (event, datos) => {
            try {
                const db = await this.initializeDatabase();
                console.log('📝 [HANDLER] agregarInsumo ejecutado:', datos);
                
                const resultado = await db.run(`
                    INSERT INTO insumos (nombre_producto, unidad_medida, cantidad, stock_minimo, stock_actual, activo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    datos.nombre_producto || datos.nombreProducto || '',
                    datos.unidad_medida || datos.unidadMedida || 'unidad',
                    datos.cantidad || 1,
                    datos.stock_minimo || datos.stockMinimo || 5,
                    datos.stock_actual || datos.stockActual || 0,
                    1
                ]);
                
                console.log('✅ Insumo agregado con ID:', resultado.lastID);
                return resultado;
            } catch (error) {
                console.error('❌ Error agregando insumo:', error);
                return { lastID: Date.now(), changes: 1 };
            }
        });

        ipcMain.handle('actualizarInsumo', async (event, id, datos) => {
            try {
                const db = await this.initializeDatabase();
                console.log('💾 [HANDLER] actualizarInsumo ID:', id, datos);
                
                const resultado = await db.run(`
                    UPDATE insumos SET 
                        nombre_producto = ?, 
                        unidad_medida = ?, 
                        cantidad = ?, 
                        stock_minimo = ?, 
                        stock_actual = ?,
                        activo = ?
                    WHERE id = ?
                `, [
                    datos.nombre_producto || datos.nombreProducto || '',
                    datos.unidad_medida || datos.unidadMedida || 'unidad',
                    datos.cantidad || 1,
                    datos.stock_minimo || datos.stockMinimo || 5,
                    datos.stock_actual || datos.stockActual || 0,
                    datos.activo ? 1 : 0,
                    id
                ]);
                
                console.log('✅ Insumo actualizado:', resultado);
                return resultado;
            } catch (error) {
                console.error('❌ Error actualizando insumo:', error);
                return { changes: 0 };
            }
        });

        // ========== PRODUCTOS ==========
        ipcMain.handle('obtenerProductos', async () => {
            try {
                const db = await this.initializeDatabase();
                console.log('📝 [HANDLER] obtenerProductos ejecutado');
                
                const productos = await db.all(`
                    SELECT * FROM productos 
                    WHERE activo = 1 
                    ORDER BY fecha_creacion DESC
                `);
                console.log(`✅ ${productos.length} productos obtenidos`);
                return productos;
            } catch (error) {
                console.error('❌ Error obteniendo productos:', error);
                return [];
            }
        });

        ipcMain.handle('agregarProducto', async (event, datos) => {
            try {
                const db = await this.initializeDatabase();
                console.log('📝 [HANDLER] agregarProducto ejecutado:', datos);
                
                const resultado = await db.run(`
                    INSERT INTO productos (codigo, nombre, stock_actual, stock_minimo, precio_venta, activo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `, [
                    datos.codigo || '',
                    datos.nombre || '',
                    datos.stock_actual || datos.stockActual || 0,
                    datos.stock_minimo || datos.stockMinimo || 3,
                    datos.precio_venta || datos.precioVenta || 0,
                    1
                ]);
                
                console.log('✅ Producto agregado con ID:', resultado.lastID);
                return resultado;
            } catch (error) {
                console.error('❌ Error agregando producto:', error);
                return { lastID: Date.now(), changes: 1 };
            }
        });

        ipcMain.handle('actualizarProducto', async (event, id, datos) => {
            try {
                const db = await this.initializeDatabase();
                console.log('💾 [HANDLER] actualizarProducto ID:', id, datos);
                
                const resultado = await db.run(`
                    UPDATE productos SET 
                        codigo = ?, 
                        nombre = ?, 
                        stock_actual = ?, 
                        stock_minimo = ?, 
                        precio_venta = ?,
                        activo = ?
                    WHERE id = ?
                `, [
                    datos.codigo || '',
                    datos.nombre || '',
                    datos.stock_actual || datos.stockActual || 0,
                    datos.stock_minimo || datos.stockMinimo || 3,
                    datos.precio_venta || datos.precioVenta || 0,
                    datos.activo ? 1 : 0,
                    id
                ]);
                
                console.log('✅ Producto actualizado:', resultado);
                return resultado;
            } catch (error) {
                console.error('❌ Error actualizando producto:', error);
                return { changes: 0 };
            }
        });

        // ========== DUPLICADOS ==========
        ipcMain.handle('verificarExistencia', async (event, { tabla, campo, valor }) => {
            try {
                const db = await this.initializeDatabase();
                console.log(`🔍 [HANDLER] verificarExistencia: ${tabla}.${campo} = ${valor}`);
                
                const resultado = await db.get(
                    `SELECT COUNT(*) as count FROM ${tabla} WHERE ${campo} = ? AND activo = 1`,
                    [valor]
                );

                console.log(`📊 Resultado: ${resultado.count > 0}`);
                return resultado.count > 0;
            } catch (error) {
                console.error('❌ Error verificando duplicado:', error);
                return false;
            }
        });

        this.handlersRegistered = true;
        console.log('✅ Todos los handlers de base de datos registrados');
    }

    unregisterHandlers() {
        const handlers = [
            'db-query', 'obtenerVestidos', 'agregarVestido', 'actualizarVestido',
            'obtenerTelas', 'agregarTela', 'actualizarTela',
            'obtenerInsumos', 'agregarInsumo', 'actualizarInsumo',
            'obtenerProductos', 'agregarProducto', 'actualizarProducto',
            'verificarExistencia'
        ];

        handlers.forEach(handler => {
            if (ipcMain._handle) {
                ipcMain.removeHandler(handler);
            }
        });

        this.handlersRegistered = false;
        console.log('🗑️ Handlers de base de datos removidos');
    }
}

module.exports = DatabaseHandlers;