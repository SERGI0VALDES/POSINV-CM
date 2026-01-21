// ESTE CÓDIGO SE EJECUTA EN EL PROCESO DEL RENDERER (el navegador)

// 1. Importar la clase InventarioManager
import { InventarioManager } from '../js/inventario.js'; 
// Asegúrate de que la ruta sea correcta desde este archivo a inventario.js

// 2. Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Renderer: Inicializando InventarioManager y conectando botones...');
    
    // 3. Instanciar la clase. 
    // Esta instancia contiene el método mostrarModalAgregar.
    const inventarioManager = new InventarioManager();

    // 4. Exponer la instancia al ámbito global (window).
    // Esto es NECESARIO para que los botones en el HTML puedan llamar a sus métodos
    // usando atributos onclick (ej: <button onclick="window.inventarioManager.mostrarModalAgregar('vestidos')">).
    window.inventarioManager = inventarioManager;
    
    // -----------------------------------------------------------------
    // 5. Conectar los botones (Mejor práctica con addEventListener)
    // -----------------------------------------------------------------
    
    const botonesConexion = [
        { id: 'agregar-vestido', categoria: 'vestidos' },
        { id: 'agregar-tela', categoria: 'telas' },
        { id: 'agregar-insumo', categoria: 'insumos' },
        { id: 'agregar-producto', categoria: 'productos' }
    ];

    botonesConexion.forEach(({ id, categoria }) => {
        const boton = document.getElementById(id);
        if (boton) {
            boton.addEventListener('click', () => {
                inventarioManager.mostrarModalAgregar(categoria);
            });
            console.log(`✅ Botón ${id} conectado.`);
        } else {
            console.warn(`⚠️ Botón ${id} no encontrado en el DOM.`);
        }
    });

    // Event listern para el botón principal de añadir inventario
    const btnAnadirInv = document.getElementById('btn-añadir-inv');
    if (btnAnadirInv) {
        btnAnadirInv.addEventListener('click', () => {
            // Llama al nuevo método para mostrar el modal de categorías
            inventarioManager.abrirModalCategoria();
        });
        console.log('✅ Botón principal btn-añadir-inv conectado.');
    } else {
        console.warn('⚠️ Botón principal btn-añadir-inv no encontrado. Revisa tu HTML.');
    }
    // Event listern para el botón cerrar modal categorías
    const btnCerrarCategoria = document.getElementById('btn-inv-cerrar-modal'); 
    if (btnCerrarCategoria) {
        btnCerrarCategoria.addEventListener('click', () => {
            inventarioManager.cerrarModalCategoria();
        });
        console.log('✅ Botón de cierre de categorías conectado.');
    }
});