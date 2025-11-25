const getDatabase = require('../../database/connection.js');
const db = getDatabase();

class InventarioController {
    // Obtener todos los movimientos
    static getAll() {
        try {
            return db.prepare('SELECT * FROM v_movimientos_inventario LIMIT 100').all();
        } catch (error) {
            throw new Error('Error obteniendo movimientos: ' + error.message);
        }
    }

    // Registrar movimiento de inventario
    static registrarMovimiento(data) {
        try {
            const { idMovimiento, tipoMovimiento, cantidad, origen, idProducto, idUsuario } = data;
            
            const stmt = db.prepare(`
                INSERT INTO MOV_INVENTARIO (idMovimiento, tipoMovimiento, cantidad, origen, idProducto, idUsuario)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            const result = stmt.run(idMovimiento, tipoMovimiento, cantidad, origen, idProducto, idUsuario);
            
            return {
                success: true,
                movimientoId: result.lastInsertRowid
            };
        } catch (error) {
            throw new Error('Error registrando movimiento: ' + error.message);
        }
    }

    // Movimientos por producto
    static getByProducto(idProducto) {
        try {
            return db.prepare(`
                SELECT * FROM v_movimientos_inventario 
                WHERE nombreProducto IN (SELECT nombre FROM PRODUCTO_BASE WHERE idProducto = ?)
                ORDER BY fechaMovimiento DESC
            `).all(idProducto);
        } catch (error) {
            throw new Error('Error obteniendo movimientos del producto: ' + error.message);
        }
    }

    // Movimientos por tipo
    static getByTipo(tipoMovimiento) {
        try {
            return db.prepare(`
                SELECT * FROM v_movimientos_inventario 
                WHERE tipoMovimiento = ?
                ORDER BY fechaMovimiento DESC
                LIMIT 50
            `).all(tipoMovimiento);
        } catch (error) {
            throw new Error('Error obteniendo movimientos por tipo: ' + error.message);
        }
    }
}

module.exports = InventarioController;