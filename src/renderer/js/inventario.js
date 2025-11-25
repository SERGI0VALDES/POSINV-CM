// inventario.js - VERSIÓN DEBUG
class InventarioManager {
    // Constructor =>
    constructor() {
        // Constructores (varios)
        this.categoriaActual = null;
        this.contenedor = null;
        this.init();
    
    }


    init() {

        //Checar si inicializa correctamente => //console.log'🔍 DEBUG: Inicializando módulo de inventarios...');
        
        //DEBUG: Listar todos los elementos en la página this.debugElementosPagina();
        
        //BUSCAR EL CONTENEDOR DE FORMA MÁS FLEXIBLE
        this.contenedor = document.getElementById('contenedor-inventario');
        
        if (!this.contenedor) {
            //console.error('❌ DEBUG: No se encontró elemento con id "contenedor-inventario"');
            //console.log'🔍 DEBUG: Buscando elementos con clase "inventarios"...');
            
            // Intentar buscar por clase
            const elementosPorClase = document.getElementsByClassName('inventarios');
            if (elementosPorClase.length > 0) {
                this.contenedor = elementosPorClase[0];
                //console.log'✅ DEBUG: Encontrado por clase "inventarios"');
            } else {
                //console.error('❌ DEBUG: Tampoco se encontró por clase "inventarios"');
                this.mostrarErrorGlobal('Error crítico: No se pudo encontrar el contenedor de inventarios');
                return;
            }
        }
        
        // //console.log'✅ DEBUG: Contenedor encontrado:', this.contenedor);
        
        this.cargarFechaActual();
        this.agregarEventListeners();

        this.inicializarModales();
        //console.log'✅ Módulo de inventarios inicializado correctamente');
    }

    // Debug para mostrar todos los elementos de la pagina =>
    /**
        debugElementosPagina() {
        //console.log'🔍 DEBUG: Elementos en la página:');
        //console.log'- Body:', document.body);
        //console.log'- Main:', document.querySelector('main'));
        //console.log'- Todos los divs:', document.querySelectorAll('div').length);
        
        // Listar todos los IDs en la página
        const todosLosElementos = document.querySelectorAll('*[id]');
        //console.log'🔍 DEBUG: IDs encontrados en la página:');
        todosLosElementos.forEach(el => {
            //console.log`  - ${el.id}`);
        });
    }*/

    // Cargar fecha actual
    cargarFechaActual() {
        try {
            const fechaElement = document.getElementById('currentDate');
            if (fechaElement) {
                const fecha = new Date();
                const opciones = { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                };
                fechaElement.textContent = fecha.toLocaleDateString('es-ES', opciones);
                //console.log'✅ Fecha cargada correctamente');
            } else {
                console.warn('⚠️ No se encontró el elemento para la fecha');
            }
        } catch (error) {
            console.error('Error cargando fecha:', error);
        }
    }

