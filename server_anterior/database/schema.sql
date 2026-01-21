-- ============================================
-- CONFIGURACIONES DE BASE DE DATOS (AL INICIO)
-- ============================================

-- Configuraciones PRAGMA deben ir al inicio, fuera de transacciones
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA temp_store = MEMORY;

-- ============================================
-- CREACIÓN DE TABLAS - SISTEMA DE INVENTARIO
-- ============================================

-- Tabla: PEDIDO
CREATE TABLE IF NOT EXISTS PEDIDO (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    idPedido TEXT UNIQUE NOT NULL,
    fechaVenta DATETIME DEFAULT CURRENT_TIMESTAMP,
    totalVenta REAL NOT NULL DEFAULT 0,
    estado TEXT DEFAULT 'Pendiente',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: USUARIO
CREATE TABLE IF NOT EXISTS USUARIO (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    nombreUsuario TEXT UNIQUE NOT NULL,
    hashPassword TEXT NOT NULL,
    rol TEXT DEFAULT 'usuario',
    activo INTEGER DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: PRODUCTO_BASE (Clave única de inventario)
CREATE TABLE IF NOT EXISTS PRODUCTO_BASE (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    idProducto INTEGER UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    stockActual REAL DEFAULT 0,
    stockMinimo REAL DEFAULT 0,
    precioVenta REAL NOT NULL,
    activo INTEGER DEFAULT 1 CHECK(activo IN (0, 1)),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: MOV_INVENTARIO
CREATE TABLE IF NOT EXISTS MOV_INVENTARIO (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    idMovimiento TEXT UNIQUE NOT NULL,
    fechaMovimiento DATETIME DEFAULT CURRENT_TIMESTAMP,
    tipoMovimiento TEXT NOT NULL CHECK(tipoMovimiento IN ('entrada', 'salida', 'ajuste')),
    cantidad REAL NOT NULL,
    origen TEXT,
    idProducto INTEGER NOT NULL,
    idUsuario INTEGER NOT NULL,
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES PRODUCTO_BASE(idProducto) ON DELETE CASCADE,
    FOREIGN KEY (idUsuario) REFERENCES USUARIO(int) ON DELETE RESTRICT
);

-- Tabla: ITEM_PEDIDO (CORREGIDA)
CREATE TABLE IF NOT EXISTS ITEM_PEDIDO (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    idPedido TEXT NOT NULL,
    idProducto INTEGER NOT NULL,
    cantidad REAL NOT NULL CHECK(cantidad > 0),
    precioUnitario REAL NOT NULL CHECK(precioUnitario >= 0),
    subtotal REAL NOT NULL DEFAULT 0 CHECK(subtotal >= 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idPedido) REFERENCES PEDIDO(idPedido) ON DELETE CASCADE,
    FOREIGN KEY (idProducto) REFERENCES PRODUCTO_BASE(idProducto) ON DELETE RESTRICT
);

-- Tabla: INSUMO
CREATE TABLE IF NOT EXISTS INSUMO (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    idProducto INTEGER NOT NULL,
    nombreInsumo TEXT NOT NULL,
    unidadMedida TEXT DEFAULT 'unidad',
    ancho REAL,
    longitudTotal REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES PRODUCTO_BASE(idProducto) ON DELETE CASCADE
);

-- Tabla: TELA
CREATE TABLE IF NOT EXISTS TELA (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    idProducto INTEGER NOT NULL,
    composicion TEXT,
    ancho REAL,
    longitudTotal REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES PRODUCTO_BASE(idProducto) ON DELETE CASCADE
);

-- Tabla: VESTIDO
CREATE TABLE IF NOT EXISTS VESTIDO (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    idProducto INTEGER NOT NULL,
    color TEXT,
    codigoSku TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES PRODUCTO_BASE(idProducto) ON DELETE CASCADE
);

-- Tabla: PROD_TERMINADO
CREATE TABLE IF NOT EXISTS PROD_TERMINADO (
    int INTEGER PRIMARY KEY AUTOINCREMENT,
    idProducto INTEGER NOT NULL,
    codigoSku TEXT UNIQUE,
    tipoProducto TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (idProducto) REFERENCES PRODUCTO_BASE(idProducto) ON DELETE CASCADE
);

-- ============================================
-- ÍNDICES PARA MEJOR RENDIMIENTO
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pedido_fecha ON PEDIDO(fechaVenta);
CREATE INDEX IF NOT EXISTS idx_pedido_estado ON PEDIDO(estado);
CREATE INDEX IF NOT EXISTS idx_pedido_id ON PEDIDO(idPedido);
CREATE INDEX IF NOT EXISTS idx_mov_inv_fecha ON MOV_INVENTARIO(fechaMovimiento);
CREATE INDEX IF NOT EXISTS idx_mov_inv_tipo ON MOV_INVENTARIO(tipoMovimiento);
CREATE INDEX IF NOT EXISTS idx_mov_inv_producto ON MOV_INVENTARIO(idProducto);
CREATE INDEX IF NOT EXISTS idx_item_pedido_id ON ITEM_PEDIDO(idPedido);
CREATE INDEX IF NOT EXISTS idx_item_producto ON ITEM_PEDIDO(idProducto);
CREATE INDEX IF NOT EXISTS idx_producto_nombre ON PRODUCTO_BASE(nombre);
CREATE INDEX IF NOT EXISTS idx_producto_activo ON PRODUCTO_BASE(activo);
CREATE INDEX IF NOT EXISTS idx_producto_id ON PRODUCTO_BASE(idProducto);
CREATE INDEX IF NOT EXISTS idx_insumo_producto ON INSUMO(idProducto);
CREATE INDEX IF NOT EXISTS idx_tela_producto ON TELA(idProducto);
CREATE INDEX IF NOT EXISTS idx_vestido_producto ON VESTIDO(idProducto);
CREATE INDEX IF NOT EXISTS idx_vestido_sku ON VESTIDO(codigoSku);
CREATE INDEX IF NOT EXISTS idx_prod_term_producto ON PROD_TERMINADO(idProducto);
CREATE INDEX IF NOT EXISTS idx_prod_term_sku ON PROD_TERMINADO(codigoSku);
CREATE INDEX IF NOT EXISTS idx_usuario_nombre ON USUARIO(nombreUsuario);

-- ============================================
-- TRIGGERS AUTOMÁTICOS CORREGIDOS
-- ============================================

-- Trigger para calcular subtotal automáticamente (CORREGIDO)
CREATE TRIGGER IF NOT EXISTS calc_subtotal_item_pedido
BEFORE INSERT ON ITEM_PEDIDO
FOR EACH ROW
BEGIN
    UPDATE ITEM_PEDIDO SET subtotal = NEW.cantidad * NEW.precioUnitario WHERE int = NEW.int;
END;

-- Actualizar total del pedido al insertar items (CORREGIDO)
CREATE TRIGGER IF NOT EXISTS update_total_pedido_insert
AFTER INSERT ON ITEM_PEDIDO
BEGIN
    UPDATE PEDIDO 
    SET totalVenta = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM ITEM_PEDIDO 
        WHERE idPedido = NEW.idPedido
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE idPedido = NEW.idPedido;
END;

-- Actualizar total del pedido al actualizar items (CORREGIDO)
CREATE TRIGGER IF NOT EXISTS update_total_pedido_update
AFTER UPDATE ON ITEM_PEDIDO
BEGIN
    UPDATE PEDIDO 
    SET totalVenta = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM ITEM_PEDIDO 
        WHERE idPedido = NEW.idPedido
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE idPedido = NEW.idPedido;
END;

-- Actualizar total del pedido al eliminar items (NUEVO)
CREATE TRIGGER IF NOT EXISTS update_total_pedido_delete
AFTER DELETE ON ITEM_PEDIDO
BEGIN
    UPDATE PEDIDO 
    SET totalVenta = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM ITEM_PEDIDO 
        WHERE idPedido = OLD.idPedido
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE idPedido = OLD.idPedido;
END;

-- Actualizar stock en movimientos de ENTRADA (CORREGIDO)
CREATE TRIGGER IF NOT EXISTS update_stock_entrada
AFTER INSERT ON MOV_INVENTARIO
WHEN NEW.tipoMovimiento = 'entrada'
BEGIN
    UPDATE PRODUCTO_BASE 
    SET stockActual = stockActual + NEW.cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE idProducto = NEW.idProducto;
END;

-- Actualizar stock en movimientos de SALIDA (CORREGIDO)
CREATE TRIGGER IF NOT EXISTS update_stock_salida
AFTER INSERT ON MOV_INVENTARIO
WHEN NEW.tipoMovimiento = 'salida'
BEGIN
    UPDATE PRODUCTO_BASE 
    SET stockActual = stockActual - NEW.cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE idProducto = NEW.idProducto;
END;

-- Ajuste directo de stock (CORREGIDO)
CREATE TRIGGER IF NOT EXISTS update_stock_ajuste
AFTER INSERT ON MOV_INVENTARIO
WHEN NEW.tipoMovimiento = 'ajuste'
BEGIN
    UPDATE PRODUCTO_BASE 
    SET stockActual = NEW.cantidad,
        updated_at = CURRENT_TIMESTAMP
    WHERE idProducto = NEW.idProducto;
END;

-- Trigger para actualizar timestamp en PRODUCTO_BASE (NUEVO)
CREATE TRIGGER IF NOT EXISTS update_producto_timestamp
AFTER UPDATE ON PRODUCTO_BASE
FOR EACH ROW
BEGIN
    UPDATE PRODUCTO_BASE SET updated_at = CURRENT_TIMESTAMP WHERE int = NEW.int;
END;

-- Trigger para actualizar timestamp en USUARIO (NUEVO)
CREATE TRIGGER IF NOT EXISTS update_usuario_timestamp
AFTER UPDATE ON USUARIO
FOR EACH ROW
BEGIN
    UPDATE USUARIO SET updated_at = CURRENT_TIMESTAMP WHERE int = NEW.int;
END;

-- Trigger para actualizar timestamp en PEDIDO (NUEVO)
CREATE TRIGGER IF NOT EXISTS update_pedido_timestamp
AFTER UPDATE ON PEDIDO
FOR EACH ROW
BEGIN
    UPDATE PEDIDO SET updated_at = CURRENT_TIMESTAMP WHERE int = NEW.int;
END;

-- Validar stock suficiente antes de salida (NUEVO - SEGURIDAD)
CREATE TRIGGER IF NOT EXISTS validate_stock_salida
BEFORE INSERT ON MOV_INVENTARIO
WHEN NEW.tipoMovimiento = 'salida'
BEGIN
    SELECT 
        CASE 
            WHEN (SELECT stockActual FROM PRODUCTO_BASE WHERE idProducto = NEW.idProducto) < NEW.cantidad THEN
                RAISE(ABORT, 'Stock insuficiente para realizar la salida')
        END;
END;

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Productos con stock bajo
CREATE VIEW IF NOT EXISTS v_productos_bajo_stock AS
SELECT 
    pb.idProducto,
    pb.nombre,
    pb.stockActual,
    pb.stockMinimo,
    (pb.stockMinimo - pb.stockActual) AS cantidadFaltante,
    CASE 
        WHEN pb.stockActual <= 0 THEN 'SIN STOCK'
        WHEN pb.stockActual < pb.stockMinimo THEN 'STOCK BAJO'
        ELSE 'STOCK OK'
    END AS estadoStock
FROM PRODUCTO_BASE pb
WHERE pb.activo = 1 AND (pb.stockActual <= pb.stockMinimo OR pb.stockActual <= 0);

-- Resumen de pedidos (CORREGIDA)
CREATE VIEW IF NOT EXISTS v_resumen_pedidos AS
SELECT 
    p.idPedido,
    p.fechaVenta,
    p.estado,
    p.totalVenta,
    COUNT(ip.int) AS totalItems,
    p.created_at
FROM PEDIDO p
LEFT JOIN ITEM_PEDIDO ip ON p.idPedido = ip.idPedido
GROUP BY p.int;

-- Historial de movimientos completo
CREATE VIEW IF NOT EXISTS v_movimientos_inventario AS
SELECT 
    mi.idMovimiento,
    mi.fechaMovimiento,
    mi.tipoMovimiento,
    mi.cantidad,
    mi.origen,
    mi.observaciones,
    pb.idProducto,
    pb.nombre AS nombreProducto,
    u.nombreUsuario AS usuario,
    pb.stockActual AS stockActual
FROM MOV_INVENTARIO mi
JOIN PRODUCTO_BASE pb ON mi.idProducto = pb.idProducto
JOIN USUARIO u ON mi.idUsuario = u.int
ORDER BY mi.fechaMovimiento DESC;

-- Vista de productos con detalles extendidos
CREATE VIEW IF NOT EXISTS v_productos_completos AS
SELECT 
    pb.int,
    pb.idProducto,
    pb.nombre,
    pb.descripcion,
    pb.stockActual,
    pb.stockMinimo,
    pb.precioVenta,
    pb.activo,
    pb.created_at,
    pb.updated_at,
    t.composicion,
    t.ancho AS anchoTela,
    t.longitudTotal,
    v.color,
    v.codigoSku AS skuVestido,
    pt.codigoSku AS skuProductoTerminado,
    pt.tipoProducto,
    i.nombreInsumo,
    i.unidadMedida
FROM PRODUCTO_BASE pb
LEFT JOIN TELA t ON pb.idProducto = t.idProducto
LEFT JOIN VESTIDO v ON pb.idProducto = v.idProducto
LEFT JOIN PROD_TERMINADO pt ON pb.idProducto = pt.idProducto
LEFT JOIN INSUMO i ON pb.idProducto = i.idProducto
WHERE pb.activo = 1;

-- Ventas por mes
CREATE VIEW IF NOT EXISTS v_ventas_mensuales AS
SELECT 
    strftime('%Y-%m', fechaVenta) AS mes,
    COUNT(*) AS totalPedidos,
    SUM(totalVenta) AS totalVentas,
    AVG(totalVenta) AS promedioVenta
FROM PEDIDO 
WHERE estado = 'Completado'
GROUP BY strftime('%Y-%m', fechaVenta)
ORDER BY mes DESC;