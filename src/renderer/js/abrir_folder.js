// D:\POSINVCM\src\renderer\js\abrir_folder.js

// 🚨 IMPORTANTE: Define la ruta ABSOLUTA de la carpeta de reportes aquí.
// Ejemplo: 'D:\\ReportesCM' o 'C:\\Usuarios\\TuUsuario\\MisReportes'
// ASEGÚRATE de usar DOBLE BARRA INVERTIDA (\\) en Windows.
const RUTA_CARPETA_REPORTES = 'D:\\reportes'; 

document.addEventListener('DOMContentLoaded', () => {
    
    const openFolderBtn = document.getElementById('abrirCarpeta');

    if (openFolderBtn) {
        openFolderBtn.addEventListener('click', () => {
            
            // 1. Verificación de la API expuesta por preload.js
            if (window.electronAPI && typeof window.electronAPI.abrirCarpeta === 'function') {
                console.log(`[RENDERER] Solicitando abrir carpeta: ${RUTA_CARPETA_REPORTES}`);
                
                // 2. Llamada segura al proceso Main a través de la API expuesta (IPC)
                // Usamos .invoke, que devuelve una Promesa.
                window.electronAPI.abrirCarpeta(RUTA_CARPETA_REPORTES)
                    .then((result) => {
                        // El Main process devuelve { success: true } o { success: false, error: message }
                        if (result.success) {
                            console.log(`[RENDERER] Carpeta abierta con éxito.`);
                        } else {
                            console.error(`[RENDERER] Fallo al abrir carpeta: ${result.error}`);
                            alert(`❌ Error al abrir la carpeta: ${result.error}. Revisa la ruta configurada.`);
                        }
                    })
                    .catch((error) => {
                        console.error("[RENDERER] Error en la promesa IPC:", error);
                        alert("Error de comunicación con el proceso principal.");
                    });
            } else {
                console.error("[RENDERER] La API 'electronAPI.abrirCarpeta' no está disponible. Revisa preload.js.");
                alert("Error de configuración: Funcionalidad de apertura no disponible.");
            }
        });
    } else {
        console.error("No se encontró el botón con ID 'abrirCarpeta' en el DOM para adjuntar el evento.");
    }
});