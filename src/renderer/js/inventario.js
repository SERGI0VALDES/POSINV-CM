// 1. Importar el FormularioManager para que esté disponible dentro de esta clase
import { FormularioManager } from '../templates/formAñadir.js';

// inventario.js - VERSIÓN DEBUG
export class InventarioManager {
    constructor() {
       
        console.log('InventarioManager inicializado');

        this.categoriaActual = null;
        // CONTENEDOR PRINCIPAL DEL INVENTARIO
        this.contenedor = null;
        // CONTENEDOR DEL MODAL AÑADIR INVENTARIO
        this.contenedorAñadir = null;

        this.init();
    }

    init() {
        //console.log('🔍 DEBUG: Inicializando módulo de inventarios...');

        // ✅ DEBUG: Listar todos los elementos en la página
        // this.debugElementosPagina();
        
        // ✅ BUSCAR EL CONTENEDOR PRINCIPAL DE FORMA MÁS FLEXIBLE
        this.contenedor = document.getElementById('contenedor-inventario');

        // BUSCAR EL CONTENEDOR DEL MODAL AÑADIR INVENTARIO
        this.contenedorAñadir = document.getElementById('modal-inv-categorias');
        
        // VERIFICAR SI SE ENCONTRO EL CONTENEDOR PRINCIPAL
        if (!this.contenedor) {
            console.error('❌ DEBUG: No se encontró elemento con id "contenedor-inventario"');
            console.log('🔍 DEBUG: Buscando elementos con clase "inventarios"...');
            
            // Intentar buscar por clase
            const elementosPorClase = document.getElementsByClassName('inventarios');
            if (elementosPorClase.length > 0) {
                this.contenedor = elementosPorClase[0];
                console.log('✅ DEBUG: Encontrado por clase "inventarios"');
            } else {
                console.error('❌ DEBUG: Tampoco se encontró por clase "inventarios"');
                this.mostrarErrorGlobal('Error crítico: No se pudo encontrar el contenedor de inventarios');
                return;
            }
        }
        
        // VERIFICAR SI SE ENCONTRO EL CONTENEDOR DEL MODAL AÑADIR INVENTARIO
        if (!this.contenedorAñadir){
            console.error('DEBUG: No se encontró elemento con id "modal-añadir"');
        }

        // LOGS DE VERIFICACIÓN
        console.log('✅ DEBUG: Contenedores encontrados:', this.contenedor, ',' , this.contenedorAñadir);
        
        // CARGAR FECHA ACTUAL
        this.cargarFechaActual();
        // AGREGAR EVENT LISTENERS
        this.agregarEventListeners();

        // MENSAJE FINAL DE INICIALIZACIÓN
        console.log('✅ Módulo de inventarios inicializado correctamente');
    }

