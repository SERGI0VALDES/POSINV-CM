// FORMULARIO PARA AÑADIR UN NUEVO VESTIDO  
export const FormularioVestidos = {
    generar() {
        return `
            <form id="modal-añadir" class="form-inventario">
                <div class="form-header">
                    <h3>📋 Nuevo Vestido</h3>
                    <p>Completa los datos del vestido</p>
                </div>
                
                <div class="form-group">
                    <label for="codigo_sku">
                        <i class="fas fa-barcode"></i> Código SKU *
                    </label>
                    <input type="text" 
                           id="codigo_sku" 
                           name="codigo_sku" 
                           placeholder="Ej: VEST-001" 
                           required
                           pattern="^[A-Z0-9-]+$"
                           title="Solo letras mayúsculas, números y guiones">
                    <small class="form-help">Formato: VEST-001, VEST-002, etc.</small>
                </div>
                
                <div class="form-group">
                    <label for="nombre_producto">
                        <i class="fas fa-tshirt"></i> Nombre del Vestido *
                    </label>
                    <input type="text" 
                           id="nombre_producto" 
                           name="nombre_producto" 
                           placeholder="Ej: Vestido Floral Verano" 
                           required
                           maxlength="100">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="color">
                            <i class="fas fa-palette"></i> Color *
                        </label>
                        <select id="color" name="color" required>
                            <option value="">Seleccionar color</option>
                            <option value="Rojo">Rojo</option>
                            <option value="Negro">Negro</option>
                            <option value="Blanco">Blanco</option>
                            <option value="Azul">Azul</option>
                            <option value="Verde">Verde</option>
                            <option value="Amarillo">Amarillo</option>
                            <option value="Rosa">Rosa</option>
                            <option value="Morado">Morado</option>
                            <option value="Gris">Gris</option>
                            <option value="Beige">Beige</option>
                            <option value="Multicolor">Multicolor</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="stock_actual">
                            <i class="fas fa-boxes"></i> Stock Inicial *
                        </label>
                        <input type="number" 
                               id="stock_actual" 
                               name="stock_actual" 
                               min="0" 
                               max="1000" 
                               value="0" 
                               required>
                        <small class="form-help">Cantidad disponible</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="precio_venta">
                        <i class="fas fa-tag"></i> Precio de Venta *
                    </label>
                    <div class="input-with-icon">
                        <span class="currency">$</span>
                        <input type="number" 
                               id="precio_venta" 
                               name="precio_venta" 
                               step="0.01" 
                               min="0" 
                               max="10000" 
                               placeholder="0.00" 
                               required>
                    </div>
                    <small class="form-help">Precio en dólares</small>
                </div>
                
                <div class="form-group">
                    <label for="descripcion">
                        <i class="fas fa-file-alt"></i> Descripción (Opcional)
                    </label>
                    <textarea id="descripcion" 
                              name="descripcion" 
                              rows="3" 
                              placeholder="Descripción del vestido, material, talla, etc." 
                              maxlength="500"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancelar" onclick="cerrarModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="submit" class="btn-guardar">
                        <i class="fas fa-save"></i> Guardar Vestido
                    </button>
                </div>
            </form>
        `;
    },
    
    validar(datos) {
        const errores = [];
        
        if (!datos.codigo_sku || datos.codigo_sku.trim() === '') {
            errores.push('El código SKU es requerido');
        } else if (!/^[A-Z0-9-]+$/.test(datos.codigo_sku)) {
            errores.push('El código SKU solo puede contener letras mayúsculas, números y guiones');
        }
        
        if (!datos.nombre_producto || datos.nombre_producto.trim() === '') {
            errores.push('El nombre del vestido es requerido');
        }
        
        if (!datos.color) {
            errores.push('El color es requerido');
        }
        
        if (datos.stock_actual === undefined || datos.stock_actual < 0) {
            errores.push('El stock inicial debe ser un número positivo');
        }
        
        if (!datos.precio_venta || datos.precio_venta <= 0) {
            errores.push('El precio de venta debe ser mayor a 0');
        }
        
        return errores;
    },
    
    obtenerDatos(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        
        return {
            codigo_sku: formData.get('codigo_sku').toUpperCase().trim(),
            nombre_producto: formData.get('nombre_producto').trim(),
            color: formData.get('color'),
            stock_actual: parseInt(formData.get('stock_actual')) || 0,
            precio_venta: parseFloat(formData.get('precio_venta')) || 0,
            descripcion: formData.get('descripcion')?.trim() || ''
        };
    }
};

