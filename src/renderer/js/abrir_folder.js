// abrir_folder.js - VERSIÓN ACTUALIZADA
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔧 abrir_folder.js cargado - Buscando botones...');
    
    const openFolderBtn = document.getElementById('openFolderBtn');
    const openFolderFichasBtn = document.getElementById('openFolderFichas');

    // Función genérica para abrir una ruta externa
    const handleOpenFolder = async (path) => {
        console.log('📁 Intentando abrir ruta:', path);
        
        // ✅ Usar window.electronAPI que es lo que expone tu preload.js
        if (window.electronAPI && typeof window.electronAPI.abrirCarpeta === 'function') {
            try {
                const resultado = await window.electronAPI.abrirCarpeta(path);
                if (resultado.success) {
                    console.log('✅ Carpeta abierta exitosamente');
                } else {
                    console.error('❌ Error al abrir carpeta:', resultado.error);
                    alert('Error al abrir la carpeta: ' + resultado.error);
                }
            } catch (error) {
                console.error('💥 Error inesperado:', error);
                alert('Error inesperado al abrir la carpeta');
            }
        } else {
            console.error('❌ Electron API no disponible en abrir_folder.js');
            console.log('ℹ️ window.electronAPI disponible:', !!window.electronAPI);
            if (window.electronAPI) {
                console.log('ℹ️ Métodos disponibles:', Object.keys(window.electronAPI));
            }
            alert('La función de abrir carpetas no está disponible en este momento.');
        }
    };
    
    // 1. Configurar listener para el botón de Reportes
    if (openFolderBtn) {
        console.log('✅ Botón openFolderBtn encontrado');
        openFolderBtn.addEventListener('click', () => {
            const reportPath = 'D:\\reportes'; 
            handleOpenFolder(reportPath);
        });
    } else {
        console.log('⚠️ Botón openFolderBtn no encontrado');
    }

    // 2. Configurar listener para el botón de Fichas
    if (openFolderFichasBtn) {
        console.log('✅ Botón openFolderFichas encontrado');
        openFolderFichasBtn.addEventListener('click', () => {
            const fichasPath = 'D:\\fichas';
            handleOpenFolder(fichasPath);
        });
    } else {
        console.log('⚠️ Botón openFolderFichas no encontrado');
    }
});