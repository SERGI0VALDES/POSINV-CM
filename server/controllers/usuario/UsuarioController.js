const getDatabase = require('../../database/connection.js');
const db = getDatabase();

class UsuarioController {
    
    // Obtener todos los usuarios
    static getAll() {
        try {
            return db.prepare('SELECT int, nombreUsuario, rol, activo FROM USUARIO').all();
        } catch (error) {
            throw new Error('Error obteniendo usuarios: ' + error.message);
        }
    }

    // Obtener usuario por ID
    static getById(id) {
        try {
            return db.prepare('SELECT int, nombreUsuario, rol, activo FROM USUARIO WHERE int = ?').get(id);
        } catch (error) {
            throw new Error('Error obteniendo usuario: ' + error.message);
        }
    }

    // Login
    static login(nombreUsuario, password) {
        try {
            const usuario = db.prepare(
                'SELECT int, nombreUsuario, rol, activo FROM USUARIO WHERE nombreUsuario = ? AND hashPassword = ? AND activo = 1'
            ).get(nombreUsuario, password);
            
            if (!usuario) {
                throw new Error('Usuario o contraseña incorrectos');
            }
            
            return usuario;
        } catch (error) {
            throw new Error('Error en login: ' + error.message);
        }
    }

    // Crear usuario
    static create(data) {
        try {
            const { nombreUsuario, hashPassword, rol = 'usuario', activo = 1 } = data;
            
            const stmt = db.prepare(
                'INSERT INTO USUARIO (nombreUsuario, hashPassword, rol, activo) VALUES (?, ?, ?, ?)'
            );
            
            const result = stmt.run(nombreUsuario, hashPassword, rol, activo);
            return this.getById(result.lastInsertRowid);
        } catch (error) {
            throw new Error('Error creando usuario: ' + error.message);
        }
    }

    // Actualizar usuario
    static update(id, data) {
        try {
            const { nombreUsuario, hashPassword, rol, activo } = data;
            
            const stmt = db.prepare(
                'UPDATE USUARIO SET nombreUsuario = ?, hashPassword = ?, rol = ?, activo = ? WHERE int = ?'
            );
            
            stmt.run(nombreUsuario, hashPassword, rol, activo, id);
            return this.getById(id);
        } catch (error) {
            throw new Error('Error actualizando usuario: ' + error.message);
        }
    }

    // Eliminar usuario
    static delete(id) {
        try {
            const stmt = db.prepare('DELETE FROM USUARIO WHERE int = ?');
            return stmt.run(id);
        } catch (error) {
            throw new Error('Error eliminando usuario: ' + error.message);
        }
    }
}

module.exports = UsuarioController;