    /*
    debugElementosPagina() {
        console.log('🔍 DEBUG: Elementos en la página:');
        console.log('- Body:', document.body);
        console.log('- Main:', document.querySelector('main'));
        console.log('- Todos los divs:', document.querySelectorAll('div').length);
        
        // Listar todos los IDs en la página
        const todosLosElementos = document.querySelectorAll('*[id]');
        console.log('🔍 DEBUG: IDs encontrados en la página:');
        todosLosElementos.forEach(el => {
            console.log(`  - ${el.id}`);
        });
    }*/

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
                // console.log('✅ Fecha cargada correctamente');
            } else {
                console.warn('⚠️ No se encontró el elemento para la fecha');
            }
        } catch (error) {
            console.error('Error cargando fecha:', error);
        }
    }

    agregarEventListeners() {
        console.log('🔍 DEBUG: Agregando event listeners...');
        
        const botones = {
            'btn-vestidos': () => this.mostrarInventario('vestidos'),
            'btn-telas': () => this.mostrarInventario('telas'),
            'btn-insumos': () => this.mostrarInventario('insumos'),
            'btn-productos': () => this.mostrarInventario('productos')
        };

        Object.keys(botones).forEach(botonId => {
            const boton = document.getElementById(botonId);
            if (boton) {
                boton.addEventListener('click', botones[botonId]);
                console.log(`✅ Event listener agregado a: ${botonId}`);
            } else {
                console.error(`❌ NO SE ENCONTRÓ EL BOTÓN: ${botonId}`);
                
                // Debug: mostrar todos los botones
                const todosLosBotones = document.querySelectorAll('button');
                console.log('🔍 DEBUG: Todos los botones en la página:');
                todosLosBotones.forEach((btn, index) => {
                    console.log(`  ${index}:`, btn.textContent, btn.id);
                });
            }
        });
    }

    /*METODO PRINCIPAL PARA MOSTRAR INVENTARIO ->
    async mostrarInventario(categoria) {
        console.log(`🔍 DEBUG: Mostrar inventario llamado para: ${categoria}`);
        console.log(`🔍 DEBUG: this.contenedor =`, this.contenedor);
        
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
            console.log(`📦 Cargando inventario: ${categoria}`);
            
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
            
            console.log(`✅ Datos obtenidos para ${categoria}:`, datos);
            
            // Renderizar la tabla
            this.renderizarTabla(categoria, datos);
            
        } catch (error) {
            console.error('❌ Error cargando inventario:', error);
            this.mostrarError('Error al cargar el inventario: ' + error.message);
        }
    }
    **/

    async mostrarInventario(categoria) {
        console.log(`🔍 DEBUG: Solicitando inventario real de: ${categoria}`);
        
        try {
            this.categoriaActual = categoria;
            this.mostrarLoading();

            // 1. Llamamos a la API usando el nombre de la categoría
            // Ejemplo: window.electronAPI['vestidos'].getAll()
            const respuesta = await window.electronAPI[categoria].getAll();

            // 2. Verificamos si la respuesta fue exitosa según tus handlers
            if (respuesta && respuesta.success) {
                console.log(`✅ Datos recibidos para ${categoria}:`, respuesta.data);
                
                // 3. Pasamos respuesta.data (donde están los registros) a la tabla
                this.renderizarTabla(categoria, respuesta.data);
            } else {
                throw new Error(respuesta.error || 'Error desconocido en el servidor');
            }
            
        } catch (error) {
            console.error('❌ Error cargando inventario:', error);
            this.mostrarError('Error al conectar con la base de datos: ' + error.message);
        }
    }

   // Abrir el modal de selección de categorías
    abrirModalCategoria() {
        // CAMBIO DE ID
        const modal = document.getElementById('modal-inv-categorias'); 
        if (modal) {
            modal.classList.add('active'); 
            console.log('✅ Modal de categorías #modal-inv-categorias abierto.');
        } else {
            console.error('❌ Elemento #modal-inv-categorias no encontrado.');
        }
    }

    // Cerrar el modal de selección de categorías
    cerrarModalCategoria() {
        // CAMBIO DE ID
        const modal = document.getElementById('modal-inv-categorias'); 
        if (modal) {
            modal.classList.remove('active');
            console.log('✅ Modal de categorías #modal-inv-categorias cerrado.');
        }
    }

    // ESTE MÉTODO NOS AYUDARA A ABRIR EL MODAL "AÑADIR INVENTARIO" SEGÚN LA CATEGORÍA
    mostrarModalAgregar(categoria) {
        // Cerrar el modal de categorias si esta abierto
        this.cerrarModalCategoria();

        console.log(`📝 Mostrando modal para agregar ${categoria}`);
        
        const titulos = {
            'vestidos': 'Agregar Nuevo Vestido',
            'telas': 'Agregar Nueva Tela',
            'insumos': 'Agregar Nuevo Insumo',
            'productos': 'Agregar Nuevo Producto'
        };
        
        if (!FormularioManager) {
            console.error('❌ FormularioManager no está disponible');
            this.mostrarModalBasico(categoria);
            return;
        }
        
        try {
            FormularioManager.abrirModalFormulario(categoria, titulos[categoria] || 'Agregar Item');
        } catch (error) {
            console.error('❌ Error abriendo modal:', error);
            this.mostrarModalBasico(categoria);
        }
    }  

    /*
    async guardarItem(categoria, datos) {
    console.log(`💾 Guardando ${categoria} vía API real:`, datos);
    
    try {
        let resultado;
        
        // Llamamos dinámicamente al objeto de la API según la categoría
        if (window.electronAPI[categoria] && window.electronAPI[categoria].create) {
            resultado = await window.electronAPI[categoria].create(datos);
        } else {
            throw new Error(`La API para la categoría ${categoria} no está definida.`);
        }

        // Si el resultado es exitoso (dependiendo de cómo lo maneje tu main.js)
        if (resultado) {
            console.log(`✅ ${categoria} guardado con éxito`);
            // Refrescar la vista actual para ver el nuevo registro
            this.mostrarInventario(categoria); 
            return { success: true, data: resultado };
        }
        
    } catch (error) {
        console.error(`❌ Error al guardar en ${categoria}:`, error);
        alert(`No se pudo guardar: ${error.message}`);
        throw error;
    }
    }**/

    async guardarItem(categoria, datos) {
        console.log(`💾 Guardando en ${categoria}:`, datos);
        
        try {
            // Llamada dinámica al método create de la categoría
            const respuesta = await window.electronAPI[categoria].create(datos);
            
            if (respuesta && respuesta.success) {
                console.log(`✅ Registro creado exitosamente en ${categoria}`);
                
                // Recargamos la tabla para ver el nuevo registro inmediatamente
                this.mostrarInventario(categoria);
                
                return respuesta;
            } else {
                throw new Error(respuesta.error || 'No se pudo guardar el registro');
            }
        } catch (error) {
            console.error(`❌ Error en guardarItem:`, error);
            alert('Error al guardar: ' + error.message);
            throw error;
        }
    }

    // Método de fallback para modal básico
    mostrarModalBasico(categoria) {
        const modalHtml = `
            <div class="modal-basico">
                <div class="modal-basico-overlay" onclick="this.parentElement.remove()"></div>
                <div class="modal-basico-content">
                    <h3>Agregar ${categoria}</h3>
                    <p>Formulario no disponible temporalmente</p>
                    <button onclick="this.closest('.modal-basico').remove()">Cerrar</button>
                </div>
            </div>
        `;
        
        const modal = document.createElement('div');
        modal.innerHTML = modalHtml;
        document.body.appendChild(modal.firstElementChild);
    }

    // MÉTODOS VISUALES CON VERIFICACIÓN DE CONTENEDOR
    mostrarLoading() {
        console.log('🔍 DEBUG: mostrarLoading() llamado');
        console.log('🔍 DEBUG: this.contenedor en mostrarLoading:', this.contenedor);
        
        if (!this.contenedor) {
            console.error('❌ ERROR: this.contenedor es null en mostrarLoading');
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
        console.log('🔍 DEBUG: mostrarError() llamado');
        console.log('🔍 DEBUG: this.contenedor en mostrarError:', this.contenedor);
        
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
        console.log('🔍 DEBUG: renderizarTabla() llamado');
        console.log('🔍 DEBUG: this.contenedor en renderizarTabla:', this.contenedor);
        
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
        console.log('✅ Tabla renderizada correctamente');
    }

    // MÉTODOS PARA OBTENER DATOS UTILIZANDO LA API DE ELECTRON
    // inventario.js - MÉTODOS ACTUALIZADOS PARA API REAL

    async obtenerVestidos() {
        try {
            console.log('🔍 Obteniendo vestidos reales...');
            const respuesta = await window.electronAPI.vestidos.getAll();
            // Si tu main.js devuelve directamente el array de filas:
            return respuesta || []; 
        } catch (error) {
            console.error('Error al conectar con API de vestidos:', error);
            return [];
        }
    }

    async obtenerTelas() {
        try {
            const respuesta = await window.electronAPI.telas.getAll();
            return respuesta || [];
        } catch (error) {
            console.error('Error en API telas:', error);
            return [];
        }
    }

    async obtenerInsumos() {
        try {
            const respuesta = await window.electronAPI.insumos.getAll();
            return respuesta || [];
        } catch (error) {
            return [];
        }
    }

    async obtenerProductos() {
        try {
            const respuesta = await window.electronAPI.productos.getAll();
            return respuesta || [];
        } catch (error) {
            return [];
        }
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
    if (!datos || datos.length === 0) {
        return `<tr><td colspan="10" style="text-align:center;">No hay registros en esta categoría</td></tr>`;
    }

    return datos.map(item => {
        switch (categoria) {
            case 'vestidos':
                return `
                    <tr>
                        <td>${item.codigo_sku || 'N/A'}</td>
                        <td>${item.nombre_producto || 'N/A'}</td>
                        <td>${item.color || 'N/A'}</td>
                        <td>${item.stock_actual || 0}</td>
                        <td>$${item.precio_venta || 0}</td>
                        <td><span class="estado ${item.stock_actual > 0 ? 'disponible' : 'agotado'}">
                            ${item.stock_actual > 0 ? 'Disponible' : 'Agotado'}
                        </span></td>
                    </tr>`;

            case 'telas':
                return `
                    <tr>
                        <td>${item.nombre_producto || 'N/A'}</td>
                        <td>${item.composicion || 'N/A'}</td>
                        <td>${item.ancho || 0} m</td>
                        <td>${item.longitud_total || 0} m</td>
                        <td>${item.stock_actual || 0}</td>
                        <td>$${item.precio_venta || 0}</td>
                    </tr>`;

            case 'insumos':
                return `
                    <tr>
                        <td>${item.nombre_producto || 'N/A'}</td>
                        <td>${item.unidad_medida || 'Unid.'}</td>
                        <td>${item.stock_actual || 0}</td>
                        <td>$${item.precio_venta || 0}</td>
                        <td>${item.descripcion || '-'}</td>
                    </tr>`;

            case 'productos':
            case 'prodTerminados':
                return `
                    <tr>
                        <td>${item.nombre_producto || 'N/A'}</td>
                        <td>${item.tipo || 'General'}</td>
                        <td>${item.stock_actual || 0}</td>
                        <td>$${item.precio_venta || 0}</td>
                        <td><button class="btn-accion" onclick="verDetalle(${item.id})">👁️</button></td>
                    </tr>`;

            default:
                return `<tr><td colspan="5">Categoría no reconocida</td></tr>`;
        }
    }).join('');
}
}

// ✅ INICIALIZAR
let inventarioManager;

document.addEventListener('DOMContentLoaded', () => {
    // console.log('🔍 DEBUG: DOM completamente cargado');
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