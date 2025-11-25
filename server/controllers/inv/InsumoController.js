const getDatabase = require('../../database/connection.js');
const db = getDatabase();

class InsumoController {
    // Obtener todos los insumos
    static getAll() {
        try {
            
            return db.prepare(`
                SELECT 
                    i.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta,
                    pb.activo
                FROM INSUMO i
                JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                WHERE pb.activo = 1
                ORDER BY pb.nombre
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo insumos: ' + error.message);
        }
    }

    // Obtener insumo por ID
    static getById(id) {
        try {
            
            return db.prepare(`
                SELECT 
                    i.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM INSUMO i
                JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                WHERE i.int = ?
            `).get(id);
        } catch (error) {
            throw new Error('Error obteniendo insumo: ' + error.message);
        }
    }

    // Obtener insumo por idProducto
    static getByProductoId(idProducto) {
        try {
            
            return db.prepare(`
                SELECT 
                    i.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM INSUMO i
                JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                WHERE i.idProducto = ?
            `).get(idProducto);
        } catch (error) {
            throw new Error('Error obteniendo insumo por producto: ' + error.message);
        }
    }

    // Crear insumo (con producto base)
    static create(data) {
        try {
            
            const transaction = db.transaction((insumoData) => {
                const {
                    idProducto,
                    nombre,
                    nombreInsumo,
                    unidadMedida = 'unidad',
                    ancho,
                    longitudTotal,
                    stockActual = 0,
                    stockMinimo = 0,
                    precioVenta,
                    activo = 1
                } = insumoData;

                // 1. Crear producto base
                const stmtProducto = db.prepare(`
                    INSERT INTO PRODUCTO_BASE (idProducto, nombre, stockActual, stockMinimo, precioVenta, activo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                stmtProducto.run(idProducto, nombre, stockActual, stockMinimo, precioVenta, activo);

                // 2. Crear insumo
                const stmtInsumo = db.prepare(`
                    INSERT INTO INSUMO (idProducto, nombreInsumo, unidadMedida, ancho, longitudTotal)
                    VALUES (?, ?, ?, ?, ?)
                `);
                const result = stmtInsumo.run(idProducto, nombreInsumo, unidadMedida, ancho, longitudTotal);

                // 3. Retornar el insumo creado
                return db.prepare(`
                    SELECT 
                        i.*,
                        pb.nombre as nombreProducto,
                        pb.stockActual,
                        pb.stockMinimo,
                        pb.precioVenta,
                        pb.activo
                    FROM INSUMO i
                    JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                    WHERE i.int = ?
                `).get(result.lastInsertRowid);
            });

            return transaction(data);
        } catch (error) {
            throw new Error('Error creando insumo: ' + error.message);
        }
    }

    // Actualizar insumo
    static update(id, data) {
        try {
            
            const transaction = db.transaction((updateData) => {
                const { nombreInsumo, unidadMedida, ancho, longitudTotal, nombre, precioVenta, stockMinimo } = updateData;

                // 1. Obtener idProducto del insumo
                const insumo = db.prepare('SELECT idProducto FROM INSUMO WHERE int = ?').get(id);
                if (!insumo) {
                    throw new Error('Insumo no encontrado');
                }

                // 2. Actualizar producto base
                const stmtProducto = db.prepare(`
                    UPDATE PRODUCTO_BASE 
                    SET nombre = ?, precioVenta = ?, stockMinimo = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE idProducto = ?
                `);
                stmtProducto.run(nombre, precioVenta, stockMinimo, insumo.idProducto);

                // 3. Actualizar insumo
                const stmtInsumo = db.prepare(`
                    UPDATE INSUMO 
                    SET nombreInsumo = ?, unidadMedida = ?, ancho = ?, longitudTotal = ?
                    WHERE int = ?
                `);
                stmtInsumo.run(nombreInsumo, unidadMedida, ancho, longitudTotal, id);

                // 4. Retornar el insumo actualizado
                return db.prepare(`
                    SELECT 
                        i.*,
                        pb.nombre as nombreProducto,
                        pb.stockActual,
                        pb.stockMinimo,
                        pb.precioVenta,
                        pb.activo
                    FROM INSUMO i
                    JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                    WHERE i.int = ?
                `).get(id);
            });

            return transaction(data);
        } catch (error) {
            throw new Error('Error actualizando insumo: ' + error.message);
        }
    }

    // Eliminar insumo (desactiva el producto base)
    static delete(id) {
        try {
             // ✅ FALTABA ESTO
            
            // Obtener idProducto
            const insumo = db.prepare('SELECT idProducto FROM INSUMO WHERE int = ?').get(id);
            if (!insumo) {
                throw new Error('Insumo no encontrado');
            }

            // Desactivar producto base
            const stmt = db.prepare('UPDATE PRODUCTO_BASE SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE idProducto = ?');
            const result = stmt.run(insumo.idProducto);
            
            return {
                changes: result.changes,
                message: 'Insumo desactivado correctamente'
            };
        } catch (error) {
            throw new Error('Error eliminando insumo: ' + error.message);
        }
    }

    // Buscar insumos por unidad de medida
    static getByUnidad(unidadMedida) {
        try {
             // ✅ FALTABA ESTO
            
            return db.prepare(`
                SELECT 
                    i.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM INSUMO i
                JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                WHERE i.unidadMedida = ? AND pb.activo = 1
                ORDER BY pb.nombre
            `).all(unidadMedida);
        } catch (error) {
            throw new Error('Error buscando insumos por unidad: ' + error.message);
        }
    }

    // Calcular metros totales disponibles
    static getTotalMetros() {
        try {
             // ✅ FALTABA ESTO
            
            const result = db.prepare(`
                SELECT 
                    SUM(i.longitudTotal) as totalMetros,
                    COUNT(*) as totalInsumos
                FROM INSUMO i
                JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                WHERE pb.activo = 1 AND i.unidadMedida = 'metro'
            `).get();
            return result;
        } catch (error) {
            throw new Error('Error calculando metros totales: ' + error.message);
        }
    }

    // ✅ MÉTODOS ADICIONALES ÚTILES:

    // Obtener unidades de medida disponibles
    static getUnidadesMedida() {
        try {
            
            return db.prepare(`
                SELECT DISTINCT unidadMedida 
                FROM INSUMO 
                ORDER BY unidadMedida
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo unidades de medida: ' + error.message);
        }
    }

    // Buscar insumos por nombre
    static search(nombre) {
        try {
            
            return db.prepare(`
                SELECT 
                    i.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM INSUMO i
                JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                WHERE (pb.nombre LIKE ? OR i.nombreInsumo LIKE ?) AND pb.activo = 1
                ORDER BY pb.nombre
            `).all(`%${nombre}%`, `%${nombre}%`);
        } catch (error) {
            throw new Error('Error buscando insumos: ' + error.message);
        }
    }

    // Obtener insumos con stock bajo
    static getBajoStock() {
        try {
            
            return db.prepare(`
                SELECT 
                    i.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta
                FROM INSUMO i
                JOIN PRODUCTO_BASE pb ON i.idProducto = pb.idProducto
                WHERE pb.stockActual <= pb.stockMinimo AND pb.activo = 1
                ORDER BY (pb.stockMinimo - pb.stockActual) DESC
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo insumos con stock bajo: ' + error.message);
        }
    }
}

module.exports = InsumoController;