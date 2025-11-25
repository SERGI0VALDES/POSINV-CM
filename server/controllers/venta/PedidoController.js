const getDatabase = require('../../database/connection.js');
const db = getDatabase();

class PedidoController {
    // Obtener todos los pedidos
    static getAll() {
        try {
            return db.prepare('SELECT * FROM v_resumen_pedidos ORDER BY fechaVenta DESC').all();
        } catch (error) {
            throw new Error('Error obteniendo pedidos: ' + error.message);
        }
    }

    // Obtener pedido por ID
    static getById(id) {
        try {
            const pedido = db.prepare('SELECT * FROM PEDIDO WHERE int = ?').get(id);
            
            if (pedido) {
                // Obtener items del pedido
                pedido.items = db.prepare(`
                    SELECT ip.*, pb.nombre as nombreProducto 
                    FROM ITEM_PEDIDO ip
                    JOIN PRODUCTO_BASE pb ON ip.idProducto = pb.idProducto
                    WHERE ip.idUltimoPedido = ?
                `).all(id);
            }
            
            return pedido;
        } catch (error) {
            throw new Error('Error obteniendo pedido: ' + error.message);
        }
    }

    // Crear pedido con items
    static create(data) {
        const transaction = db.transaction((pedidoData) => {
            try {
                const { idPedido, items } = pedidoData;
                
                // Insertar pedido
                const stmtPedido = db.prepare(
                    'INSERT INTO PEDIDO (idPedido, estado) VALUES (?, ?)'
                );
                const resultPedido = stmtPedido.run(idPedido, 'Pendiente');
                const pedidoId = resultPedido.lastInsertRowid;
                
                // Insertar items
                const stmtItem = db.prepare(`
                    INSERT INTO ITEM_PEDIDO (idUltimoPedido, idPedido, idProducto, cantidad, precioUnitario, subtotal)
                    VALUES (?, ?, ?, ?, ?, ?)
                `);
                
                items.forEach(item => {
                    const subtotal = item.cantidad * item.precioUnitario;
                    stmtItem.run(pedidoId, pedidoId, item.idProducto, item.cantidad, item.precioUnitario, subtotal);
                });
                
                return this.getById(pedidoId);
            } catch (error) {
                throw error;
            }
        });
        
        try {
            return transaction(data);
        } catch (error) {
            throw new Error('Error creando pedido: ' + error.message);
        }
    }

    // Actualizar estado del pedido
    static updateEstado(id, nuevoEstado) {
        try {
            const stmt = db.prepare('UPDATE PEDIDO SET estado = ? WHERE int = ?');
            stmt.run(nuevoEstado, id);
            return this.getById(id);
        } catch (error) {
            throw new Error('Error actualizando estado: ' + error.message);
        }
    }

    // Eliminar pedido
    static delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM PEDIDO WHERE int = ?');
            return stmt.run(id);
        } catch (error) {
            throw new Error('Error eliminando pedido: ' + error.message);
        }
    }
}

module.exports = PedidoController;