    // EventListeners y logs para botones =>
    agregarEventListeners() {
        //console.log'🔍 DEBUG: Agregando event listeners...');
        
        const botones = {
            //botones de los inventarios menu izquierdo
            'btn-vestidos': () => this.mostrarInventario('vestidos'),
            'btn-telas': () => this.mostrarInventario('telas'),
            'btn-insumos': () => this.mostrarInventario('insumos'),
            'btn-productos': () => this.mostrarInventario('productos'),
            //Modales
            'btn-añadir-inv': () => this.mostrarModalAgregar() // Conectado al botón añadir en el html
        };

        // Log para mostrar los botones agregados en el html (todos) 
        Object.keys(botones).forEach(botonId => {
            const boton = document.getElementById(botonId);
            if (boton) {
                boton.addEventListener('click', botones[botonId]);
                //console.log`✅ Event listener agregado a: ${botonId}`);
            } else {
                //console.error(`❌ NO SE ENCONTRÓ EL BOTÓN: ${botonId}`);
                
                // Debug: mostrar todos los botones
                const todosLosBotones = document.querySelectorAll('button');
                //console.log'🔍 DEBUG: Todos los botones en la página:');
                todosLosBotones.forEach((btn, index) => {
                    //console.log`  ${index}:`, btn.textContent, btn.id);
                });
            }
        });

    }

    
    async mostrarInventario(categoria) {
        //console.log`🔍 DEBUG: Mostrar inventario llamado para: ${categoria}`);
        //console.log`🔍 DEBUG: this.contenedor =`, this.contenedor);
        
        // ✅ VERIFICACIÓN EXTRA DEL CONTENEDOR
        if (!this.contenedor) {
            console.error('❌ ERROR CRÍTICO: this.contenedor es NULL en mostrarInventario');
            
            // Reintentar encontrar el contenedor
            this.contenedor = document.getElementById('contenedor-inventario');
            if (!this.contenedor) {
                console.error('❌ No se pudo recuperar el contenedor');
                return;
            }
        }

        try {
            this.categoriaActual = categoria;
            //console.log`📦 Cargando inventario: ${categoria}`);
            
            // Mostrar loading
            this.mostrarLoading();
            
            // Pequeña pausa para ver el loading
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Obtener datos según la categoría
            let datos;
            switch(categoria) {
                case 'vestidos':
                    datos = await this.obtenerVestidos();
                    break;
                case 'telas':
                    datos = await this.obtenerTelas();
                    break;
                case 'insumos':
                    datos = await this.obtenerInsumos();
                    break;
                case 'productos':
                    datos = await this.obtenerProductos();
                    break;
                default:
                    throw new Error(`Categoría desconocida: ${categoria}`);
            }
            
            // //console.log`✅ Datos obtenidos para ${categoria}:`, datos);
            
            // Renderizar la tabla
            this.renderizarTabla(categoria, datos);
            
        } catch (error) {
            console.error('❌ Error cargando inventario:', error);
            this.mostrarError('Error al cargar el inventario: ' + error.message);
        }
    }

    // ✅ MÉTODOS VISUALES CON VERIFICACIÓN DE CONTENEDOR
    mostrarLoading() {
        //console.log'🔍 DEBUG: mostrarLoading() llamado');
        //console.log'🔍 DEBUG: this.contenedor en mostrarLoading:', this.contenedor);
        
        if (!this.contenedor) {
            //console.error('❌ ERROR: this.contenedor es null en mostrarLoading');
            return;
        }
        
        this.contenedor.innerHTML = `
            <div class="loading">
                <p>Cargando inventario...</p>
                <small>Buscando datos en la base de datos</small>
            </div>
        `;
    }

    mostrarError(mensaje) {
        //console.log'🔍 DEBUG: mostrarError() llamado');
        //console.log'🔍 DEBUG: this.contenedor en mostrarError:', this.contenedor);
        
        if (!this.contenedor) {
            console.error('❌ ERROR: this.contenedor es null en mostrarError');
            // Fallback: mostrar error en consola y alerta
            alert('Error: ' + mensaje + ' (Contenedor no disponible)');
            return;
        }
        
        this.contenedor.innerHTML = `
            <div class="error">
                <p>❌ ${mensaje}</p>
                <button onclick="inventarioManager.mostrarInventario('${this.categoriaActual}')">Reintentar</button>
            </div>
        `;
    }

