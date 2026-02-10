// Importar el FormularioManager para que esté disponible dentro de esta clase
import { FormularioManager } from "../templates/formulariosAdd.js";

// inventario.js - VERSIÓN DEBUG
export class InventarioManager {
  constructor() {
    console.log("InventarioManager inicializado");

    this.categoriaActual = null;
    // Contenedor principal del inventario
    this.contenedor = null;
    // Contenedor del modal añadir inventario
    this.contenedorAñadir = null;
    // Almacenar datos actuales para operaciones de edición
    this.datosActuales = [];

    this.init();
  }

  init() {
    // Buscar el contenedor principal de forma más flexible
    this.contenedor = document.getElementById("contenedor-inventario");

    // Buscar el contenedor del modal añadir inventario
    this.contenedorAñadir = document.getElementById("modal-inv-categorias");

    // Verificar si se encontró el contenedor principal
    if (!this.contenedor) {
      console.error('No se encontró elemento con id "contenedor-inventario"');
      console.log('Buscando elementos con clase "inventarios"...');

      // Intentar buscar por clase
      const elementosPorClase = document.getElementsByClassName("inventarios");
      if (elementosPorClase.length > 0) {
        this.contenedor = elementosPorClase[0];
        console.log('Encontrado por clase "inventarios"');
      } else {
        console.error('Tampoco se encontró por clase "inventarios"');
        this.mostrarErrorGlobal(
          "Error crítico: No se pudo encontrar el contenedor de inventarios"
        );
        return;
      }
    }

    // Verificar si se encontró el contenedor del modal añadir inventario
    if (!this.contenedorAñadir) {
      console.error('No se encontró elemento con id "modal-añadir"');
    }

    // Logs de verificación
    console.log(
      "Contenedores encontrados:",
      this.contenedor,
      ",",
      this.contenedorAñadir
    );

    // Cargar fecha actual
    this.cargarFechaActual();
    // Agregar event listeners
    this.agregarEventListeners();

    // Mensaje final de inicialización
    console.log("Módulo de inventarios inicializado correctamente");
  }

  cargarFechaActual() {
    try {
      const fechaElement = document.getElementById("currentDate");
      if (fechaElement) {
        const fecha = new Date();
        const opciones = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        fechaElement.textContent = fecha.toLocaleDateString("es-ES", opciones);
      } else {
        console.warn("No se encontró el elemento para la fecha");
      }
    } catch (error) {
      console.error("Error cargando fecha:", error);
    }
  }

  agregarEventListeners() {
    console.log("Agregando event listeners...");

    const botones = {
      "btn-vestidos": () => this.mostrarInventario("vestidos"),
      "btn-telas": () => this.mostrarInventario("telas"),
      "btn-insumos": () => this.mostrarInventario("insumos"),
      "btn-productos": () => this.mostrarInventario("productos"),
    };

    Object.keys(botones).forEach((botonId) => {
      const boton = document.getElementById(botonId);
      if (boton) {
        boton.addEventListener("click", botones[botonId]);
        console.log(`Event listener agregado a: ${botonId}`);
      } else {
        console.error(`No se encontró el botón: ${botonId}`);

        // Debug: mostrar todos los botones
        const todosLosBotones = document.querySelectorAll("button");
        console.log("Todos los botones en la página:");
        todosLosBotones.forEach((btn, index) => {
          console.log(`${index}:`, btn.textContent, btn.id);
        });
      }
    });
  }

