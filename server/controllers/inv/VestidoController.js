const getDatabase = require('../../database/connection.js');
const db = getDatabase();

class VestidoController {
    // Obtener todos los vestidos
    static getAll() {
        try {
            return db.prepare(`
                SELECT 
                    v.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM VESTIDO v
                JOIN PRODUCTO_BASE pb ON v.idProducto = pb.idProducto
                WHERE pb.activo = 1
                ORDER BY pb.nombre
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo vestidos: ' + error.message);
        }
    }

    // Obtener vestido por ID
    static getById(id) {
        try {
            return db.prepare(`
                SELECT 
                    v.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM VESTIDO v
                JOIN PRODUCTO_BASE pb ON v.idProducto = pb.idProducto
                WHERE v.int = ?
            `).get(id);
        } catch (error) {
            throw new Error('Error obteniendo vestido: ' + error.message);
        }
    }

    // Obtener vestido por SKU
    static getBySku(codigoSku) {
        try {
            return db.prepare(`
                SELECT 
                    v.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM VESTIDO v
                JOIN PRODUCTO_BASE pb ON v.idProducto = pb.idProducto
                WHERE v.codigoSku = ?
            `).get(codigoSku);
        } catch (error) {
            throw new Error('Error obteniendo vestido por SKU: ' + error.message);
        }
    }

    // Obtener vestido por idProducto
    static getByProductoId(idProducto) {
        try {
            return db.prepare(`
                SELECT 
                    v.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM VESTIDO v
                JOIN PRODUCTO_BASE pb ON v.idProducto = pb.idProducto
                WHERE v.idProducto = ?
            `).get(idProducto);
        } catch (error) {
            throw new Error('Error obteniendo vestido por producto: ' + error.message);
        }
    }

    // Crear vestido (con producto base)
    static create(data) {
        const transaction = db.transaction((vestidoData) => {
            try {
                const {
                    idProducto,
                    nombre,
                    color,
                    codigoSku,
                    stockActual = 0,
                    stockMinimo = 0,
                    precioVenta,
                    activo = 1
                } = vestidoData;

                // 1. Crear producto base
                const stmtProducto = db.prepare(`
                    INSERT INTO PRODUCTO_BASE (idProducto, nombre, stockActual, stockMinimo, precioVenta, activo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                stmtProducto.run(idProducto, nombre, stockActual, stockMinimo, precioVenta, activo);

                // 2. Crear vestido
                const stmtVestido = db.prepare(`
                    INSERT INTO VESTIDO (idProducto, color, codigoSku)
                    VALUES (?, ?, ?)
                `);
                const result = stmtVestido.run(idProducto, color, codigoSku);

                return this.getById(result.lastInsertRowid);
            } catch (error) {
                throw error;
            }
        });

        try {
            return transaction(data);
        } catch (error) {
            throw new Error('Error creando vestido: ' + error.message);
        }
    }

    // Actualizar vestido
    static update(id, data) {
        const transaction = db.transaction((updateData) => {
            try {
                const { color, codigoSku, nombre, precioVenta, stockMinimo } = updateData;

                // 1. Obtener idProducto del vestido
                const vestido = db.prepare('SELECT idProducto FROM VESTIDO WHERE int = ?').get(id);
                if (!vestido) {
                    throw new Error('Vestido no encontrado');
                }

                // 2. Actualizar producto base
                const stmtProducto = db.prepare(`
                    UPDATE PRODUCTO_BASE 
                    SET nombre = ?, precioVenta = ?, stockMinimo = ?
                    WHERE idProducto = ?
                `);
                stmtProducto.run(nombre, precioVenta, stockMinimo, vestido.idProducto);

                // 3. Actualizar vestido
                const stmtVestido = db.prepare(`
                    UPDATE VESTIDO 
                    SET color = ?, codigoSku = ?
                    WHERE int = ?
                `);
                stmtVestido.run(color, codigoSku, id);

                return this.getById(id);
            } catch (error) {
                throw error;
            }
        });

        try {
            return transaction(data);
        } catch (error) {
            throw new Error('Error actualizando vestido: ' + error.message);
        }
    }

    // Eliminar vestido (desactiva el producto base)
    static delete(id) {
        try {
            // Obtener idProducto
            const vestido = db.prepare('SELECT idProducto FROM VESTIDO WHERE int = ?').get(id);
            if (!vestido) {
                throw new Error('Vestido no encontrado');
            }

            // Desactivar producto base
            const stmt = db.prepare('UPDATE PRODUCTO_BASE SET activo = 0 WHERE idProducto = ?');
            return stmt.run(vestido.idProducto);
        } catch (error) {
            throw new Error('Error eliminando vestido: ' + error.message);
        }
    }

    // Buscar vestidos por color
    static getByColor(color) {
        try {
            return db.prepare(`
                SELECT 
                    v.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM VESTIDO v
                JOIN PRODUCTO_BASE pb ON v.idProducto = pb.idProducto
                WHERE v.color LIKE ? AND pb.activo = 1
                ORDER BY pb.nombre
            `).all(`%${color}%`);
        } catch (error) {
            throw new Error('Error buscando vestidos por color: ' + error.message);
        }
    }

    // Obtener vestidos disponibles (con stock)
    static getDisponibles() {
        try {
            return db.prepare(`
                SELECT 
                    v.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM VESTIDO v
                JOIN PRODUCTO_BASE pb ON v.idProducto = pb.idProducto
                WHERE pb.stockActual > 0 AND pb.activo = 1
                ORDER BY pb.stockActual DESC
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo vestidos disponibles: ' + error.message);
        }
    }

    // Obtener estadísticas de vestidos
    static getEstadisticas() {
        try {
            const result = db.prepare(`
                SELECT 
                    COUNT(*) as totalVestidos,
                    COUNT(DISTINCT v.color) as totalColores,
                    SUM(pb.stockActual) as unidadesTotales,
                    SUM(pb.stockActual * pb.precioVenta) as valorInventario,
                    AVG(pb.precioVenta) as precioPromedio
                FROM VESTIDO v
                JOIN PRODUCTO_BASE pb ON v.idProducto = pb.idProducto
                WHERE pb.activo = 1
            `).get();
            return result;
        } catch (error) {
            throw new Error('Error obteniendo estadísticas de vestidos: ' + error.message);
        }
    }

    // Colores disponibles
    static getColores() {
        try {
            return db.prepare(`
                SELECT DISTINCT color, COUNT(*) as cantidad
                FROM VESTIDO v
                JOIN PRODUCTO_BASE pb ON v.idProducto = pb.idProducto
                WHERE pb.activo = 1
                GROUP BY color
                ORDER BY color
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo colores: ' + error.message);
        }
    }
}

module.exports = VestidoController;