    mostrarErrorGlobal(mensaje) {
        // Fallback para errores globales
        const body = document.body;
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #dc3545;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-family: Arial, sans-serif;
        `;
        errorDiv.textContent = mensaje;
        body.appendChild(errorDiv);
    }

    renderizarTabla(categoria, datos) {
        //console.log'🔍 DEBUG: renderizarTabla() llamado');
        //console.log'🔍 DEBUG: this.contenedor en renderizarTabla:', this.contenedor);
        
        if (!this.contenedor) {
            console.error('❌ ERROR: this.contenedor es null en renderizarTabla');
            return;
        }

        if (!datos || datos.length === 0) {
            this.contenedor.innerHTML = `
                <div class="inventario-vacio">
                    <p>📭 No hay ${categoria} en el inventario</p>
                    <small>Intenta agregar algunos items o verifica la conexión a la base de datos</small>
                </div>
            `;
            return;
        }

        // Generar tabla según la categoría
        let tablaHTML = `
            <div class="inventario-header">
                <h3>Inventario de ${categoria.toUpperCase()}</h3>
                <span class="total-items">Total: ${datos.length} items</span>
            </div>
            <div class="table-container">
                <table class="inventario-table">
                    <thead>
                        <tr>
                            ${this.generarEncabezados(categoria)}
                        </tr>
                    </thead>
                    <tbody>
                        ${this.generarFilas(categoria, datos)}
                    </tbody>
                </table>
            </div>
        `;

        this.contenedor.innerHTML = tablaHTML;
        //console.log'✅ Tabla renderizada correctamente');
    }

    // ✅ MÉTODOS PARA OBTENER DATOS (igual que antes)
    async obtenerVestidos() {
        try {
            //console.log'🔍 Obteniendo vestidos...');
            // Datos de ejemplo para pruebas
            return this.datosEjemploVestidos();
        } catch (error) {
            console.error('Error obteniendo vestidos:', error);
            return this.datosEjemploVestidos();
        }
    }

    async obtenerTelas() {
        try {
            //console.log'🔍 Obteniendo telas...');
            return this.datosEjemploTelas();
        } catch (error) {
            console.error('Error obteniendo telas:', error);
            return this.datosEjemploTelas();
        }
    }

    async obtenerInsumos() {
        try {
            //console.log'🔍 Obteniendo insumos...');
            return this.datosEjemploInsumos();
        } catch (error) {
            console.error('Error obteniendo insumos:', error);
            return this.datosEjemploInsumos();
        }
    }

    async obtenerProductos() {
        try {
            //console.log'🔍 Obteniendo productos...');
            return this.datosEjemploProductos();
        } catch (error) {
            console.error('Error obteniendo productos:', error);
            return this.datosEjemploProductos();
        }
    }

    // ✅ DATOS DE EJEMPLO
    datosEjemploVestidos() {
        return [
            { codigoSku: 'VEST-001', nombreProducto: 'Vestido Floral', color: 'Rojo', stockActual: 5, precioVenta: 299.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
            { codigoSku: 'VEST-002', nombreProducto: 'Vestido Noche', color: 'Negro', stockActual: 3, precioVenta: 459.99 },
        ];
    }

    datosEjemploTelas() {
        return [
            { nombreProducto: 'Seda Natural', composicion: '100% Seda', ancho: 1.5, longitudTotal: 50, stockActual: 10, precioVenta: 89.99 }
        ];
    }

    datosEjemploInsumos() {
        return [
            { nombreProducto: 'Hilo Polyester', unidadMedida: 'carrete', longitudTotal: 1000, stockActual: 15, stockMinimo: 5, precioVenta: 12.99 }
        ];
    }

    datosEjemploProductos() {
        return [
            { codigo: 'PROD-001', nombre: 'Conjunto Casual', stockActual: 2, stockMinimo: 3, precioVenta: 349.99, activo: true }
        ];
    }

    generarEncabezados(categoria) {
        const encabezados = {
            vestidos: ['Código SKU', 'Nombre', 'Color', 'Stock', 'Precio', 'Estado'],
            telas: ['Nombre', 'Composición', 'Ancho', 'Longitud', 'Stock', 'Precio'],
            insumos: ['Nombre', 'Unidad', 'Cantidad', 'Stock Mínimo', 'Precio', 'Estado'],
            productos: ['Código', 'Nombre', 'Stock', 'Stock Mínimo', 'Precio', 'Estado']
        };

        return encabezados[categoria].map(encabezado => 
            `<th>${encabezado}</th>`
        ).join('');
    }

    generarFilas(categoria, datos) {
        return datos.map(item => {
            switch(categoria) {
                case 'vestidos':
                    return `
                        <tr>
                            <td>${item.codigoSku || 'N/A'}</td>
                            <td>${item.nombreProducto || 'N/A'}</td>
                            <td>${item.color || 'N/A'}</td>
                            <td>${item.stockActual || 0}</td>
                            <td>$${item.precioVenta || 0}</td>
                            <td><span class="estado ${item.stockActual > 0 ? 'disponible' : 'agotado'}">${item.stockActual > 0 ? 'Disponible' : 'Agotado'}</span></td>
                        </tr>
                    `;
                case 'telas':
                    return `
                        <tr>
                            <td>${item.nombreProducto || 'N/A'}</td>
                            <td>${item.composicion || 'N/A'}</td>
                            <td>${item.ancho || 'N/A'} m</td>
                            <td>${item.longitudTotal || 0} m</td>
                            <td>${item.stockActual || 0}</td>
                            <td>$${item.precioVenta || 0}</td>
                        </tr>
                    `;
                case 'insumos':
                    return `
                        <tr>
                            <td>${item.nombreProducto || item.nombreInsumo || 'N/A'}</td>
                            <td>${item.unidadMedida || 'unidad'}</td>
                            <td>${item.longitudTotal || item.stockActual || 0}</td>
                            <td>${item.stockMinimo || 0}</td>
                            <td>$${item.precioVenta || 0}</td>
                            <td><span class="estado ${item.stockActual > (item.stockMinimo || 0) ? 'disponible' : 'bajo-stock'}">${item.stockActual > (item.stockMinimo || 0) ? 'OK' : 'Bajo Stock'}</span></td>
                        </tr>
                    `;
                case 'productos':
                    return `
                        <tr>
                            <td>${item.codigo || 'N/A'}</td>
                            <td>${item.nombre || 'N/A'}</td>
                            <td>${item.stockActual || 0}</td>
                            <td>${item.stockMinimo || 0}</td>
                            <td>$${item.precioVenta || 0}</td>
                            <td><span class="estado ${item.activo ? 'activo' : 'inactivo'}">${item.activo ? 'Activo' : 'Inactivo'}</span></td>
                        </tr>
                    `;
            }
        }).join('');
    }

// Modales
// Agrega estos métodos a tu clase InventarioManager
inicializarModales() {

    // Traemos el identificador de los Modales (del html..)
    // this.modalDetalles = document.getElementById('modal-detalles');
    // this.modalEditar = document.getElementById('modal-editar');
    this.modalAñadir = document.getElementById('modal-añadir');
    
    // Event listeners para cerrar modales
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => this.cerrarModales());
    });
    
    // botones "Cerrar" y "Cancelar" =>
    document.getElementById('btn-guardar').addEventListener('click', () => this.guardarProducto());
    document.getElementById('btn-cerrar-modal').addEventListener('click', () => this.cerrarModales());
    
    // Cerrar modal haciendo click fuera del contenido
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            this.cerrarModales();
        }
    });

    // Event listener para el botón guardar/agregar
    document.getElementById('btn-guardar').addEventListener('click', (e) => {
        e.preventDefault();
        this.guardarProducto();
    });
}

// Método para mostrar el modal para agregar un item al inventario
mostrarModalAgregar(titulo) { // Renombramos a 'titulo' para evitar confusiones
    console.log('📝 Abriendo modal para agregar producto...');
    
    // 1. OBTENER EL ELEMENTO DEL TÍTULO
    // Buscamos el elemento HTML del título dentro del contenedor del modal (this.modalAñadir)
    const tituloElemento = this.modalAñadir.querySelector('#modal-title'); 

    // 2. CAMBIAR TÍTULO (Usando el elemento DOM correcto)
    // Si pasamos un título, lo usamos; si no, usamos el valor por defecto ('Selecciona una Categoria').
    if (tituloElemento) {
        tituloElemento.textContent = titulo || 'Selecciona una Categoría';
    }
    
    const formulario = this.modalAñadir.querySelector('form');
    
    // Limpiar formulario
    if (formulario) {
        formulario.reset();
    }
    
    // 3. MOSTRAR MODAL (Usamos 'this.modalAñadir' en lugar de la variable 'modal' no definida)
    if (this.modalAñadir) {
        this.modalAñadir.style.display = 'block';
    }
    
    // 4. CAMBIAR TEXTO DEL BOTÓN GUARDAR
    // Buscamos el botón dentro del modal si es posible, o globalmente si no.
    const btnGuardar = this.modalAñadir.querySelector('#btn-guardar') || document.getElementById('btn-guardar');
    if (btnGuardar) {
        btnGuardar.textContent = 'Agregar Producto';
    }
}

// Cierre de modales 
cerrarModales() {
    // Este modal se abre cuando el usuario quiere editar un prodcuto, el botón que lo abre esta a un lado del item a editar
    // if (this.modalEditar) this.modalEditar.style.display = 'none';
    // Este modal sirve para añadir "algo" al inventario, en el modal se selecciona la categoria(producto, vestido, etc..)
    if (this.modalAñadir) this.modalAñadir.style.display = 'none';
}

}

// ✅ INICIALIZAR
let inventarioManager;

document.addEventListener('DOMContentLoaded', () => {
    //console.log'🔍 DEBUG: DOM completamente cargado');
    inventarioManager = new InventarioManager();
});

// ✅ FALLBACK: También intentar inicializar si el DOM ya está listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        inventarioManager = new InventarioManager();
    });
} else {
    inventarioManager = new InventarioManager();
}