document.addEventListener('DOMContentLoaded', () => {
    const openFolderBtn = document.getElementById('openFolderBtn');
    
    openFolderBtn.addEventListener('click', () => {
        // La ruta de la carpeta de Windows a abrir:
        const reportPath = 'D:\\reportes'; 
        
        // Llamamos a la función expuesta globalmente por el preload script.
        // Esto envía el path al proceso principal de forma segura.
        if (window.appAPI && window.appAPI.openExternalPath) {
            window.appAPI.openExternalPath(reportPath);
        } else {
            console.error('El API de Electron no está disponible. Asegúrate de que preload.js se esté cargando.');
        }
    });
});