// FORMULARIO PARA AÑADIR UNA NUEVA TELA
export const FormularioTelas = {
    generar() {
        return `
            <form id="modal-añadir" class="form-inventario">
                <div class="form-header">
                    <h3>📜 Nueva Tela</h3>
                    <p>Registra los datos de la tela</p>
                </div>
                
                <div class="form-group">
                    <label for="nombre_producto">
                        <i class="fas fa-roll"></i> Nombre de la Tela *
                    </label>
                    <input type="text" 
                           id="nombre_producto" 
                           name="nombre_producto" 
                           placeholder="Ej: Seda Natural, Algodón Orgánico" 
                           required
                           maxlength="100">
                </div>
                
                <div class="form-group">
                    <label for="composicion">
                        <i class="fas fa-flask"></i> Composición *
                    </label>
                    <input type="text" 
                           id="composicion" 
                           name="composicion" 
                           placeholder="Ej: 100% Algodón, 80% Polyester 20% Algodón" 
                           required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="ancho">
                            <i class="fas fa-ruler-horizontal"></i> Ancho (metros) *
                        </label>
                        <div class="input-with-icon">
                            <input type="number" 
                                   id="ancho" 
                                   name="ancho" 
                                   step="0.01" 
                                   min="0.5" 
                                   max="5" 
                                   value="1.5" 
                                   required>
                            <span class="unit">m</span>
                        </div>
                        <small class="form-help">Ancho estándar: 1.5m</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="largo_total">
                            <i class="fas fa-ruler-vertical"></i> Longitud Total (metros) *
                        </label>
                        <div class="input-with-icon">
                            <input type="number" 
                                   id="largo_total" 
                                   name="largo_total" 
                                   step="0.1" 
                                   min="0" 
                                   max="1000" 
                                   value="0" 
                                   required>
                            <span class="unit">m</span>
                        </div>
                        <small class="form-help">Metros lineales disponibles</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="stock_actual">
                        <i class="fas fa-weight"></i> Peso / Stock *
                    </label>
                    <input type="number" 
                           id="stock_actual" 
                           name="stock_actual" 
                           min="0" 
                           max="10000" 
                           value="0" 
                           required>
                    <small class="form-help">Cantidad en inventario</small>
                </div>
                
                <div class="form-group">
                    <label for="precio_metro">
                        <i class="fas fa-tag"></i> Precio por Metro (Opcional)
                    </label>
                    <div class="input-with-icon">
                        <span class="currency">$</span>
                        <input type="number" 
                               id="precio_metro" 
                               name="precio_metro" 
                               step="0.01" 
                               min="0" 
                               max="1000" 
                               placeholder="0.00">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="color_tela">
                        <i class="fas fa-palette"></i> Color (Opcional)
                    </label>
                    <input type="text" 
                           id="color_tela" 
                           name="color" 
                           placeholder="Ej: Blanco, Crudo, Natural">
                </div>
                
                <div class="form-group">
                    <label for="proveedor">
                        <i class="fas fa-truck"></i> Proveedor (Opcional)
                    </label>
                    <input type="text" 
                           id="proveedor" 
                           name="proveedor" 
                           placeholder="Nombre del proveedor">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancelar" onclick="cerrarModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="submit" class="btn-guardar">
                        <i class="fas fa-save"></i> Guardar Tela
                    </button>
                </div>
            </form>
        `;
    },
    
    validar(datos) {
        const errores = [];
        
        if (!datos.nombre_producto || datos.nombre_producto.trim() === '') {
            errores.push('El nombre de la tela es requerido');
        }
        
        if (!datos.composicion || datos.composicion.trim() === '') {
            errores.push('La composición es requerida');
        }
        
        if (datos.ancho <= 0 || datos.ancho > 5) {
            errores.push('El ancho debe estar entre 0.5 y 5 metros');
        }
        
        if (datos.largo_total < 0) {
            errores.push('La longitud no puede ser negativa');
        }
        
        if (datos.stock_actual < 0) {
            errores.push('El stock no puede ser negativo');
        }
        
        return errores;
    },
    
    obtenerDatos(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        
        return {
            nombre_producto: formData.get('nombre_producto').trim(),
            composicion: formData.get('composicion').trim(),
            ancho: parseFloat(formData.get('ancho')) || 1.5,
            largo_total: parseFloat(formData.get('largo_total')) || 0,
            stock_actual: parseInt(formData.get('stock_actual')) || 0,
            precio_metro: formData.get('precio_metro') ? parseFloat(formData.get('precio_metro')) : null,
            color: formData.get('color')?.trim() || '',
            proveedor: formData.get('proveedor')?.trim() || ''
        };
    }
};

