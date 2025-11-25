const getDatabase = require('../../database/connection.js');
const db = getDatabase();

class TelaController {
    // Obtener todas las telas
    static getAll() {
        try {
            return db.prepare(`
                SELECT 
                    t.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM TELA t
                JOIN PRODUCTO_BASE pb ON t.idProducto = pb.idProducto
                WHERE pb.activo = 1
                ORDER BY pb.nombre
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo telas: ' + error.message);
        }
    }

    // Obtener tela por ID
    static getById(id) {
        try {
            return db.prepare(`
                SELECT 
                    t.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM TELA t
                JOIN PRODUCTO_BASE pb ON t.idProducto = pb.idProducto
                WHERE t.int = ?
            `).get(id);
        } catch (error) {
            throw new Error('Error obteniendo tela: ' + error.message);
        }
    }

    // Obtener tela por idProducto
    static getByProductoId(idProducto) {
        try {
            return db.prepare(`
                SELECT 
                    t.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM TELA t
                JOIN PRODUCTO_BASE pb ON t.idProducto = pb.idProducto
                WHERE t.idProducto = ?
            `).get(idProducto);
        } catch (error) {
            throw new Error('Error obteniendo tela por producto: ' + error.message);
        }
    }

    // Crear tela (con producto base)
    static create(data) {
        const transaction = db.transaction((telaData) => {
            try {
                const {
                    idProducto,
                    nombre,
                    composicion,
                    ancho,
                    longitudTotal,
                    stockActual = 0,
                    stockMinimo = 0,
                    precioVenta,
                    activo = 1
                } = telaData;

                // 1. Crear producto base
                const stmtProducto = db.prepare(`
                    INSERT INTO PRODUCTO_BASE (idProducto, nombre, stockActual, stockMinimo, precioVenta, activo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                stmtProducto.run(idProducto, nombre, stockActual, stockMinimo, precioVenta, activo);

                // 2. Crear tela
                const stmtTela = db.prepare(`
                    INSERT INTO TELA (idProducto, composicion, ancho, longitudTotal)
                    VALUES (?, ?, ?, ?)
                `);
                const result = stmtTela.run(idProducto, composicion, ancho, longitudTotal);

                return this.getById(result.lastInsertRowid);
            } catch (error) {
                throw error;
            }
        });

        try {
            return transaction(data);
        } catch (error) {
            throw new Error('Error creando tela: ' + error.message);
        }
    }

    // Actualizar tela
    static update(id, data) {
        const transaction = db.transaction((updateData) => {
            try {
                const { composicion, ancho, longitudTotal, nombre, precioVenta, stockMinimo } = updateData;

                // 1. Obtener idProducto de la tela
                const tela = db.prepare('SELECT idProducto FROM TELA WHERE int = ?').get(id);
                if (!tela) {
                    throw new Error('Tela no encontrada');
                }

                // 2. Actualizar producto base
                const stmtProducto = db.prepare(`
                    UPDATE PRODUCTO_BASE 
                    SET nombre = ?, precioVenta = ?, stockMinimo = ?
                    WHERE idProducto = ?
                `);
                stmtProducto.run(nombre, precioVenta, stockMinimo, tela.idProducto);

                // 3. Actualizar tela
                const stmtTela = db.prepare(`
                    UPDATE TELA 
                    SET composicion = ?, ancho = ?, longitudTotal = ?
                    WHERE int = ?
                `);
                stmtTela.run(composicion, ancho, longitudTotal, id);

                return this.getById(id);
            } catch (error) {
                throw error;
            }
        });

        try {
            return transaction(data);
        } catch (error) {
            throw new Error('Error actualizando tela: ' + error.message);
        }
    }

    // Eliminar tela (desactiva el producto base)
    static delete(id) {
        try {
            // Obtener idProducto
            const tela = db.prepare('SELECT idProducto FROM TELA WHERE int = ?').get(id);
            if (!tela) {
                throw new Error('Tela no encontrada');
            }

            // Desactivar producto base
            const stmt = db.prepare('UPDATE PRODUCTO_BASE SET activo = 0 WHERE idProducto = ?');
            return stmt.run(tela.idProducto);
        } catch (error) {
            throw new Error('Error eliminando tela: ' + error.message);
        }
    }

    // Buscar telas por composición
    static getByComposicion(composicion) {
        try {
            return db.prepare(`
                SELECT 
                    t.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM TELA t
                JOIN PRODUCTO_BASE pb ON t.idProducto = pb.idProducto
                WHERE t.composicion LIKE ? AND pb.activo = 1
                ORDER BY pb.nombre
            `).all(`%${composicion}%`);
        } catch (error) {
            throw new Error('Error buscando telas por composición: ' + error.message);
        }
    }

    // Obtener estadísticas de telas
    static getEstadisticas() {
        try {
            const result = db.prepare(`
                SELECT 
                    COUNT(*) as totalTelas,
                    SUM(t.longitudTotal) as metrosTotales,
                    AVG(t.ancho) as anchoPromedio,
                    SUM(pb.stockActual * pb.precioVenta) as valorInventario
                FROM TELA t
                JOIN PRODUCTO_BASE pb ON t.idProducto = pb.idProducto
                WHERE pb.activo = 1
            `).get();
            return result;
        } catch (error) {
            throw new Error('Error obteniendo estadísticas de telas: ' + error.message);
        }
    }

    // Telas con longitud baja
    static getBajaLongitud(longitudMinima = 5) {
        try {
            return db.prepare(`
                SELECT 
                    t.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM TELA t
                JOIN PRODUCTO_BASE pb ON t.idProducto = pb.idProducto
                WHERE t.longitudTotal <= ? AND pb.activo = 1
                ORDER BY t.longitudTotal ASC
            `).all(longitudMinima);
        } catch (error) {
            throw new Error('Error obteniendo telas con baja longitud: ' + error.message);
        }
    }
}

module.exports = TelaController;