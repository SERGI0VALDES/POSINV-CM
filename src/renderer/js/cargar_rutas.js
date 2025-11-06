// main.js

import { SCREENS_PATHS} from '../utils/rutas.js'; // Ajusta la ruta


function cargar_rutas() {
    
    // 1. Buscar todos los elementos <a> que tengan el atributo data-screen
    const elementosScreen = document.querySelectorAll('a[data-screen]');

    // 2. Iterar sobre todos los elementos encontrados
    elementosScreen.forEach(a => {
        
        // 3. Obtener el nombre de la clave del diccionario desde el atributo data-screen
        const nombreScreen = a.dataset.screen;
        
        // 4. Buscar la ruta en el diccionario central
        const rutaScreen = SCREENS_PATHS[nombreScreen];

        // 5. Inyectar la ruta si existe
        if (rutaScreen) {
            a.href = rutaScreen;
        } else {
            console.warn(`Ruta no encontrada para la pantalla: ${nombreScreen}`);
        }
    });
}

// Ejecutar la función cuando el DOM esté listo

document.addEventListener('DOMContentLoaded', cargar_rutas);