// FORMULARIO PARA AÑADIR UN NUEVO INSUMO
export const FormularioInsumos = {
    generar() {
        return `
            <form id="modal-añadir" class="form-inventario">
                <div class="form-header">
                    <h3>🧵 Nuevo Insumo</h3>
                    <p>Registra un nuevo insumo para costura</p>
                </div>
                
                <div class="form-group">
                    <label for="nombre_producto">
                        <i class="fas fa-tools"></i> Nombre del Insumo *
                    </label>
                    <input type="text" 
                           id="nombre_producto" 
                           name="nombre_producto" 
                           placeholder="Ej: Hilo Polyester, Cierres Invisibles, Botones" 
                           required
                           maxlength="100">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="unidad_medida">
                            <i class="fas fa-balance-scale"></i> Unidad de Medida *
                        </label>
                        <select id="unidad_medida" name="unidad_medida" required>
                            <option value="">Seleccionar unidad</option>
                            <option value="unidad">Unidad</option>
                            <option value="carrete">Carrete</option>
                            <option value="metro">Metro</option>
                            <option value="paquete">Paquete</option>
                            <option value="caja">Caja</option>
                            <option value="rollo">Rollo</option>
                            <option value="docena">Docena</option>
                            <option value="kilo">Kilogramo</option>
                            <option value="litro">Litro</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="cantidad">
                            <i class="fas fa-cube"></i> Cantidad por Unidad *
                        </label>
                        <input type="number" 
                               id="cantidad" 
                               name="cantidad" 
                               min="1" 
                               max="1000" 
                               value="1" 
                               required>
                        <small class="form-help">Ej: 1 paquete = 12 unidades</small>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="stock_actual">
                            <i class="fas fa-boxes"></i> Stock Actual *
                        </label>
                        <input type="number" 
                               id="stock_actual" 
                               name="stock_actual" 
                               min="0" 
                               max="10000" 
                               value="0" 
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="stock_minimo">
                            <i class="fas fa-exclamation-triangle"></i> Stock Mínimo *
                        </label>
                        <input type="number" 
                               id="stock_minimo" 
                               name="stock_minimo" 
                               min="0" 
                               max="1000" 
                               value="5" 
                               required>
                        <small class="form-help">Alerta cuando baje de este nivel</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="precio_unidad">
                        <i class="fas fa-tag"></i> Precio por Unidad *
                    </label>
                    <div class="input-with-icon">
                        <span class="currency">$</span>
                        <input type="number" 
                               id="precio_unidad" 
                               name="precio_unidad" 
                               step="0.01" 
                               min="0" 
                               max="10000" 
                               placeholder="0.00" 
                               required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="categoria">
                        <i class="fas fa-tags"></i> Categoría (Opcional)
                    </label>
                    <select id="categoria" name="categoria">
                        <option value="">Sin categoría</option>
                        <option value="Costura">Costura</option>
                        <option value="Cierres">Cierres</option>
                        <option value="Botones">Botones</option>
                        <option value="Hilos">Hilos</option>
                        <option value="Forros">Forros</option>
                        <option value="Adornos">Adornos</option>
                        <option value="Elásticos">Elásticos</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="proveedor_insumo">
                        <i class="fas fa-truck"></i> Proveedor (Opcional)
                    </label>
                    <input type="text" 
                           id="proveedor_insumo" 
                           name="proveedor" 
                           placeholder="Nombre del proveedor">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancelar" onclick="cerrarModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="submit" class="btn-guardar">
                        <i class="fas fa-save"></i> Guardar Insumo
                    </button>
                </div>
            </form>
        `;
    },
    
    validar(datos) {
        const errores = [];
        
        if (!datos.nombre_producto || datos.nombre_producto.trim() === '') {
            errores.push('El nombre del insumo es requerido');
        }
        
        if (!datos.unidad_medida) {
            errores.push('La unidad de medida es requerida');
        }
        
        if (datos.cantidad <= 0) {
            errores.push('La cantidad por unidad debe ser mayor a 0');
        }
        
        if (datos.stock_actual < 0) {
            errores.push('El stock actual no puede ser negativo');
        }
        
        if (datos.stock_minimo < 0) {
            errores.push('El stock mínimo no puede ser negativo');
        }
        
        if (!datos.precio_unidad || datos.precio_unidad <= 0) {
            errores.push('El precio por unidad debe ser mayor a 0');
        }
        
        return errores;
    },
    
    obtenerDatos(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        
        return {
            nombre_producto: formData.get('nombre_producto').trim(),
            unidad_medida: formData.get('unidad_medida'),
            cantidad: parseInt(formData.get('cantidad')) || 1,
            stock_actual: parseInt(formData.get('stock_actual')) || 0,
            stock_minimo: parseInt(formData.get('stock_minimo')) || 5,
            precio_unidad: parseFloat(formData.get('precio_unidad')) || 0,
            categoria: formData.get('categoria') || '',
            proveedor: formData.get('proveedor')?.trim() || ''
        };
    }
};

