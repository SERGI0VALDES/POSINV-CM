// ESTE CÓDIGO SE EJECUTA EN EL PROCESO DEL RENDERER (el navegador)

// Importar la clase InventarioManager
import { InventarioManager } from '../js/inventario.js'; 

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    
    console.log('Renderer: Inicializando InventarioManager y conectando botones...');
    
    // Instanciar la clase
    // Esta instancia contiene el método mostrarModalAgregar
    const inventarioManager = new InventarioManager();

    // Exponer la instancia al ámbito global (window)
    // Esto es NECESARIO para que los botones en el HTML puedan llamar a sus métodos
    // usando atributos onclick (ej: <button onclick="window.inventarioManager.mostrarModalAgregar('vestidos')">)
    window.inventarioManager = inventarioManager;
    
    // -----------------------------------------------------------------
    // Conectar los botones 
    // -----------------------------------------------------------------
    
    // Configuración de botones por categoría
    const configuracionBotones = [
        { id: 'agregar-vestido', categoria: 'vestidos' },
        { id: 'agregar-tela', categoria: 'telas' },
        { id: 'agregar-insumo', categoria: 'insumos' },
        { id: 'agregar-producto', categoria: 'productos' }
    ];

    // Función para conectar botones por categoría
    function conectarBotonesCategoria() {
        configuracionBotones.forEach(({ id, categoria }) => {
            const boton = document.getElementById(id);
            if (boton) {
                boton.addEventListener('click', () => {
                    inventarioManager.mostrarModalAgregar(categoria);
                });
                console.log(`Botón ${id} conectado.`);
            } else {
                console.warn(`Botón ${id} no encontrado en el DOM.`);
            }
        });
    }

    // Función para conectar botón principal de añadir inventario
    function conectarBotonPrincipal() {
        const btnAnadirInv = document.getElementById('btn-añadir-inv');
        if (btnAnadirInv) {
            btnAnadirInv.addEventListener('click', () => {
                // Llama al nuevo método para mostrar el modal de categorías
                inventarioManager.abrirModalCategoria();
            });
            console.log('Botón principal btn-añadir-inv conectado.');
        } else {
            console.warn('Botón principal btn-añadir-inv no encontrado. Revisa tu HTML.');
        }
    }

    // Función para conectar botón cerrar modal categorías
    function conectarBotonCerrarCategoria() {
        const btnCerrarCategoria = document.getElementById('btn-inv-cerrar-modal');
        if (btnCerrarCategoria) {
            btnCerrarCategoria.addEventListener('click', () => {
                inventarioManager.cerrarModalCategoria();
            });
            console.log('Botón de cierre de categorías conectado.');
        }
    }

    // Ejecutar todas las conexiones de botones
    conectarBotonesCategoria();
    conectarBotonPrincipal();
    conectarBotonCerrarCategoria();

    // Mensaje de finalización
    console.log('Todos los botones han sido configurados correctamente.');
});