// server/database/connection.js - REEMPLAZAR TODO con:
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

class DatabaseManager {
    constructor() {
        this.db = null;
        this.dbPath = this.getDatabasePath();
    }

    getDatabasePath() {
        const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
        
        if (isDev) {
            const dbDir = path.join(__dirname, '../data');
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
            return path.join(dbDir, 'POSINVCM_DB.db');
        } else {
            return path.join(app.getPath('userData'), 'POSINVCM_DB.db');
        }
    }

    init() {
        return new Promise((resolve, reject) => {
            console.log('📊 Conectando a:', this.dbPath);
            
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('❌ Error conectando a SQLite:', err);
                    reject(err);
                } else {
                    console.log('✅ Conexión a SQLite establecida');
                    
                    // Configuraciones
                    this.db.run('PRAGMA foreign_keys = ON');
                    this.db.run('PRAGMA journal_mode = WAL');
                    
                    this.createTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }

    createTables() {
        return new Promise((resolve, reject) => {
            // TODO: Copiar aquí tu script SQL completo
            const sqlScript = `...`; // Tu SQL aquí
            
            this.db.exec(sqlScript, (err) => {
                if (err) {
                    console.error('❌ Error creando tablas:', err);
                    reject(err);
                } else {
                    console.log('✅ Tablas creadas/verificadas correctamente');
                    resolve();
                }
            });
        });
    }

    // Métodos de conveniencia
    prepare(sql) {
        return {
            all: (params = []) => {
                return new Promise((resolve, reject) => {
                    this.db.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });
            },
            get: (params = []) => {
                return new Promise((resolve, reject) => {
                    this.db.get(sql, params, (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    });
                });
            },
            run: (params = []) => {
                return new Promise((resolve, reject) => {
                    this.db.run(sql, params, function(err) {
                        if (err) reject(err);
                        else resolve({ 
                            lastInsertRowid: this.lastID, 
                            changes: this.changes 
                        });
                    });
                });
            }
        };
    }

    close() {
        if (this.db) {
            this.db.close();
        }
    }
}

// Singleton
let databaseInstance = null;

function getDatabase() {
    if (!databaseInstance) {
        databaseInstance = new DatabaseManager();
    }
    return databaseInstance;
}

module.exports = getDatabase;