// FORMULARIO PRODUCTOS PARA AÑADIR NUEVOS PRODUCTOS TERMINADOS AL INVENTARIO
export const FormularioProductos = {
    generar() {
        return `
            <form id="modal-añadir" class="form-inventario">
                <div class="form-header">
                    <h3>📦 Nuevo Producto</h3>
                    <p>Registra un producto terminado</p>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="codigo">
                            <i class="fas fa-barcode"></i> Código *
                        </label>
                        <input type="text" 
                               id="codigo" 
                               name="codigo" 
                               placeholder="Ej: PROD-001, CONJ-001" 
                               required
                               pattern="^[A-Z0-9-]+$"
                               title="Solo letras mayúsculas, números y guiones">
                        <small class="form-help">Formato único: PROD-001</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="nombre">
                            <i class="fas fa-cube"></i> Nombre del Producto *
                        </label>
                        <input type="text" 
                               id="nombre" 
                               name="nombre" 
                               placeholder="Ej: Conjunto Casual, Blazer Formal" 
                               required
                               maxlength="100">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="stock_actual">
                            <i class="fas fa-boxes"></i> Stock Actual *
                        </label>
                        <input type="number" 
                               id="stock_actual" 
                               name="stock_actual" 
                               min="0" 
                               max="10000" 
                               value="0" 
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="stock_minimo">
                            <i class="fas fa-exclamation-triangle"></i> Stock Mínimo *
                        </label>
                        <input type="number" 
                               id="stock_minimo" 
                               name="stock_minimo" 
                               min="0" 
                               max="1000" 
                               value="3" 
                               required>
                        <small class="form-help">Alerta cuando baje de este nivel</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="precio_venta">
                        <i class="fas fa-tag"></i> Precio de Venta *
                    </label>
                    <div class="input-with-icon">
                        <span class="currency">$</span>
                        <input type="number" 
                               id="precio_venta" 
                               name="precio_venta" 
                               step="0.01" 
                               min="0" 
                               max="100000" 
                               placeholder="0.00" 
                               required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="categoria_producto">
                        <i class="fas fa-tags"></i> Categoría *
                    </label>
                    <select id="categoria_producto" name="categoria" required>
                        <option value="">Seleccionar categoría</option>
                        <option value="Conjuntos">Conjuntos</option>
                        <option value="Vestidos">Vestidos</option>
                        <option value="Blazers">Blazers</option>
                        <option value="Faldas">Faldas</option>
                        <option value="Pantalones">Pantalones</option>
                        <option value="Camisas">Camisas</option>
                        <option value="Blusas">Blusas</option>
                        <option value="Chaquetas">Chaquetas</option>
                        <option value="Abrigos">Abrigos</option>
                        <option value="Accesorios">Accesorios</option>
                        <option value="Otros">Otros</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="descripcion_producto">
                        <i class="fas fa-file-alt"></i> Descripción (Opcional)
                    </label>
                    <textarea id="descripcion_producto" 
                              name="descripcion" 
                              rows="3" 
                              placeholder="Descripción del producto, características, tallas disponibles, etc." 
                              maxlength="500"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="color_producto">
                        <i class="fas fa-palette"></i> Color (Opcional)
                    </label>
                    <input type="text" 
                           id="color_producto" 
                           name="color" 
                           placeholder="Ej: Negro, Rojo, Multicolor">
                </div>
                
                <div class="form-group">
                    <label>
                        <i class="fas fa-check-circle"></i> Estado del Producto
                    </label>
                    <div class="radio-group">
                        <label class="radio-label">
                            <input type="radio" name="activo" value="1" checked>
                            <span class="radio-custom"></span>
                            Activo (Disponible para venta)
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="activo" value="0">
                            <span class="radio-custom"></span>
                            Inactivo (No disponible)
                        </label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancelar" onclick="cerrarModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="submit" class="btn-guardar">
                        <i class="fas fa-save"></i> Guardar Producto
                    </button>
                </div>
            </form>
        `;
    },
    
    validar(datos) {
        const errores = [];
        
        if (!datos.codigo || datos.codigo.trim() === '') {
            errores.push('El código del producto es requerido');
        } else if (!/^[A-Z0-9-]+$/.test(datos.codigo)) {
            errores.push('El código solo puede contener letras mayúsculas, números y guiones');
        }
        
        if (!datos.nombre || datos.nombre.trim() === '') {
            errores.push('El nombre del producto es requerido');
        }
        
        if (datos.stock_actual < 0) {
            errores.push('El stock actual no puede ser negativo');
        }
        
        if (datos.stock_minimo < 0) {
            errores.push('El stock mínimo no puede ser negativo');
        }
        
        if (!datos.precio_venta || datos.precio_venta <= 0) {
            errores.push('El precio de venta debe ser mayor a 0');
        }
        
        if (!datos.categoria) {
            errores.push('La categoría es requerida');
        }
        
        return errores;
    },
    
    obtenerDatos(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        
        return {
            codigo: formData.get('codigo').toUpperCase().trim(),
            nombre: formData.get('nombre').trim(),
            stock_actual: parseInt(formData.get('stock_actual')) || 0,
            stock_minimo: parseInt(formData.get('stock_minimo')) || 3,
            precio_venta: parseFloat(formData.get('precio_venta')) || 0,
            categoria: formData.get('categoria'),
            descripcion: formData.get('descripcion')?.trim() || '',
            color: formData.get('color')?.trim() || '',
            activo: formData.get('activo') === '1' ? 1 : 0
        };
    }
};

