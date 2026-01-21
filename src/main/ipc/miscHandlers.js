// src/main/handlers/miscHandlers.js
const { ipcMain, shell } = require('electron');
const fs = require('fs').promises;
const path = require('path');

class MiscHandlers {
    constructor() {
        this.handlersRegistered = false;
    }

    registerHandlers() {
        if (this.handlersRegistered) {
            console.log('⚠️ Handlers misceláneos ya registrados');
            return;
        }

        console.log('📝 Registrando handlers misceláneos...');

        // Handler básico de prueba
        ipcMain.handle('ping', () => {
            console.log('🏓 Ping recibido');
            return 'pong';
        });

        // Handler para abrir carpetas
        ipcMain.handle('abrir-carpeta', async (event, folderPath) => {
            console.log('📁 Abrir carpeta:', folderPath);
            try {
                if (folderPath && typeof folderPath === 'string' && folderPath.trim() !== '') {
                    await shell.openPath(folderPath.trim());
                    return { success: true };
                } else {
                    console.warn('⚠️ Ruta de carpeta no válida o vacía');
                    return { success: false, error: 'Ruta de carpeta no válida' };
                }
            } catch (error) {
                console.error('Error al abrir la ruta:', error);
                return { success: false, error: error.message };
            }
        });

        this.handlersRegistered = true;
        console.log('✅ Handlers misceláneos registrados');
    }

    unregisterHandlers() {
        ipcMain.removeHandler('ping');
        ipcMain.removeHandler('abrir-carpeta');
        
        this.handlersRegistered = false;
        console.log('🗑️ Handlers misceláneos removidos');
    }
}

module.exports = MiscHandlers;