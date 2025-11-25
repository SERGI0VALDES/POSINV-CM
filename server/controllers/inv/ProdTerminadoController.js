const getDatabase = require('../../database/connection.js');
const db = getDatabase();

class ProdTerminadoController {
    // Obtener todos los productos terminados
    static getAll() {
        try {
            return db.prepare(`
                SELECT 
                    pt.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM PROD_TERMINADO pt
                JOIN PRODUCTO_BASE pb ON pt.idProducto = pb.idProducto
                WHERE pb.activo = 1
                ORDER BY pb.nombre
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo productos terminados: ' + error.message);
        }
    }

    // Obtener por ID
    static getById(id) {
        try {
            return db.prepare(`
                SELECT 
                    pt.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta,
                    pb.activo
                FROM PROD_TERMINADO pt
                JOIN PRODUCTO_BASE pb ON pt.idProducto = pb.idProducto
                WHERE pt.int = ?
            `).get(id);
        } catch (error) {
            throw new Error('Error obteniendo producto terminado: ' + error.message);
        }
    }

    // Obtener por SKU
    static getBySku(codigoSku) {
        try {
   
            return db.prepare(`
                SELECT 
                    pt.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM PROD_TERMINADO pt
                JOIN PRODUCTO_BASE pb ON pt.idProducto = pb.idProducto
                WHERE pt.codigoSku = ?
            `).get(codigoSku);
        } catch (error) {
            throw new Error('Error obteniendo producto por SKU: ' + error.message);
        }
    }

    // Crear producto terminado
    static create(data) {
        try {
            
            const transaction = db.transaction((prodData) => {
                const {
                    idProducto,
                    nombre,
                    codigoSku,
                    tipoProducto,
                    stockActual = 0,
                    stockMinimo = 0,
                    precioVenta,
                    activo = 1
                } = prodData;

                // 1. Crear producto base
                const stmtProducto = db.prepare(`
                    INSERT INTO PRODUCTO_BASE (idProducto, nombre, stockActual, stockMinimo, precioVenta, activo)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                const productoResult = stmtProducto.run(idProducto, nombre, stockActual, stockMinimo, precioVenta, activo);

                // 2. Crear producto terminado
                const stmtProd = db.prepare(`
                    INSERT INTO PROD_TERMINADO (idProducto, codigoSku, tipoProducto)
                    VALUES (?, ?, ?)
                `);
                const result = stmtProd.run(idProducto, codigoSku, tipoProducto);

                // 3. Obtener el producto creado
                return db.prepare(`
                    SELECT 
                        pt.*,
                        pb.nombre as nombreProducto,
                        pb.stockActual,
                        pb.stockMinimo,
                        pb.precioVenta,
                        pb.activo
                    FROM PROD_TERMINADO pt
                    JOIN PRODUCTO_BASE pb ON pt.idProducto = pb.idProducto
                    WHERE pt.int = ?
                `).get(result.lastInsertRowid);
            });

            return transaction(data);
        } catch (error) {
            throw new Error('Error creando producto terminado: ' + error.message);
        }
    }

    // Actualizar producto terminado
    static update(id, data) {
        try {
            
            const transaction = db.transaction((updateData) => {
                const { codigoSku, tipoProducto, nombre, precioVenta, stockMinimo } = updateData;

                // 1. Obtener idProducto
                const producto = db.prepare('SELECT idProducto FROM PROD_TERMINADO WHERE int = ?').get(id);
                if (!producto) {
                    throw new Error('Producto no encontrado');
                }

                // 2. Actualizar producto base
                const stmtProducto = db.prepare(`
                    UPDATE PRODUCTO_BASE 
                    SET nombre = ?, precioVenta = ?, stockMinimo = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE idProducto = ?
                `);
                stmtProducto.run(nombre, precioVenta, stockMinimo, producto.idProducto);

                // 3. Actualizar producto terminado
                const stmtProd = db.prepare(`
                    UPDATE PROD_TERMINADO 
                    SET codigoSku = ?, tipoProducto = ?
                    WHERE int = ?
                `);
                stmtProd.run(codigoSku, tipoProducto, id);

                // 4. Retornar el producto actualizado
                return db.prepare(`
                    SELECT 
                        pt.*,
                        pb.nombre as nombreProducto,
                        pb.stockActual,
                        pb.stockMinimo,
                        pb.precioVenta,
                        pb.activo
                    FROM PROD_TERMINADO pt
                    JOIN PRODUCTO_BASE pb ON pt.idProducto = pb.idProducto
                    WHERE pt.int = ?
                `).get(id);
            });

            return transaction(data);
        } catch (error) {
            throw new Error('Error actualizando producto terminado: ' + error.message);
        }
    }

    // Eliminar (desactivar)
    static delete(id) {
        try {
         
            const producto = db.prepare('SELECT idProducto FROM PROD_TERMINADO WHERE int = ?').get(id);
            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            const stmt = db.prepare('UPDATE PRODUCTO_BASE SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE idProducto = ?');
            const result = stmt.run(producto.idProducto);
            
            return {
                changes: result.changes,
                message: 'Producto desactivado correctamente'
            };
        } catch (error) {
            throw new Error('Error eliminando producto: ' + error.message);
        }
    }

    // Obtener por tipo
    static getByTipo(tipoProducto) {
        try {
            
            return db.prepare(`
                SELECT 
                    pt.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM PROD_TERMINADO pt
                JOIN PRODUCTO_BASE pb ON pt.idProducto = pb.idProducto
                WHERE pt.tipoProducto = ? AND pb.activo = 1
                ORDER BY pb.nombre
            `).all(tipoProducto);
        } catch (error) {
            throw new Error('Error obteniendo productos por tipo: ' + error.message);
        }
    }

    // ✅ MÉTODOS ADICIONALES ÚTILES:

    // Obtener productos con stock bajo
    static getBajoStock() {
        try {
           
            return db.prepare(`
                SELECT 
                    pt.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.stockMinimo,
                    pb.precioVenta
                FROM PROD_TERMINADO pt
                JOIN PRODUCTO_BASE pb ON pt.idProducto = pb.idProducto
                WHERE pb.stockActual <= pb.stockMinimo AND pb.activo = 1
                ORDER BY (pb.stockMinimo - pb.stockActual) DESC
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo productos con stock bajo: ' + error.message);
        }
    }

    // Obtener tipos de productos únicos
    static getTipos() {
        try {
            
            return db.prepare(`
                SELECT DISTINCT tipoProducto 
                FROM PROD_TERMINADO 
                ORDER BY tipoProducto
            `).all();
        } catch (error) {
            throw new Error('Error obteniendo tipos de productos: ' + error.message);
        }
    }

    // Buscar productos por nombre
    static search(nombre) {
        try {
           
            return db.prepare(`
                SELECT 
                    pt.*,
                    pb.nombre as nombreProducto,
                    pb.stockActual,
                    pb.precioVenta
                FROM PROD_TERMINADO pt
                JOIN PRODUCTO_BASE pb ON pt.idProducto = pb.idProducto
                WHERE pb.nombre LIKE ? AND pb.activo = 1
                ORDER BY pb.nombre
            `).all(`%${nombre}%`);
        } catch (error) {
            throw new Error('Error buscando productos: ' + error.message);
        }
    }
}

module.exports = ProdTerminadoController;