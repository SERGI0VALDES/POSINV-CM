// Cliente API para simplificar llamadas
class API {
    // Manejo de errores centralizado
    static async handleResponse(promise) {
        try {
            const response = await promise;
            if (response.success) {
                return response.data;
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // USUARIOS
    static usuarios = {
        getAll: () => this.handleResponse(window.api.usuarios.getAll()),
        login: (user, pass) => this.handleResponse(window.api.usuarios.login(user, pass)),
        create: (data) => this.handleResponse(window.api.usuarios.create(data))
    };

    // PRODUCTOS
    static productos = {
        getAll: () => this.handleResponse(window.api.productos.getAll()),
        create: (data) => this.handleResponse(window.api.productos.create(data)),
        bajoStock: () => this.handleResponse(window.api.productos.bajoStock())
    };

    // INSUMOS
    static insumos = {
        getAll: () => this.handleResponse(window.api.insumos.getAll()),
        create: (data) => this.handleResponse(window.api.insumos.create(data)),
        update: (id, data) => this.handleResponse(window.api.insumos.update(id, data)),
        delete: (id) => this.handleResponse(window.api.insumos.delete(id)),
        getTotalMetros: () => this.handleResponse(window.api.insumos.getTotalMetros())
    };

    // TELAS
    static telas = {
        getAll: () => this.handleResponse(window.api.telas.getAll()),
        create: (data) => this.handleResponse(window.api.telas.create(data)),
        update: (id, data) => this.handleResponse(window.api.telas.update(id, data)),
        delete: (id) => this.handleResponse(window.api.telas.delete(id)),
        getEstadisticas: () => this.handleResponse(window.api.telas.getEstadisticas()),
        getBajaLongitud: (long) => this.handleResponse(window.api.telas.getBajaLongitud(long))
    };

    // VESTIDOS
    static vestidos = {
        getAll: () => this.handleResponse(window.api.vestidos.getAll()),
        create: (data) => this.handleResponse(window.api.vestidos.create(data)),
        update: (id, data) => this.handleResponse(window.api.vestidos.update(id, data)),
        delete: (id) => this.handleResponse(window.api.vestidos.delete(id)),
        getBySku: (sku) => this.handleResponse(window.api.vestidos.getBySku(sku)),
        getEstadisticas: () => this.handleResponse(window.api.vestidos.getEstadisticas()),
        getColores: () => this.handleResponse(window.api.vestidos.getColores())
    };

    // PEDIDOS
    static pedidos = {
        getAll: () => this.handleResponse(window.api.pedidos.getAll()),
        create: (data) => this.handleResponse(window.api.pedidos.create(data)),
        updateEstado: (id, estado) => this.handleResponse(window.api.pedidos.updateEstado(id, estado))
    };

    // INVENTARIO
    static inventario = {
        getAll: () => this.handleResponse(window.api.inventario.getAll()),
        registrar: (data) => this.handleResponse(window.api.inventario.registrar(data))
    };
}