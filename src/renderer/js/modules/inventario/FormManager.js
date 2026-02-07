import { FormHelpers } from '../utils/FormHelpers.js';
import { ApiClient } from './utils/ApiClient.js';
import { 
  VestidoForm, 
  ProductoForm, 
  TelaForm, 
  InsumoForm 
} from './Index.js';

export class FormManager {
  constructor() {
    this.formularios = {
      vestidos: new VestidoForm(),
      productos: new ProductoForm(),
      telas: new TelaForm(),
      insumos: new InsumoForm()
    };
    
    this.apiClient = new ApiClient();
  }

  // Generar formulario por categoría
  generarFormulario(categoria, datos = {}) {
    const formulario = this.formularios[categoria];
    if (!formulario) {
      throw new Error(`Categoría no soportada: ${categoria}`);
    }
    
    return formulario.generar(datos);
  }

  // Abrir modal con formulario
  abrirModalFormulario(categoria, titulo, modo = 'crear', idActual = null) {
    // Cerrar modal existente
    this.cerrarModal();
    
    // Generar HTML del modal
    const modalHtml = `
      <div class="modal-inventario active">
        <div class="modal-content">
          <div class="modal-header">
            <h2>${titulo}</h2>
            <button class="modal-close" onclick="window.FormManager.cerrarModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-body" id="modal-form-body">
            ${this.generarFormulario(categoria)}
          </div>
        </div>
      </div>
    `;
    
    // Insertar en DOM
    const modalElement = document.createElement('div');
    modalElement.innerHTML = modalHtml;
    document.body.appendChild(modalElement.firstElementChild);
    
    // Configurar formulario
    const form = document.getElementById('modal-añadir');
    if (form) {
      form.dataset.modo = modo;
      if (idActual) form.dataset.idActual = idActual;
      
      if (modo === 'crear') {
        form.reset();
      } else {
        const btnGuardar = form.querySelector('.btn-guardar');
        if (btnGuardar) {
          btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        }
      }
      
      // Configurar submit
      this.configurarSubmit(categoria, form, modo, idActual);
      
      // Inicializar campos condicionales si es necesario
      this.inicializarCamposCondicionales(categoria);
    }
  }

  // Configurar evento submit
  configurarSubmit(categoria, form, modo, idActual) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.manejarSubmit(categoria, form, modo, idActual);
    });
  }

  // Manejar submit del formulario
  async manejarSubmit(categoria, form, modo, idActual) {
    try {
      const formulario = this.formularios[categoria];
      const datos = formulario.obtenerDatos(form.id);
      
      // Validar
      const errores = formulario.validar(datos);
      if (errores.length > 0) {
        FormHelpers.mostrarErrores(errores);
        return;
      }
      
      // Mostrar loading
      FormHelpers.mostrarLoading();
      
      // Enviar a API
      const resultado = await this.apiClient.enviarDatos(
        categoria, 
        datos, 
        modo, 
        idActual
      );
      
      if (resultado.success) {
        FormHelpers.mostrarExito(`${categoria} guardado correctamente`);
        
        setTimeout(() => {
          this.cerrarModal();
          this.recargarTabla(categoria);
        }, 1500);
      }
    } catch (error) {
      console.error('Error en formulario:', error);
      FormHelpers.mostrarError(error.message);
      FormHelpers.restaurarBoton();
    }
  }

  // Cerrar modal
  cerrarModal() {
    const modal = document.querySelector('.modal-inventario');
    if (modal) {
      modal.remove();
    }
  }

  // Recargar tabla correspondiente
  recargarTabla(categoria) {
    if (window.inventarioManager) {
      window.inventarioManager.mostrarInventario(categoria);
    }
  }

  // Inicializar campos condicionales
  inicializarCamposCondicionales(categoria) {
    if (categoria === 'insumos') {
      setTimeout(() => FormHelpers.inicializarCamposInsumos(), 50);
    }
  }

  // Preparar edición de un item
  async prepararEdicion(categoria, id) {
    try {
      // Obtener datos del servidor
      const datos = await this.apiClient.obtenerPorId(categoria, id);
      
      // Abrir modal en modo edición
      this.abrirModalFormulario(
        categoria,
        `Editar ${this.formatearTitulo(categoria)}`,
        'editar',
        id
      );
      
      // Rellenar formulario con datos
      setTimeout(() => {
        const formulario = this.formularios[categoria];
        formulario.rellenar('modal-añadir', datos);
        
        // Configurar botón eliminar
        formulario.configurarBotonEliminar('modal-añadir', id, () => {
          this.eliminarItem(categoria, id);
        });
      }, 150);
    } catch (error) {
      console.error(`Error al preparar edición de ${categoria}:`, error);
      alert(`Error al cargar los datos del ${categoria}`);
    }
  }

  // Eliminar item
  async eliminarItem(categoria, id) {
    if (!confirm(`¿Estás seguro de eliminar este ${categoria}?`)) return;
    
    try {
      await this.apiClient.eliminar(categoria, id);
      alert(`${this.formatearTitulo(categoria)} eliminado con éxito`);
      
      this.cerrarModal();
      this.recargarTabla(categoria);
    } catch (error) {
      alert(`Error al eliminar: ${error.message}`);
    }
  }

  // Formatear título para mostrar
  formatearTitulo(categoria) {
    const titulos = {
      vestidos: 'Vestido',
      productos: 'Producto',
      telas: 'Tela',
      insumos: 'Insumo'
    };
    
    return titulos[categoria] || categoria;
  }
}