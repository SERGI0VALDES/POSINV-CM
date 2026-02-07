import { FormManager } from './formularios/index.js';

// Inicializar manager global
window.FormManager = new FormManager();

// Función global para cerrar modal
window.cerrarModal = () => window.FormManager.cerrarModal();

// Función para cargar tabla (compatibilidad con código existente)
const cargarTablaVestidos = () => {
  if (window.inventarioManager) {
    window.inventarioManager.mostrarInventario('vestidos');
  } else {
    console.error('InventarioManager no está listo');
  }
};

// Exportar para usar en otros módulos
export { 
  FormManager, 
  cargarTablaVestidos 
};