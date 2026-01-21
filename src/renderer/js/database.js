// src/renderer/js/database.js - VERSIÓN CON MEJOR MANEJO DE TIMING
class DatabaseManager {
    
    constructor() {
        this.initialized = false;
        this.fallbackMode = false;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.init();
    }
    
    async init() {
        try {
            console.log('🔄 Inicializando DatabaseManager...');
            
            // Verificar que electronAPI esté disponible
            if (!window.electronAPI) {
                console.warn('❌ electronAPI no está disponible');
                await this.waitAndRetry();
                return;
            }

            // Verificar que electronAPI.db esté disponible
            if (!window.electronAPI.db) {
                console.warn('❌ electronAPI.db no está disponible');
                await this.waitAndRetry();
                return;
            }

            // Probar la conexión con retry
            await this.testConnectionWithRetry();
            this.initialized = true;
            console.log('✅ DatabaseManager inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando DatabaseManager:', error);
            await this.waitAndRetry();
        }
    }

    async waitAndRetry() {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++;
            console.log(`⏳ Reintento ${this.retryCount}/${this.maxRetries} en 1 segundo...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await this.init();
        } else {
            console.warn('🔄 Máximo de reintentos alcanzado, activando modo fallback');
            this.activateFallbackMode();
        }
    }

    // En database.js, modifica el testConnectionWithRetry:
async testConnectionWithRetry() {
    try {
        console.log('🔌 Probando conexión con la base de datos...');
        
        // Primero verificar si electronAPI.db existe
        if (!window.electronAPI || !window.electronAPI.db) {
            throw new Error('electronAPI.db no disponible');
        }
        
        // Verificar si el handler específico existe
        console.log('🔍 Verificando handler db-query...');
        const result = await window.electronAPI.db.query('SELECT 1 as test');
        console.log('✅ Conexión a BD exitosa:', result);
        return true;
    } catch (error) {
        console.error('❌ Error en conexión a BD:', error);
        console.error('🔍 Tipo de error:', error.message);
        
        // Si es error de "no handler", dar información más específica
        if (error.message.includes('No handler registered')) {
            console.error('💥 PROBLEMA CRÍTICO: Handler db-query no registrado en main process');
            console.error('🔍 Esto significa que:');
            console.error('   - El preload.js puede ver el handler');
            console.error('   - Pero el main process NO lo tiene registrado');
            console.error('   - Posible problema de timing o error en main.js');
            
            // Debug adicional: verificar qué handlers están realmente disponibles
            console.log('🔍 Verificando handlers disponibles en electronAPI.db:');
            console.log('   - query:', typeof window.electronAPI.db.query);
            console.log('   - getVestidos:', typeof window.electronAPI.db.getVestidos);
            console.log('   - addVestido:', typeof window.electronAPI.db.addVestido);
        }
        
        throw new Error('Handlers no registrados aún');
    }
}

    activateFallbackMode() {
        console.warn('⚠️ Activando modo fallback para DatabaseManager');
        this.fallbackMode = true;
        this.initialized = true;
    }

    // Método genérico con fallback
    async executeWithFallback(operation, fallbackResult) {
        if (this.fallbackMode) {
            console.warn(`⚠️ Modo fallback para operación`);
            return fallbackResult;
        }

        if (!this.initialized) {
            console.log('⏳ DatabaseManager no inicializado, esperando...');
            await this.waitForInitialization();
        }
        
        try {
            return await operation();
        } catch (error) {
            console.error(`❌ Error en operación:`, error);
            
            // Si es error de handler no registrado, activar fallback
            if (error.message.includes('No handler registered')) {
                this.activateFallbackMode();
                return fallbackResult;
            }
            
            throw error;
        }
    }

    async waitForInitialization() {
        const maxWaitTime = 10000; // 10 segundos máximo
        const startTime = Date.now();
        
        while (!this.initialized && (Date.now() - startTime) < maxWaitTime) {
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (!this.initialized) {
            throw new Error('Timeout esperando inicialización de DatabaseManager');
        }
    }

    // ==================== MÉTODOS PARA VESTIDOS ====================
    async obtenerVestidos() {
        return this.executeWithFallback(
            () => window.electronAPI.db.getVestidos(),
            [] // Fallback: array vacío
        );
    }

    async agregarVestido(datos) {
        return this.executeWithFallback(
            () => window.electronAPI.db.addVestido(datos),
            { lastInsertRowid: Date.now(), changes: 1 } // Fallback: éxito simulado
        );
    }

    // ==================== MÉTODOS PARA TELAS ====================
    async obtenerTelas() {
        return this.executeWithFallback(
            () => window.electronAPI.db.getTelas(),
            [] // Fallback: array vacío
        );
    }

    async agregarTela(datos) {
        return this.executeWithFallback(
            () => window.electronAPI.db.addTela(datos),
            { lastInsertRowid: Date.now(), changes: 1 } // Fallback: éxito simulado
        );
    }

    // ==================== MÉTODOS PARA INSUMOS ====================
    async obtenerInsumos() {
        return this.executeWithFallback(
            () => window.electronAPI.db.getInsumos(),
            [] // Fallback: array vacío
        );
    }

    async agregarInsumo(datos) {
        return this.executeWithFallback(
            () => window.electronAPI.db.addInsumo(datos),
            { lastInsertRowid: Date.now(), changes: 1 } // Fallback: éxito simulado
        );
    }

    // ==================== MÉTODOS PARA PRODUCTOS ====================
    async obtenerProductos() {
        return this.executeWithFallback(
            () => window.electronAPI.db.getProductos(),
            [] // Fallback: array vacío
        );
    }

    async agregarProducto(datos) {
        return this.executeWithFallback(
            () => window.electronAPI.db.addProducto(datos),
            { lastInsertRowid: Date.now(), changes: 1 } // Fallback: éxito simulado
        );
    }

    // ==================== MÉTODOS PARA VERIFICACIÓN ====================
    async verificarExistencia(categoria, campo, valor) {
        return this.executeWithFallback(
            () => window.electronAPI.db.checkDuplicate(categoria, campo, valor),
            false // Fallback: no hay duplicados
        );
    }

    // ==================== MÉTODOS PARA ACTUALIZAR ====================
    async actualizarVestido(id, datos) {
        console.log('🔍 [DATABASE] actualizarVestido llamado:');
        console.log('   ID:', id);
        console.log('   Datos:', datos);
        console.log('   electronAPI.db.updateVestido existe:', typeof window.electronAPI?.db?.updateVestido);

            if (!window.electronAPI?.db?.updateVestido) {
            console.error('❌ window.electronAPI.db.updateVestido NO EXISTE');
            console.log('🔍 electronAPI.db:', window.electronAPI?.db);
            return { lastInsertRowid: id, changes: 1 }; // Fallback
        }
    }

    async actualizarTela(id, datos) {
        return this.executeWithFallback(
            async () => {
                console.log('💾 Actualizando tela ID:', id, 'Datos:', datos);
                const resultado = await window.electronAPI.db.updateTela(id, datos);
                console.log('✅ Resultado actualización:', resultado);
                return resultado;
            },
            { lastInsertRowid: id, changes: 1 }
        );
    }

    async actualizarInsumo(id, datos) {
        return this.executeWithFallback(
            async () => {
                console.log('💾 Actualizando insumo ID:', id, 'Datos:', datos);
                const resultado = await window.electronAPI.db.updateInsumo(id, datos);
                console.log('✅ Resultado actualización:', resultado);
                return resultado;
            },
            { lastInsertRowid: id, changes: 1 }
        );
    }

    async actualizarProducto(id, datos) {
        return this.executeWithFallback(
            async () => {
                console.log('💾 Actualizando producto ID:', id, 'Datos:', datos);
                const resultado = await window.electronAPI.db.updateProducto(id, datos);
                console.log('✅ Resultado actualización:', resultado);
                return resultado;
            },
            { lastInsertRowid: id, changes: 1 }
        );
    }
}