  async mostrarInventario(categoria) {
    this.categoriaActual = categoria;
    this.mostrarLoading();

    // Limpieza: Evita que se dupliquen tablas o se queden datos viejos
    if (this.contenedor) {
      this.contenedor.innerHTML = '';
    }

    try {
      // Ruta: Usamos la ruta limpia que creaste en NestJS
      const url = `http://localhost:3000/${categoria}`;
      console.log(`Pidiendo datos a: ${url}`);

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudo obtener la categoría ${categoria}`);
      }

      const datos = await response.json();
      
      // Validación: Asegurarnos de que tenemos un array
      this.datosActuales = Array.isArray(datos) ? datos : (datos.data || []);
      
      console.log("Datos cargados:", this.datosActuales);

      if (this.datosActuales.length === 0) {
        this.contenedor.innerHTML = `<p class="vacio">No hay registros, agrega ${categoria}</p>`;
      } else {
        // Render: Pintar la tabla
        this.renderizarTabla(categoria, this.datosActuales);
      }

    } catch (error) {
      console.error("Error en el front:", error);
      this.mostrarError(`Error de conexión: ${error.message}`);
    }
  }

  // Abrir el modal de selección de categorías
  abrirModalCategoria() {
    const modal = document.getElementById("modal-inv-categorias");
    if (modal) {
      modal.classList.add("active");
      console.log("Modal de categorías #modal-inv-categorias abierto.");
    } else {
      console.error("Elemento #modal-inv-categorias no encontrado.");
    }
  }

  // Cerrar el modal de selección de categorías
  cerrarModalCategoria() {
    const modal = document.getElementById("modal-inv-categorias");
    if (modal) {
      modal.classList.remove("active");
      console.log("Modal de categorías #modal-inv-categorias cerrado.");
    }
  }

  // Este método nos ayudará a abrir el modal "Añadir inventario" según la categoría
  mostrarModalAgregar(categoria, modo = "crear", idActual = null) {
    this.cerrarModalCategoria();

    const titulos = {
      vestidos: modo === "editar" ? "Editar Vestido" : "Agregar Nuevo Vestido",
      telas: modo === "editar" ? "Editar Tela" : "Agregar Nueva Tela",
      insumos: modo === "editar" ? "Editar Insumo" : "Agregar Nuevo Insumo",
      productos: modo === "editar" ? "Editar Producto" : "Agregar Nuevo Producto",
    };

    if (!FormularioManager) {
      console.error("FormularioManager no está disponible");
      return;
    }

    try {
      // Le pasamos el modo e ID al abrir el formulario
      FormularioManager.abrirModalFormulario(
        categoria,
        titulos[categoria] || "Item",
        modo,
        idActual
      );
    } catch (error) {
      console.error("Error abriendo modal:", error);
    }
  }

  async guardarItem(categoria, datos) {
    console.log(`Guardando en ${categoria}:`, datos);

    try {
      // Llamada dinámica al método create de la categoría
      const respuesta = await window.electronAPI[categoria].create(datos);

      if (respuesta && respuesta.success) {
        console.log(`Registro creado exitosamente en ${categoria}`);

        // Recargamos la tabla para ver el nuevo registro inmediatamente
        this.mostrarInventario(categoria);

        return respuesta;
      } else {
        throw new Error(respuesta.error || "No se pudo guardar el registro");
      }
    } catch (error) {
      console.error(`Error en guardarItem:`, error);
      alert("Error al guardar: " + error.message);
      throw error;
    }
  }

  // Método de fallback para modal básico
  mostrarModalBasico(categoria) {
    const modalHtml = `
      <div class="modal-basico">
        <div class="modal-basico-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-basico-content">
          <h3>Agregar ${categoria}</h3>
          <p>Formulario no disponible temporalmente</p>
          <button onclick="this.closest('.modal-basico').remove()">Cerrar</button>
        </div>
      </div>
    `;

    const modal = document.createElement("div");
    modal.innerHTML = modalHtml;
    document.body.appendChild(modal.firstElementChild);
  }

  // Método Edición
  prepararEdicion(id) {
    const encontrado = this.datosActuales.find(p => p.idProducto === id);
    
    if (encontrado) {
      console.log("Datos encontrados para editar:", encontrado);
      
      // Abrimos el modal (esto inyecta el HTML del formulario)
      this.mostrarModalAgregar(this.categoriaActual, 'editar', id);
      
      // Retraso crítico: Esperamos 150ms a que los inputs existan en el DOM
      setTimeout(() => {
        if (this.categoriaActual === 'vestidos') {
          console.log("Inyectando datos en el formulario...");
          // Asegurar que FormularioVestidos está disponible globalmente
          if (window.FormularioVestidos) {
            window.FormularioVestidos.rellenar(encontrado);
          }
        }
        // Agregar aquí los otros casos para telas, insumos, productos
      }, 150);
    } else {
      console.error("No se encontró el producto con ID:", id);
    }
  }

  // Métodos visuales con verificación de contenedor
  mostrarLoading() {
    console.log("mostrarLoading() llamado");
    console.log("this.contenedor en mostrarLoading:", this.contenedor);

    if (!this.contenedor) {
      console.error("ERROR: this.contenedor es null en mostrarLoading");
      return;
    }

    this.contenedor.innerHTML = `
      <div class="loading">
        <p>Cargando inventario...</p>
        <small>Buscando datos en la base de datos</small>
      </div>
    `;
  }

  mostrarError(mensaje) {
    console.log("mostrarError() llamado");
    console.log("this.contenedor en mostrarError:", this.contenedor);

    if (!this.contenedor) {
      console.error("ERROR: this.contenedor es null en mostrarError");
      // Fallback: mostrar error en consola y alerta
      alert("Error: " + mensaje + " (Contenedor no disponible)");
      return;
    }

    this.contenedor.innerHTML = `
      <div class="error">
        <p>${mensaje}</p>
        <button onclick="inventarioManager.mostrarInventario('${this.categoriaActual}')">Reintentar</button>
      </div>
    `;
  }

  mostrarErrorGlobal(mensaje) {
    // Fallback para errores globales
    const body = document.body;
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background: #dc3545;
      color: white;
      padding: 15px;
      text-align: center;
      z-index: 10000;
      font-family: Arial, sans-serif;
    `;
    errorDiv.textContent = mensaje;
    body.appendChild(errorDiv);
  }

  renderizarTabla(categoria, datos) {
    console.log("renderizarTabla() llamado");
    console.log("this.contenedor en renderizarTabla:", this.contenedor);

    if (!this.contenedor) {
      console.error("ERROR: this.contenedor es null en renderizarTabla");
      return;
    }

    if (!datos || datos.length === 0) {
      this.contenedor.innerHTML = `
        <div class="inventario-vacio">
          <p>No hay ${categoria} en el inventario</p>
          <small>Agrega contenido a tus inventarios!</small>
        </div>
      `;
      return;
    }

    // Generar tabla según la categoría
    let tablaHTML = `
      <div class="inventario-header">
        <h3>Inventario de ${categoria.toUpperCase()}</h3>
        <span class="total-items">Total: ${datos.length} items</span>
      </div>
      <div class="table-container">
        <table class="inventario-table">
          <thead>
            <tr>
              ${this.generarEncabezados(categoria)}
            </tr>
          </thead>
          <tbody>
            ${this.generarFilas(categoria, datos)}
          </tbody>
        </table>
      </div>
    `;

    this.contenedor.innerHTML = tablaHTML;
    console.log("Tabla renderizada correctamente");
  }

  generarEncabezados(categoria) {
    const encabezados = {
      vestidos: ["Código SKU","Nombre","Color","Categoría","Stock","Precio","Descripción","Estado","Editar"],
      productos: ["Código SKU","Nombre","Color","Categoría","Stock","Precio","Descripción","Estado","Editar"],
      telas: ["Nombre de Tela", "Color", "Existencia", "Ancho", "Largo (metros)", "Editar"],
      insumos: ["Nombre", "Categoría", "Stock", "Unidad", "Detalles", "Estado", "Editar"],
      
    };

    return encabezados[categoria]
      .map((encabezado) => `<th>${encabezado}</th>`)
      .join("");
  }

  generarFilas(categoria, datos) {
    if (!datos || datos.length === 0) {
      return `<tr><td colspan="10" style="text-align:center;">No hay datos disponibles</td></tr>`;
    }

    return datos.map((item) => {

      switch (categoria) {
        case "vestidos":
          // Extraemos el objeto 'producto' que contiene la info base
          const base = item.producto || {};
          
          // Extraemos los valores de ese objeto base
          const nombreVestido = base.nombre || "Sin nombre";
          const precioVestido = base.precioVenta || 0;
          const stockVestido = base.stockActual || 0;
          const descripcionVestido = base.descripcion || "Sin descripción";

          return `
            <tr>
              <td>${item.codigoSku || "N/A"}</td>
              <td>${nombreVestido}</td>
              <td>${item.categoria || "Vestido"}</td>
              <td>${item.color || "N/A"}</td>
              <td>${stockVestido}</td>
              <td>$${precioVestido}</td>
              <td>${descripcionVestido}</td>
              <td>
                <span class="estado ${stockVestido > 0 ? 'disponible' : 'agotado'}">
                  ${stockVestido > 0 ? 'Disponible' : 'Agotado'}
                </span>
              </td>
              <td class="acciones">
                <button class="btn-edit" onclick="window.inventarioManager.prepararEdicion(${item.idProducto})">
                  <i class="fas fa-pencil-alt">✍🏼</i>
                </button>
              </td>
            </tr>`;

        case "productos":

          const itemJson = JSON.stringify(item).replace(/'/g, "&apos;");

          return `
            <tr>
              <td>${item.codigoSku || "Falta el Código"}</td>
              <td>${item.producto?.nombre || "Sin nombre"}</td>
              <td>${item.color || "Color no elegido"}</td>
              <td>${item.categoria || "Sin categoria"}</td>
              <td>${item.producto?.stockActual || 0}</td>
              <td>$${Number(item.producto?.precioVenta || 0).toFixed(2)}</td>
              <td>${item.producto?.descripcion || "Sin descripción"}</td>
              <td>
              <span class="estado ${item.producto?.activo ? 'activo' : 'inactivo'}">
                  ${item.producto?.activo ? 'Activo' : 'Inactivo'}
              </span>
              </td>
              <td class="acciones">
                <button class="btn-editar" onclick='FormularioProductos.prepararEdicion(${itemJson})'>
                    <i class="fas fa-edit">✍🏼</i>
                </button>
              </td>
            </tr>`;

        case "telas":

          return `
            <tr>
              <td>${item.nombreTela || "N/A"}</td>
              <td>${item.color || "No Color"}</td>
              <td>${item.stockRollo || 0} rollos</td>
              <td>${item.ancho || "N/A"} m</td>
              <td>${item.largoTotal || 0} m</td>
              <td class="acciones">
                <button onclick="FormularioTelas.prepararEdicion(${item.id})">
                  <i class="fas fa-pencil-alt">✍🏼</i>
                </button>
              </td>
            </tr>`;

        case "insumos":
        // 1. Construir dinámicamente los detalles según lo que tenga el objeto
        let detalles = [];
        if (item.tipoHilo) detalles.push(`Tipo: ${item.tipoHilo}`);
        if (item.colorHilo) detalles.push(`Color: ${item.colorHilo}`);
        if (item.tipoAguja) detalles.push(`Tipo: ${item.tipoAguja}`);
        if (item.tipoCierre) detalles.push(`Tipo: ${item.tipoCierre}`);
        if (item.colorCierre) detalles.push(`Color: ${item.colorCierre}`);
        if (item.medidaCierre) detalles.push(`${item.medidaCierre} cm`);
        if (item.tipoBroche) detalles.push(`Tipo: ${item.tipoBroche}`);
        if (item.tipoAdorno) detalles.push(`Tipo: ${item.tipoAdorno}`);
        if (item.tipoEspecial) detalles.push(`Tipo: ${item.tipoEspecial}`);

        const detallesTexto = detalles.length > 0 ? detalles.join(" | ") : "N/A";

        return `
          <tr>
            <td><strong>${item.nombre || "N/A"}</strong></td>
            <td><span class="badge-categoria">${item.categoria}</span></td>
            <td>${item.stockActual || 0}</td>
            <td>${item.cantidadUnidad} ${item.unidadMedida}</td>
            <td><small>${detallesTexto}</small></td>
            <td>
              <span class="estado ${item.stockActual > item.stockMinimo ? 'disponible' : 'bajo-stock'}">
                ${item.stockActual > item.stockMinimo ? 'Suficiente' : 'Stock Bajo'}
              </span>
            </td>
            <td class="acciones">
              <button class="btn-edit" onclick="window.FormularioInsumos.prepararEdicionInsumo(${item.id})">
                <i class="fas fa-pencil-alt">✍🏼</i>
              </button>
            </td>
          </tr>`;

        default:
          return `<tr><td colspan="5">Categoría desconocida</td></tr>`;
      }
    }).join("");
  }

  // Alertas de stock
  async revisarAlertas() {
    try {
      // Llamada al nuevo endpoint del controlador
      const alertas = await window.electronAPI.productos.getBajoStock();

      if (alertas.length > 0) {
        console.warn(`Tienes ${alertas.length} productos con stock bajo`);
        // Aquí podrías mostrar un banner rojo o un icono de notificación
      }
    } catch (error) {
      console.error("Error al obtener alertas:", error);
    }
  }
}

let inventarioManagerInstance;

const inicializar = () => {
  // Solo instanciamos si no existe
  if (!inventarioManagerInstance) {
    inventarioManagerInstance = new InventarioManager();
    // La clave: Lo exponemos a window para que los botones onclick lo vean
    window.inventarioManager = inventarioManagerInstance;
    console.log("InventarioManager listo y expuesto en window.");
  }
};

// Ejecutar cuando el DOM esté listo
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializar);
} else {
  inicializar();
}
