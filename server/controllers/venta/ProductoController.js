const getDatabase = require('../../database/connection.js');
const db = getDatabase();

class ProductoController {
    
    // Obtener todos los productos
    static getAll() {
        try {
            return db.prepare('SELECT * FROM PRODUCTO_BASE WHERE activo = 1 ORDER BY nombre').all();
        } catch (error) {
            throw new Error('Error obteniendo productos: ' + error.message);
        }
    }

    // Obtener producto por ID
    static getById(idProducto) {
        try {
            return db.prepare('SELECT * FROM PRODUCTO_BASE WHERE idProducto = ?').get(idProducto);
        } catch (error) {
            throw new Error('Error obteniendo producto: ' + error.message);
        }
    }

    // Crear producto base
    static create(data) {
        try {
            const { idProducto, nombre, stockActual = 0, stockMinimo = 0, precioVenta, activo = 1 } = data;
            
            const stmt = db.prepare(`
                INSERT INTO PRODUCTO_BASE (idProducto, nombre, stockActual, stockMinimo, precioVenta, activo)
                VALUES (?, ?, ?, ?, ?, ?)
            `);
            
            stmt.run(idProducto, nombre, stockActual, stockMinimo, precioVenta, activo);
            return this.getById(idProducto);
        } catch (error) {
            throw new Error('Error creando producto: ' + error.message);
        }
    }

    // Actualizar producto
    static update(idProducto, data) {
        try {
            const { nombre, stockActual, stockMinimo, precioVenta, activo } = data;
            
            const stmt = db.prepare(`
                UPDATE PRODUCTO_BASE 
                SET nombre = ?, stockActual = ?, stockMinimo = ?, precioVenta = ?, activo = ?
                WHERE idProducto = ?
            `);
            
            stmt.run(nombre, stockActual, stockMinimo, precioVenta, activo, idProducto);
            return this.getById(idProducto);
        } catch (error) {
            throw new Error('Error actualizando producto: ' + error.message);
        }
    }

    // Actualizar solo stock
    static updateStock(idProducto, nuevoStock) {
        try {
            const stmt = db.prepare('UPDATE PRODUCTO_BASE SET stockActual = ? WHERE idProducto = ?');
            stmt.run(nuevoStock, idProducto);
            return this.getById(idProducto);
        } catch (error) {
            throw new Error('Error actualizando stock: ' + error.message);
        }
    }

    // Eliminar (desactivar) producto
    static delete(idProducto) {
        try {
            const stmt = db.prepare('UPDATE PRODUCTO_BASE SET activo = 0 WHERE idProducto = ?');
            return stmt.run(idProducto);
        } catch (error) {
            throw new Error('Error eliminando producto: ' + error.message);
        }
    }

    // Productos con stock bajo
    static getBajoStock() {
        try {
            return db.prepare('SELECT * FROM v_productos_bajo_stock').all();
        } catch (error) {
            throw new Error('Error obteniendo productos con stock bajo: ' + error.message);
        }
    }
}

module.exports = ProductoController;