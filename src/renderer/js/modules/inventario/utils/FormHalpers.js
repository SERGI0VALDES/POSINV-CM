/**
 * Funciones auxiliares para formularios
 */
export const FormHelpers = {
  // Mostrar errores en formulario
  mostrarErrores(errores, formSelector = '.form-inventario') {
    const errorHtml = errores
      .map((error) => `<div class="error-message">${error}</div>`)
      .join('');

    const errorContainer = document.createElement('div');
    errorContainer.className = 'errores-formulario';
    errorContainer.innerHTML = errorHtml;

    const form = document.querySelector(formSelector);
    if (form) {
      const existingErrors = form.querySelector('.errores-formulario');
      if (existingErrors) existingErrors.remove();
      form.prepend(errorContainer);
    }

    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.remove();
      }
    }, 5000);
  },

  // Mostrar loading
  mostrarLoading(buttonSelector = '.btn-guardar') {
    const submitBtn = document.querySelector(buttonSelector);
    if (submitBtn) {
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
      submitBtn.disabled = true;
    }
  },

  // Restaurar botón
  restaurarBoton(buttonSelector = '.btn-guardar') {
    const btn = document.querySelector(buttonSelector);
    if (btn) {
      btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
      btn.disabled = false;
    }
  },

  // Mostrar mensaje de éxito
  mostrarExito(mensaje, formSelector = '.form-inventario') {
    const successDiv = document.createElement('div');
    successDiv.className = 'exito-formulario';
    successDiv.innerHTML = `
      <div class="exito-content">
        <i class="fas fa-check-circle"></i>
        <span>${mensaje}</span>
      </div>
    `;

    const form = document.querySelector(formSelector);
    if (form) {
      form.prepend(successDiv);
      setTimeout(() => successDiv.remove(), 3000);
    }
  },

  // Mostrar mensaje de error
  mostrarError(mensaje, formSelector = '.form-inventario') {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-formulario';
    errorDiv.innerHTML = `
      <div class="error-content">
        <i class="fas fa-exclamation-circle"></i>
        <span>${mensaje}</span>
      </div>
    `;

    const form = document.querySelector(formSelector);
    if (form) {
      form.prepend(errorDiv);
      setTimeout(() => errorDiv.remove(), 5000);
    }
  },

  // Inicializar campos condicionales para insumos
  inicializarCamposInsumos() {
    const categoriaSelect = document.getElementById('categoriaInsumo');
    if (!categoriaSelect) return;

    const camposCondicionales = document.querySelectorAll('.campo-condicional');
    camposCondicionales.forEach((campo) => (campo.style.display = 'none'));

    const mapaCategorias = {
      hilos: 'campo-subcategoria-hilos',
      agujas: 'campo-subcategoria-agujas',
      cierres: 'campo-subcategoria-cierres',
      broches: 'campo-subcategoria-broches',
      adornos: 'campo-subcategoria-adornos',
      especiales: 'campo-subcategoria-especiales',
    };

    categoriaSelect.addEventListener('change', function () {
      const categoria = this.value;

      // Ocultar todos
      camposCondicionales.forEach((campo) => {
        campo.style.display = 'none';
        campo.querySelectorAll('input, select').forEach((input) => {
          input.value = '';
          input.removeAttribute('required');
        });
      });

      // Mostrar el correspondiente
      if (mapaCategorias[categoria]) {
        const campo = document.getElementById(mapaCategorias[categoria]);
        if (campo) {
          campo.style.display = 'block';
          campo.querySelectorAll('input, select').forEach((input) => {
            input.setAttribute('required', 'required');
          });
        }
      }

      // Actualizar placeholder del nombre
      this.actualizarPlaceholderNombre(categoria);
    });

    if (categoriaSelect.value) {
      categoriaSelect.dispatchEvent(new Event('change'));
    }
  },

  actualizarPlaceholderNombre(categoria) {
    const nombreInput = document.getElementById('insumoNombre');
    if (!nombreInput) return;

    const placeholders = {
      hilos: 'Ej: Hilo poliester blanco 1000m, Hilo de seda color rosa...',
      agujas: 'Ej: Agujas para máquina #90, Agujas para coser a mano...',
      cierres: 'Ej: Cremallera invisible 20cm, Botones de madera...',
      broches: 'Ej: Broches de presión 15mm, Ganchos automáticos...',
      adornos: 'Ej: Lentejuelas plateadas, Pedrería cristal...',
      especiales: 'Ej: Entretela termoadhesiva, Vivo de algodón...',
    };

    nombreInput.placeholder = placeholders[categoria] || 'Nombre descriptivo del insumo';
  }
};