// MANEJADOR PRINCIPAL DE LOS FORMULARIOS DE INVENTARIO
export const FormularioManager = {
    
    // Generar formulario según categoría
    generarFormulario(categoria, datos = {}) {
        const formularios = {

            'vestidos': FormularioVestidos,
            'telas': FormularioTelas,
            'insumos': FormularioInsumos,
            'productos': FormularioProductos

        };
        
        const formulario = formularios[categoria];
        if (!formulario) {
            throw new Error(`Categoría no soportada: ${categoria}`);
        }
        
        return formulario.generar(datos);
    },
    
    // Validar datos del formulario
    validarFormulario(categoria, datos) {
        const validadores = {
            'vestidos': FormularioVestidos.validar,
            'telas': FormularioTelas.validar,
            'insumos': FormularioInsumos.validar,
            'productos': FormularioProductos.validar
        };
        
        const validador = validadores[categoria];
        if (!validador) {
            throw new Error(`Validador no encontrado para: ${categoria}`);
        }
        
        return validador(datos);
    },
    
    // Obtener datos del formulario
    obtenerDatosFormulario(categoria, formId) {
        const extractores = {
            'vestidos': FormularioVestidos.obtenerDatos,
            'telas': FormularioTelas.obtenerDatos,
            'insumos': FormularioInsumos.obtenerDatos,
            'productos': FormularioProductos.obtenerDatos
        };
        
        const extractor = extractores[categoria];
        if (!extractor) {
            throw new Error(`Extractor no encontrado para: ${categoria}`);
        }
        
        return extractor(formId);
    },
    
    // Configurar evento submit del formulario
    configurarSubmit(formId, categoria, callbackGuardar) {
        const form = document.getElementById(formId);
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            try {
                // Obtener y validar datos
                const datos = this.obtenerDatosFormulario(categoria, formId);
                const errores = this.validarFormulario(categoria, datos);
                
                if (errores.length > 0) {
                    this.mostrarErrores(errores);
                    return;
                }
                
                // Mostrar loading
                this.mostrarLoading();
                
                // Llamar al callback de guardado
                const resultado = await callbackGuardar(datos);
                
                if (resultado.success) {
                    this.mostrarExito(`${categoria} guardado correctamente`);
                    setTimeout(() => {
                        this.cerrarModal();
                        // Recargar la vista si es necesario
                        if (window.inventarioManager) {
                            window.inventarioManager.mostrarInventario(categoria);
                        }
                    }, 1500);
                } else {
                    throw new Error(resultado.error || 'Error al guardar');
                }
                
            } catch (error) {
                console.error('❌ Error en formulario:', error);
                this.mostrarError(`Error: ${error.message}`);
            }
        });
    },
    
    // Métodos de UI
    mostrarErrores(errores) {
        const errorHtml = errores.map(error => 
            `<div class="error-message">❌ ${error}</div>`
        ).join('');
        
        const errorContainer = document.createElement('div');
        errorContainer.className = 'errores-formulario';
        errorContainer.innerHTML = errorHtml;
        
        // Insertar después del formulario
        const form = document.querySelector('.form-inventario');
        if (form) {
            const existingErrors = form.querySelector('.errores-formulario');
            if (existingErrors) existingErrors.remove();
            form.prepend(errorContainer);
        }
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.remove();
            }
        }, 5000);
    },
    
    mostrarLoading() {
        const submitBtn = document.querySelector('.btn-guardar');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
            submitBtn.disabled = true;
        }
    },
    
    mostrarExito(mensaje) {
        const successDiv = document.createElement('div');
        successDiv.className = 'exito-formulario';
        successDiv.innerHTML = `
            <div class="exito-content">
                <i class="fas fa-check-circle"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        const form = document.querySelector('.form-inventario');
        if (form) {
            form.prepend(successDiv);
            
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 3000);
        }
    },
    
    mostrarError(mensaje) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-formulario';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${mensaje}</span>
            </div>
        `;
        
        const form = document.querySelector('.form-inventario');
        if (form) {
            form.prepend(errorDiv);
            
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        }
    },
    
    cerrarModal() {
        const modal = document.querySelector('.modal-inventario');
        if (modal) {
            modal.remove();
        }
    },
    
    // Método para abrir modal con formulario
    abrirModalFormulario(categoria, titulo) {
        const modalHtml = `
            <div class="modal-inventario active">

                <div class="modal-overlay" onclick="FormularioManager.cerrarModal()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${titulo}</h2>
                        <button class="modal-close" onclick="FormularioManager.cerrarModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="modal-form-body">
                        ${this.generarFormulario(categoria)}
                    </div>
                </div>

            </div>
        `;
        
        // Agregar al body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer.firstElementChild);
        
        // Configurar submit
        const formId = `form-${categoria}`;
        this.configurarSubmit(formId, categoria, async (datos) => {
            // Aquí conectas con tu API
            if (window.inventarioManager && window.inventarioManager.api) {
                const apiCategoria = window.inventarioManager.api[categoria];
                if (apiCategoria && apiCategoria.create) {
                    return await apiCategoria.create(datos);
                }
            }
            
            // Fallback
            console.log('Guardando datos:', datos);
            return { success: true, data: { id: Date.now(), ...datos } };
        });
    }
};

// Exponer cerrarModal para que funcione el 'onclick' en el HTML inyectado
window.cerrarModal = FormularioManager.cerrarModal.bind(FormularioManager);