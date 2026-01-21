const sqlite3 = require('better-sqlite3'); // Ahora que lo instalaste, funcionará
const path = require('path');
const fs = require('fs');

class DatabaseManager {
    constructor() {
        this.db = null;
    }

    async init() {
        if (this.db) return this.db;

        const dbPath = path.join(__dirname, '../data/POSINVCM.db');

        try {
            // Abrimos la conexión
            this.db = new sqlite3(dbPath, { verbose: console.log });
            console.log('✅ Conexión a SQLite establecida');

            // 🚀 Ejecutamos el Schema cada vez que iniciamos
            this.cargarSchema();

            // Opcional: Ejecutar configuraciones iniciales de SQLite
            // this.db.pragma('journal_mode = WAL');
            
            return this.db;
        } catch (error) {
            console.error('❌ Error conectando a SQLite:', error);
            throw error;
        }
    }
    // Método para cargar y ejecutar el schema.sql
    cargarSchema() {
        try {
            const schemaPath = path.join(__dirname, './schema.sql');
            const schema = fs.readFileSync(schemaPath, 'utf8');
            this.db.exec(schema); // Ejecuta todo el SQL de golpe
            console.log('✅ Estructura de base de datos (Tablas, Triggers y Vistas) sincronizada.');
        } catch (error) {
            console.error('❌ Error cargando el schema.sql:', error);
        }
    }

    prepare(sql) {
        if (!this.db) throw new Error("Base de datos no inicializada.");
        return this.db.prepare(sql);
    }

    // Proxy para transaction
    transaction(fn) {
        if (!this.db) throw new Error("Base de datos no inicializada.");
        return this.db.transaction(fn);
    }

    // ✅ ESTO ARREGLA EL ERROR "db.close is not a function"
    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
            console.log('🔒 Conexión de base de datos cerrada.');
        }
    }
}

const dbInstance = new DatabaseManager();
module.exports = dbInstance;