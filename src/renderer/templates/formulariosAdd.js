/**
 * MÓDULO: FORMULARIO VESTIDOS
 *
 * FORMULARIO PARA AÑADIR UN NUEVO VESTIDO.
 *
 * Este módulo maneja toda la lógica relacionada con el formulario de vestidos,
 * incluyendo generación HTML, validación, obtención de datos y envío a la API.
 * Sigue el patrón de objeto para encapsular funcionalidad relacionada.
 */

// Eliminar si todo sale bien... con el metodo cargar tabla vestidos
/* 1. Variable global
let productosInventario = [];

async function cargarTablaVestidos() {
  const response = await fetch("http://localhost:3000/inventario/todos");
  productosInventario = await response.json();
  renderizarTabla(productosInventario);
}*/


const cargarTablaVestidos = () => {
    // En lugar de buscar 'renderizarTabla', usamos nuestro Manager
    if (window.inventarioManager) {
        window.inventarioManager.mostrarInventario('vestidos');
    } else {
        console.error("InventarioManager no está listo para recargar la tabla");
    }
};

// FORMULARIO VESTIDOS PARA AÑADIR NUEVOS PRODUCTOS TERMINADOS AL INVENTARIO
export const FormularioVestidos = {
  
  rellenar(datos) {
    console.log("Intentando asignar categoría:", datos.categoria);
    const form = document.getElementById("modal-añadir");
    if (!form) return;

    const base = datos.producto || {};
    const asignar = (id, valor) =>
      document.getElementById(id) &&
      (document.getElementById(id).value = valor || "");

    form.dataset.modo = "editar";
    form.dataset.idActual = datos.idProducto;

    const header =
      form.querySelector(".form-header h3") || form.querySelector("h2");
    if (header) header.innerText = "Editar Vestido";

    // --- LÓGICA PARA AGREGAR BOTÓN ELIMINAR ---
    const actionsContainer = form.querySelector(".form-actions");
    // Evitamos duplicar el botón si ya existe
    if (actionsContainer && !document.getElementById("btn-eliminar-vestido")) {
      const btnEliminar = document.createElement("button");
      btnEliminar.type = "button";
      btnEliminar.id = "btn-eliminar-vestido";

      // Estilos rápidos para que se vea rojo y a la izquierda
      Object.assign(btnEliminar.style, {
        backgroundColor: "#dc3545",
        color: "white",
        border: "none",
        padding: "10px 15px",
        borderRadius: "5px",
        cursor: "pointer",
        marginRight: "auto", // Esto lo empuja a la izquierda
        display: "flex",
        alignItems: "center",
        gap: "8px",
      });

      btnEliminar.innerHTML = `<i class="fas fa-trash"></i> Eliminar`;

      // Llamamos a la función eliminar pasándole el ID
      btnEliminar.onclick = () => this.eliminar(datos.idProducto);

      // Lo insertamos al principio del contenedor de botones
      actionsContainer.prepend(btnEliminar);
    }
    // ------------------------------------------

    const categoriaFormateada = datos.categoria
      ? datos.categoria.charAt(0).toUpperCase() +
        datos.categoria.slice(1).toLowerCase()
      : "";

    asignar("nombre_producto", base.nombre);
    asignar("descripcion", base.descripcion);
    asignar("stock_actual", base.stockActual);
    asignar("precio_venta", base.precioVenta);
    asignar("codigo_sku", datos.codigoSku);
    asignar("color", datos.color);
    asignar("categoria-vestido", categoriaFormateada);
  },

  generar() {
    return `
            <form id="modal-añadir" class="form-inventario">

                <div class="form-header">
                    <h3>Nuevo Vestido</h3>
                    <p>Completa los datos del vestido</p>
                </div>
                
                <div class="form-group">
                    <label for="codigo_sku">
                        <i class="fas fa-barcode"></i> Código SKU *
                    </label>
                    <input type="text" 
                           id="codigo_sku" 
                           name="codigo_sku" 
                           placeholder="Ej. VEST-001" 
                           required
                           pattern="^[A-Z0-9\\-]+$"
                           title="Solo letras mayúsculas, números y guiones">
                    <small class="form-help">El código se genera automaticamente</small>
                </div>
                
                <div class="form-group">
                    <label for="nombre_producto">
                        <i class="fas fa-tshirt"></i> Nombre *
                    </label>
                    <input type="text" 
                           id="nombre_producto" 
                           name="nombre_producto" 
                           placeholder="Ej. Vestido con Flores" 
                           required
                           maxlength="100">
                </div>
                
                <div class="form-group">
                    <label for="categoria-vestido">
                        <i class="fas fa-palette"></i> Categoría *
                    </label>
                    <select id="categoria-vestido" name="categoria-vestido" required>
                        <option value="">Seleccionar categoría</option>
                        <option value="Casual">Casual</option>
                        <option value="XV">Vestido de XV</option>
                        <option value="Boda">Vestido de Boda</option>
                        <option value="Bailable">De bailable</option>
                        <option value="Personalizada">Personalizado</option>
                        <option value="Otro">Otro...</option>
                    </select>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="color">
                            <i class="fas fa-palette"></i> Color del vestido *
                        </label>
                        <select id="color" name="color" required>
                            <option value="">Seleccionar color</option>
                            <option value="Rojo">Rojo</option>
                            <option value="Negro">Negro</option>
                            <option value="Blanco">Blanco</option>
                            <option value="Azul">Azul</option>
                            <option value="Verde">Verde</option>
                            <option value="Amarillo">Amarillo</option>
                            <option value="Rosa">Rosa</option>
                            <option value="Morado">Morado</option>
                            <option value="Gris">Gris</option>
                            <option value="Beige">Beige</option>
                            <option value="Multicolor">Multicolor</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="stock_actual">
                            <i class="fas fa-boxes"></i> ¿Cuantos vestidos vamos agregar? *
                        </label>
                        <input type="number" 
                               id="stock_actual" 
                               name="stock_actual" 
                               min="1" 
                               max="1000" 
                               value="1" 
                               required>
                
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="precio_venta">
                        <i class="fas fa-tag"></i> Precio de Venta *
                    </label>
                    <div class="input-with-icon">
                        <span class="currency">$</span>
                        <input type="number" 
                               id="precio_venta" 
                               name="precio_venta" 
                               step="0.01" 
                               min="0" 
                               max="10000" 
                               placeholder="0.00" 
                               required>
                    </div>
                    <small class="form-help">Precio en Pesos Mexicanos MX$</small>
                </div>
                
                <div class="form-group">
                    <label for="descripcion">
                        <i class="fas fa-file-alt"></i> Descripción (Opcional)
                    </label>
                    <textarea id="descripcion" 
                              name="descripcion" 
                              rows="3" 
                              placeholder="Descripción del vestido, material, talla, etc." 
                              maxlength="500"></textarea>
                </div>
                
                <div class="form-actions">

                    <button type="button" class="btn-cancelar" onclick="cerrarModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    
                    <button type="submit" class="btn-guardar">
                        <i class="fas fa-save"></i> Guardar Vestido
                    </button>

                </div>
            </form>
        `;
  },

  validar(datos) {
    const errores = [];

    if (!datos.codigoSku) {
      errores.push("El código SKU es requerido");
    } else if (!/^[A-Z0-9-]+$/.test(datos.codigoSku)) {
      errores.push(
        "El código SKU solo puede contener letras mayúsculas, números y guiones",
      );
    }
    if (!datos.categoria) errores.push("La categoría es requerida");
    if (!datos.nombre) errores.push("El nombre del vestido es requerido");
    if (!datos.color) errores.push("El color es requerido");
    if (datos.stockActual < 0)
      errores.push("El stock inicial debe ser un número positivo");
    if (datos.precioVenta <= 0)
      errores.push("El precio de venta debe ser mayor a 0");

    return errores;
  },

  obtenerDatos(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);

    return {
      nombre: formData.get("nombre_producto")?.trim(),
      codigoSku: formData.get("codigo_sku")?.toUpperCase().trim(),
      descripcion: formData.get("descripcion")?.trim() || "",
      stockActual: parseInt(formData.get("stock_actual")) || 0,
      precioVenta: parseFloat(formData.get("precio_venta")) || 0,
      color: formData.get("color"),
      categoria: formData.get("categoria-vestido"),
      stockMinimo: 0,
    };
  },

  async manejarEnvioVestido(event) {
    event.preventDefault();

    const form = event.target;
    const modo = form.dataset.modo;
    const idProducto = form.dataset.idActual;

    const dto = FormularioVestidos.obtenerDatos(form.id);

    const errores = FormularioVestidos.validar(dto);
    if (errores.length > 0) {
      alert(
        "Por favor corrige los siguientes errores:\n\n" + errores.join("\n"),
      );
      return;
    }

    try {
      const url =
        modo === "editar"
          ? `http://localhost:3000/vestidos/${idProducto}`
          : "http://localhost:3000/vestidos";

      const metodo = modo === "editar" ? "PATCH" : "POST";

      console.log("Enviando DTO:", dto);

      const response = await fetch(url, {
        method: metodo,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error en el servidor");
      }

      alert(modo === "editar" ? "Vestido actualizado" : "Vestido guardado");

      if (window.FormularioManager) window.FormularioManager.cerrarModal();

      // Refrescar tabla tras guardar/actualizar
      if (window.inventarioManager) {
        window.inventarioManager.mostrarInventario("vestidos");
      }
    } catch (error) {
      console.error("Error detallado:", error);
      alert("Error: " + error.message);
    }
  },

  async eliminar(id) {
    if (
      !confirm(
        "¿Estás seguro de eliminar este vestido? Esta acción no se puede deshacer.",
      )
    )
      return;

    try {
      const response = await fetch(`http://localhost:3000/vestidos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "No se pudo eliminar");
      }

      alert("Vestido eliminado con éxito");

      // 1. Cerramos el modal
      if (window.FormularioManager) window.FormularioManager.cerrarModal();

      // 2. REFRESCO AUTOMÁTICO DE LA TABLA
      // Usamos el manager global para recargar la categoría 'vestidos'
      if (window.inventarioManager) {
        window.inventarioManager.mostrarInventario("vestidos");
      } else if (typeof cargarTablaVestidos === "function") {
        // Fallback por si acaso
        cargarTablaVestidos();
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error: " + error.message);
    }
  },

  limpiar() {
    const form = document.getElementById("modal-añadir");
    if (!form) return;

    form.reset();
    form.dataset.modo = "crear";
    delete form.dataset.idActual;

    // ELIMINAR EL BOTÓN ROJO SI EXISTE
    const btnEliminar = document.getElementById("btn-eliminar-vestido");
    if (btnEliminar) btnEliminar.remove();

    const header = form.querySelector(".form-header h3");
    if (header) header.innerText = "Nuevo Vestido";
  },
};

// FORMULARIO PRODUCTOS PARA AÑADIR NUEVOS PRODUCTOS TERMINADOS AL INVENTARIO
export const FormularioProductos = {
  generar() {
    return `
      <form id="modal-añadir" class="form-inventario">
        <div class="form-header">
          <h3>Nuevo Producto</h3>
          <p>¿Qué producto vas agregar hoy?</p>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="codigo"><i class="fas fa-barcode"></i> Código SKU*</label>
            <input type="text" id="codigo" name="codigo" placeholder="Ej. PROD-001" required>
          </div>
          <div class="form-group">
            <label for="nombre"><i class="fas fa-cube"></i> Nombre del Producto *</label>
            <input type="text" id="nombre" name="nombre" placeholder="Ej. Ramo Rosas" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="stock_actual"><i class="fas fa-boxes"></i> Cantidad Inicial *</label>
            <input type="number" id="stock_actual" name="stock_actual" min="0" value="1" required>
          </div>
          <div class="form-group">
            <label for="stock_minimo"><i class="fas fa-exclamation-triangle"></i> Stock Mínimo *</label>
            <input type="number" id="stock_minimo" name="stock_minimo" min="0" value="3" required>
          </div>
        </div>
        
        <div class="form-group">
          <label for="precio_venta"><i class="fas fa-tag"></i> Precio de Venta *</label>
          <div class="input-with-icon">
            <span class="currency">$</span>
            <input type="number" id="precio_venta" name="precio_venta" step="0.01" min="0.01" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="categoria_producto"><i class="fas fa-tags"></i> Categoría *</label>
            <select id="categoria_producto" name="categoria" required>
              <option value="">Seleccionar...</option>
              <option value="XV">Fiesta de XV</option>
              <option value="Comunion">Primera Comunión</option>
              <option value="Boda">Bodas</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Otros">Otros</option>
            </select>
          </div>
          <div class="form-group">
            <label for="color_producto"><i class="fas fa-palette"></i> Color *</label>
            <select id="color_producto" name="color" required>
              <option value="">Seleccionar...</option>
              <option value="Rojo">Rojo</option>
              <option value="Blanco">Blanco</option>
              <option value="Rosa">Rosa</option>
              <option value="Multicolor">Multicolor</option>
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="descripcion_producto"><i class="fas fa-file-alt"></i> Descripción (Opcional)</label>
          <textarea id="descripcion_producto" name="descripcion" rows="3" maxlength="500"></textarea>
        </div>

        <div class="form-actions">
          <button type="button" class="btn-cancelar" onclick="cerrarModal()">
            <i class="fas fa-times"></i> Cancelar
          </button>
          <button type="submit" class="btn-guardar">
            <i class="fas fa-save"></i> Guardar Producto
          </button>
        </div>
      </form>
    `;
  },

  obtenerDatos(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);

    return {
      codigoSku: formData.get("codigo")?.toUpperCase().trim(),
      nombre: formData.get("nombre")?.trim(),
      stockActual: parseInt(formData.get("stock_actual")) || 0,
      stockMinimo: parseInt(formData.get("stock_minimo")) || 0,
      precioVenta: parseFloat(formData.get("precio_venta")) || 0,
      categoria: formData.get("categoria"),
      descripcion: formData.get("descripcion")?.trim() || "",
      color: formData.get("color")?.trim() || "",
      activo: 1,
    };
  },

  validar(datos) {
    const errores = [];

    // 1. Validación de SKU (Solo letras, números y guiones)
    const skuRegEx = /^[A-Z0-9\-]+$/;
    if (!datos.codigoSku || datos.codigoSku.trim() === "") {
      errores.push("El código SKU es obligatorio.");
    } else if (!skuRegEx.test(datos.codigoSku)) {
      errores.push("El SKU solo permite mayúsculas, números y guiones.");
    }

    // 2. Validación de Nombre
    if (!datos.nombre || datos.nombre.trim().length < 3) {
      errores.push("El nombre debe tener al menos 3 caracteres.");
    }

    // 3. Validación de Stocks
    if (isNaN(datos.stockActual) || datos.stockActual < 0) {
      errores.push("La cantidad inicial no puede ser negativa.");
    }
    if (isNaN(datos.stockMinimo) || datos.stockMinimo < 0) {
      errores.push("El stock mínimo no puede ser negativo.");
    }

    // 4. Validación de Precio
    if (!datos.precioVenta || datos.precioVenta <= 0) {
      errores.push("El precio de venta debe ser un número mayor a 0.");
    }

    // 5. Validación de Selects
    if (!datos.categoria || datos.categoria === "") {
      errores.push("Debes seleccionar una categoría.");
    }
    if (!datos.color || datos.color === "") {
      errores.push("Debes seleccionar un color.");
    }

    return errores;
  },

  // Método para mostrar los errores en la interfaz
  mostrarErrores(errores) {
    // Usamos el método mostrarErrores del FormularioManager que ya tienes
    if (window.FormularioManager && window.FormularioManager.mostrarErrores) {
      window.FormularioManager.mostrarErrores(errores);
    } else {
      alert("Errores detectados:\n" + errores.join("\n"));
    }
  },

  rellenar(datos) {
    const form = document.getElementById("modal-añadir");
    if (!form) return;

    const base = datos.producto || {};
    form.dataset.modo = "editar";
    form.dataset.idActual = base.idProducto;
    form.querySelector(".form-header h3").innerText = "Editar Producto";

    // Lógica del botón eliminar
    const actions = form.querySelector(".form-actions");
    let btnEliminar = document.getElementById("btn-eliminar-prod");
    if (!btnEliminar) {
      btnEliminar = document.createElement("button");
      btnEliminar.id = "btn-eliminar-prod";
      btnEliminar.type = "button";
      btnEliminar.className = "btn-eliminar";
      btnEliminar.innerHTML = `<i class="fas fa-trash"></i> Eliminar`;
      btnEliminar.style.marginRight = "auto";
      btnEliminar.style.backgroundColor = "#e74c3c";
      btnEliminar.style.color = "white";
      actions.prepend(btnEliminar);
    }
    btnEliminar.onclick = () => this.eliminar(base.idProducto);

    // Rellenado de campos
    const asignar = (id, valor) => {
      const el = document.getElementById(id);
      if (el) el.value = valor || "";
    };

    asignar("codigo", datos.codigoSku);
    asignar("nombre", base.nombre);
    asignar("stock_actual", base.stockActual);
    asignar("stock_minimo", base.stockMinimo);
    asignar("precio_venta", base.precioVenta);
    asignar("categoria_producto", base.categoria);
    asignar("color_producto", datos.color);
    asignar("descripcion_producto", base.descripcion);
  },

  prepararEdicion(item) {
    console.log("Datos recibidos para editar:", item);

    if (window.FormularioManager) {
      // CAMBIO AQUÍ: El nombre real es abrirModalFormulario
      window.FormularioManager.abrirModalFormulario(
        "productos",
        "Editar Producto",
        "editar",
        item.producto?.idProducto,
      );
    } else {
      console.error("FormularioManager no encontrado");
    }

    // Esperar a que el HTML se inyecte para rellenar
    setTimeout(() => {
      this.rellenar(item);
    }, 150);
  },

  async eliminar(id) {
    if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
    try {
      const response = await fetch(`http://localhost:3000/productos/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error al eliminar");
      alert("Producto eliminado");
      cerrarModal();
      if (window.inventarioManager)
        window.inventarioManager.mostrarInventario("productos");
    } catch (error) {
      alert(error.message);
    }
  },
};

// FORMULARIO PARA AÑADIR UNA NUEVA TELA
export const FormularioTelas = {
  generar() {
    return `
            <form id="modal-añadir" class="form-inventario">
                <div class="form-header">
                    <h3>Nueva Tela</h3>
                    <p>Registra los datos de la tela</p>
                </div>
                
                <div class="form-group">
                    <label for="nombre_tela">
                        <i class="fas fa-flask"></i> Nombre de la Tela *
                    </label>

                    <select id="nombre_tela" name="nombre_tela">
                    <option value="">Seleccione el nombre de la tela o agregue una...</option>
                    
                    <option value="razoNovia">Razo de novia</option>
                    <option value="charmeusse">Charmeusse</option>
                    <option value="tafeta">Tafeta</option>
                    <option value="tullSuave">Tull Suave</option>
                    <option value="tullGlitter">Tull Glitter</option>
                    <option value="tullCrinolina">Tull Crinolina</option>
                    <option value="oxford">Oxford</option>
                    <option value="forroPoliseda">Forro Poliseda</option>
                    <option value="forroMagaly">Forro Magaly</option>
                    <option value="bramante">Bramante</option>
                    <option value="entretela">Entretela</option>
                    <option value="otraTela">Agregar otra..</option>
                    
                </select>

                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="ancho">
                            <i class="fas fa-ruler-horizontal"></i> Ancho (metros) *
                        </label>
                        <div class="input-with-icon">
                            <input type="number" 
                                   id="ancho" 
                                   name="ancho" 
                                   step="0.01" 
                                   min="0.5" 
                                   max="5" 
                                   value="1.5" 
                                   required>
                            <span class="unit">m</span>
                        </div>
                        <small class="form-help">Ancho estándar: 1.5m</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="largo_total">
                            <i class="fas fa-ruler-vertical"></i> Largo Total (metros) *
                        </label>
                        <div class="input-with-icon">
                            <input type="number" 
                                   id="largo_total" 
                                   name="largo_total" 
                                   step="0.1" 
                                   min="0" 
                                   max="100000" 
                                   value="" 
                                   required>
                            <span class="unit">m</span>
                        </div>
                        <small class="form-help">Metros lineales disponibles</small>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="stock_actual">
                        <i class="fas fa-weight"></i> ¿Cuantos rollos son? *
                    </label>
                    <input type="number" 
                           id="stock_actual" 
                           name="stock_actual" 
                           min="0" 
                           max="10000" 
                           value="" 
                           required>
                    <small class="form-help">Cantidad en inventario</small>
                </div>
                
                <div class="form-group">
                    <label for="color_tela">
                        <i class="fas fa-palette"></i> Color *
                    </label>

                    <select id="color" name="color" required>
                            <option value="">Seleccionar color</option>

                            <option value="Blanco">Blanco</option>
                            <option value="Negro">Negro</option>
                            <option value="Gris">Gris</option>

                            <option value="rojo">Rojo</option>
                            <option value="azul">Azul</option>
                            <option value="verde">Verde</option>
                            <option value="amarillo">Amarillo</option>
                            <option value="rosa">Rosa</option>
                            <option value="morado">Morado</option>
                            <option value="naranja">Naranja</option>
                            
                            <option value="verdePistache">Verde Pistache</option>
                            <option value="verdeEsmeralda">Verde Esmeralda</option>
                            <option value="verdeAgua">Verde Agua</option>
                            <option value="verdePastel">Verde Pastel</option>

                            <option value="azulMarino">Azul Marino</option>
                            <option value="azulRey">Azul Rey</option>
                            <option value="azulRey">Azul Pastel</option>

                            <option value="rojoQuemado">Rojo Quemado</option>
                            <option value="guinda">Guinda</option>

                            <option value="paloRosa">Palo de Rosa</option>
                            <option value="paloPastel">Rosa Pastel</option>
                            
                            <option value="hueso">Hueso</option>
                            <option value="perla">Perla</option>
                            <option value="champagne">Champagne</option>
                            <option value="coral">Coral</option>
                            <option value="lila">Lila</option>
                            <option value="fucsia">Fucsia</option>
                            
                            <option value="dorado">Dorado</option>
                            <option value="plateado">Plateado</option>
                            <option value="transparente">Transparente</option>

                            <option value="Multicolor">Multicolor</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="proveedor">
                        <i class="fas fa-truck"></i> Proveedor (Opcional)
                    </label>
                    <input type="text"
                          id="proveedor"
                          name="proveedor"
                          value=""
                          placeholder="Asigna el proveedor de la tela"> 
                    <small class="form-help">Si no sabe quién es el proveedor, deje en blanco</small>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancelar" onclick="cerrarModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button type="submit" class="btn-guardar">
                        <i class="fas fa-save"></i> Guardar Tela
                    </button>
                </div>
            </form>
        `;
  },

  validar(datos) {
    const errores = [];

    if (!datos.nombreTela || datos.nombreTela.trim() === "") {
      errores.push("El nombre de la tela es requerido");
    }

    if (datos.ancho <= 0 || datos.ancho > 5) {
      errores.push("El ancho debe estar entre 0.5 y 5 metros");
    }

    if (datos.largoTotal < 0) {
      errores.push("La longitud no puede ser negativa");
    }

    if (datos.stockRollo < 0) {
      errores.push("El stock no puede ser negativo");
    }

    if (!datos.color || datos.color.trim() === "") {
      errores.push("Es requerido indicar el color de la tela");
    }

    return errores;
  },

  obtenerDatos(formId) {
    const form = document.getElementById(formId);
    const formData = new FormData(form);

    return {
      nombreTela: formData.get("nombre_tela"),
      ancho: parseFloat(formData.get("ancho")),
      largoTotal: parseFloat(formData.get("largo_total")),
      stockRollo: parseInt(formData.get("stock_actual")),
      color: formData.get("color") || "",
      proveedor: formData.get("proveedor") || "", // <-- Agregado
      minimoStock: 0,
    };
  },

  rellenar(datos) {
    let form = document.getElementById("modal-añadir");

    // Si no aparece, buscamos la clase genérica que usas en el generar()
    if (!form) form = document.querySelector(".form-inventario");

    if (!form) {
      console.error(
        "ERROR CRÍTICO: El formulario aún no existe en el DOM. Asegúrate de llamar a generar() antes que a rellenar().",
      );
      return;
    }

    // 1. Encabezado y modo
    const header =
      form.querySelector(".form-header h3") || form.querySelector("h2");
    if (header) header.innerText = "Editar Tela";

    form.dataset.modo = "editar";
    form.dataset.idActual = datos.id;

    // --- 2. LÓGICA DEL BOTÓN ELIMINAR (CORREGIDA) ---
    const actionsContainer = form.querySelector(".form-actions");
    let btnEliminar = document.getElementById("btn-eliminar-tela");

    if (actionsContainer) {
      if (!btnEliminar) {
        btnEliminar = document.createElement("button");
        btnEliminar.id = "btn-eliminar-tela";
        btnEliminar.type = "button";
        btnEliminar.innerHTML = `<i class="fas fa-trash"></i> Eliminar`;

        Object.assign(btnEliminar.style, {
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          padding: "10px 15px",
          borderRadius: "5px",
          cursor: "pointer",
          marginRight: "auto",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        });

        actionsContainer.prepend(btnEliminar);
      }

      // IMPORTANTE: Forzamos el click y verificamos el ID
      btnEliminar.onclick = (e) => {
        e.preventDefault();
        console.log("Botón eliminar presionado para ID:", datos.id);
        if (datos.id) {
          this.eliminar(datos.id);
        } else {
          console.error("No se pudo obtener el ID de la tela para eliminar");
        }
      };
    }
    // ----------------------------------------------------

    // 3. Función auxiliar para asignar valores
    const asignar = (id, valor) => {
      const el = document.getElementById(id);
      if (el) el.value = valor || "";
    };

    // 4. Lógica del select nombre_tela
    const selectNombre = document.getElementById("nombre_tela");
    if (selectNombre) {
      const valorExiste = Array.from(selectNombre.options).some(
        (opt) => opt.value === datos.nombreTela,
      );
      if (!valorExiste && datos.nombreTela) {
        const nuevaOpt = new Option(
          datos.nombreTela,
          datos.nombreTela,
          true,
          true,
        );
        selectNombre.add(nuevaOpt);
      }
      selectNombre.value = datos.nombreTela;
    }

    // 5. Asignación de campos
    asignar("ancho", datos.ancho);
    asignar("largo_total", datos.largoTotal);
    asignar("stock_actual", datos.stockRollo);
    asignar("color", datos.color);
    asignar("proveedor", datos.proveedor || datos.nombre_proveedor || "");
  },

  async eliminar(id) {
    if (!confirm("¿Seguro que quieres eliminar esta tela del inventario?"))
      return;
    try {
      const response = await fetch(`http://localhost:3000/telas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Error al eliminar la tela");

      alert("Tela eliminada con éxito");

      // 1. Cerramos el modal
      if (window.FormularioManager) {
        window.FormularioManager.cerrarModal();
      }

      // 2. REFRESCO DE TABLA:
      // Como ya tenemos window.inventarioManager expuesto, le pedimos que recargue
      if (window.inventarioManager) {
        window.inventarioManager.mostrarInventario("telas");
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar: " + error.message);
    }
  },

  async prepararEdicion(id) {
    try {
      // 1. Obtenemos los datos del servidor
      const response = await fetch(`http://localhost:3000/telas/${id}`);
      if (!response.ok)
        throw new Error("No se pudo obtener la información de la tela");

      const tela = await response.json();

      // 2. Abrimos el modal PRIMERO para que el HTML se inyecte en el DOM
      if (window.FormularioManager) {
        // Usamos abrirModalFormulario para que cargue el template de 'telas'
        window.FormularioManager.abrirModalFormulario(
          "telas",
          "Editar Tela",
          "editar",
          id,
        );
      }

      // 3. Esperamos un breve momento a que el DOM procese el nuevo HTML
      setTimeout(() => {
        // Ahora que el modal ya existe, lo rellenamos
        this.rellenar(tela);
      }, 150);
    } catch (error) {
      console.error("Error al preparar edición de tela:", error);
      alert("Error al cargar los datos de la tela");
    }
  },
  
  limpiar() {
    const form = document.getElementById("modal-añadir");
    if (!form) return;

    form.reset();
    form.dataset.modo = "crear";
    delete form.dataset.idActual;

    // Quitamos el botón de eliminar para que no salga al "Añadir Nueva Tela"
    const btnEliminar = document.getElementById("btn-eliminar-tela");
    if (btnEliminar) btnEliminar.remove();

    const header = form.querySelector(".form-header h3");
    if (header) header.innerText = "Nueva Tela";
  },
};

// FORMULARIO PARA AÑADIR UN NUEVO INSUMO
export const FormularioInsumos = {
  generar() {
    return `
            <form id="modal-añadir" class="form-inventario">
                <div class="form-header">
                    <h3><i class="fas fa-plus-circle"></i> Nuevo Insumo</h3>
                    <p>Registra un nuevo insumo para el taller de costura</p>
                </div>
                
                <!-- SECCIÓN 1: INFORMACIÓN BÁSICA -->
                <div class="form-section">
                    <div class="form-group">
                        <label for="categoriaInsumo">
                            <i class="fas fa-tags"></i> Categoría *
                        </label>
                        <select id="categoriaInsumo" name="categoria" class="form-control" required>
                            <option value="">Seleccione categoría...</option>
                            <option value="hilos">Hilos</option>
                            <option value="agujas">Agujas</option>
                            <option value="cierres">Cierres</option>
                            <option value="broches">Broches</option>
                            <option value="adornos">Adornos y Decoración</option>
                            <option value="herramientas">Herramientas</option>
                            <option value="especiales">Materiales Especiales</option>
                            <option value="quimicos">Productos Químicos</option>
                        </select>
                    </div>
                    
                    <!-- CAMPOS CONDICIONALES PARA SUBCATEGORÍAS -->
                    
                    <!-- Para HILOS -->
                    <div id="campo-subcategoria-hilos" class="campo-condicional" style="display: none;">
                        <div class="form-row">
                            
                            <!-- Subcategoria: TIPO DE HILO-->
                            <div class="form-group">
                                <label for="tipo_hilo">
                                    <i class="fas fa-thread"></i> Tipo de Hilo *
                                </label>
                                <select id="tipo_hilo" name="tipo_hilo" class="form-control">
                                    <option value="">Seleccionar tipo de hilo...</option>
                                    <option value="poliester">Poliester</option>
                                    <option value="algodon">Algodón</option>
                                    <option value="seda">Seda</option>
                                    <option value="nailon">Nailon</option>
                                    <option value="elastico">Elástico</option>
                                    <option value="invisible">Invisible/Transparente</option>
                                    <option value="metalico">Metálico</option>
                                    <option value="decorativo">Decorativo (brillante)</option>
                                    <option value="otro">Otro tipo...</option>
                                </select>
                            </div>
                            <!-- Subsubcategoria: COLOR DEL HILO-->
                            <div class="form-group">
                                <label for="color_hilo">
                                    <i class="fas fa-thread"></i> Color de Hilo *
                                </label>
                                <select id="color_hilo" name="color_hilo" class="form-control">
                                    <option value="">Seleccionar color de hilo...</option>
                                    <option value="blanco">Blanco</option>
                                    <option value="negro">Negro</option>
                                    <option value="gris">Gris</option>
                                    <option value="rojo">Rojo</option>
                                    <option value="azul">Azul</option>
                                    <option value="verde">Verde</option>
                                    <option value="amarillo">Amarillo</option>
                                    <option value="naranja">Naranja</option>
                                    <option value="rosa">Rosa</option>
                                    <option value="morado">Morado</option>
                                    <option value="marron">Marrón</option>
                                    <option value="beige">beige</option>
                                    <option value="multicolor">Multicolor</option>
                                    <option value="fluorescente">Fluorescente</option>
                                    <option value="pastel">Pastel</option>
                                    <option value="otros">Otro color...</option>
                                </select>
                            </div>
                        </div>     
                      </div>
                    
                    
                    <!-- Para AGUJAS -->
                    <div id="campo-subcategoria-agujas" class="campo-condicional" style="display: none;">
                        <div class="form-group">
                            <!-- Subcategoria: TIPO DE AGUJA-->
                            <label for="tipo_aguja">
                                <i class="fas fa-compress"></i> Tipo de Aguja *
                            </label>
                            <select id="tipo_aguja" name="tipo_aguja" class="form-control">
                                <option value="">Seleccionar tipo de aguja...</option>
                                <option value="maquina">Para Máquina de Coser</option>
                                <option value="mano">Para Coser a Mano</option>
                                <option value="overlock">Para Overlock</option>
                                <option value="bordadora">Para Máquina Bordadora</option>
                                <option value="tapiceria">Para Tapicería</option>
                                <option value="cuero">Para Cuero</option>
                                <option value="ojal">Para Hacer Ojales</option>
                                <option value="otro">Otro tipo...</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Para CIERRES (3 SUBCATEGORÍAS) -->
                    <div id="campo-subcategoria-cierres" class="campo-condicional" style="display: none;">
                        <div class="form-row">
                            <!-- Subcategoria: TIPO DE CIERRE -->
                            <div class="form-group">
                                <label for="tipo_cierre">
                                    <i class="fas fa-link"></i> Tipo de Cierre *
                                </label>
                                <select id="tipo_cierre" name="tipo_cierre" class="form-control">
                                    <option value="">Seleccionar tipo...</option>
                                    <option value="cremallera">Cremallera/Zipper</option>
                                    <option value="boton">Botonadura</option>
                                    <option value="gancho">Ganchos y Ojetes</option>
                                    <option value="corchete">Corchetes/Snap</option>
                                    <option value="velcro">Velcro</option>
                                    <option value="tacon">Tacón Automático</option>
                                    <option value="otro">Otro tipo...</option>
                                </select>
                            </div>
                            
                            <!-- Subsubcategoria: MEDIDA DEL CIERRE -->
                            <div class="form-group">
                                <label for="medida_cierre">
                                    <i class="fas fa-ruler"></i> Medida/Longitud *
                                </label>
                                <div class="input-with-icon">
                                    <input type="number" 
                                        id="medida_cierre" 
                                        name="medida_cierre" 
                                        class="form-control"
                                        min="1" 
                                        max="200" 
                                        step="0.1"
                                        placeholder="Ej: 20">
                                    <span class="unit">cm</span>
                                </div>
                                <small class="form-help">Longitud en centímetros</small>
                            </div>

                            <!-- Subcategoria adicional: COLOR DEL CIERRE -->
                            <div class="form-group">
                                <label for="color_cierre">
                                    <i class="fas fa-ruler"></i> Color de Cierre *
                                </label>
                                <select id="color_cierre" name="color_cierre" class="form-control">
                                    <option value="">Seleccionar color de hilo...</option>
                                    <option value="blanco">Blanco</option>
                                    <option value="negro">Negro</option>
                                    <option value="gris">Gris</option>
                                    <option value="rojo">Rojo</option>
                                    <option value="azul">Azul</option>
                                    <option value="verde">Verde</option>
                                    <option value="amarillo">Amarillo</option>
                                    <option value="naranja">Naranja</option>
                                    <option value="rosa">Rosa</option>
                                    <option value="morado">Morado</option>
                                    <option value="marron">Marrón</option>
                                    <option value="beige">beige</option>
                                    <option value="multicolor">Multicolor</option>
                                    <option value="fluorescente">Fluorescente</option>
                                    <option value="pastel">Pastel</option>
                                    <option value="otros">Otro color...</option>
                                </select>
                                <small class="form-help">¿Que color es el cierrre?</small>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Para BROCHES -->
                    <div id="campo-subcategoria-broches" class="campo-condicional" style="display: none;">
                        <!-- Subcategoria: TIPO DE BROCHE -->
                        <div class="form-group">
                            <label for="tipo_broche">
                                <i class="fas fa-paperclip"></i> Tipo de Broche *
                            </label>
                            <select id="tipo_broche" name="tipo_broche" class="form-control">
                                <option value="">Seleccionar tipo...</option>
                                <option value="presion">De Presión</option>
                                <option value="magnetico">Magnético</option>
                                <option value="gancho">Gancho y Ojal</option>
                                <option value="deslizante">Deslizante</option>
                                <option value="tacon">Tacón</option>
                                <option value="otro">Otro tipo...</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Para ADORNOS -->
                    <div id="campo-subcategoria-adornos" class="campo-condicional" style="display: none;">

                        <!-- Subcategoria: TIPO DE ADORNO -->
                        <div class="form-group">
                            <label for="tipo_adorno">
                                <i class="fas fa-gem"></i> Tipo de Adorno *
                            </label>
                            <select id="tipo_adorno" name="tipo_adorno" class="form-control">
                                <option value="">Seleccionar tipo...</option>
                                <option value="lentejuela">Lentejuelas</option>
                                <option value="pedreria">Pedrería</option>
                                <option value="canutillo">Canutillo</option>
                                <option value="mostacilla">Mostacillas</option>
                                <option value="cinta">CintasListones</option>
                                <option value="listones">Listones</option>
                                <option value="encaje">Encaje y Puntilla</option>
                                <option value="flor">Flores</option>
                                <option value="aplicaciones">Aplicaciones</option>
                                <option value="tachuela">Tachuelas</option>
                                <option value="otro">Otro tipo de adorno...</option>
                            </select>
                        </div>
                        
                        <!-- Subsubcategoria: COLOR DE ADORNO -->
                        <div class="form-group">
                            <label for="color_adorno">
                                    <i class="fas fa-ruler"></i> Color de adorno*
                                </label>
                                <select id="color_adorno" name="color_adorno" class="form-control">
                                    <option value="">Seleccionar color...</option>
                                    <option value="blanco">Blanco</option>
                                    <option value="negro">Negro</option>
                                    <option value="gris">Gris</option>
                                    <option value="rojo">Rojo</option>
                                    <option value="azul">Azul</option>
                                    <option value="verde">Verde</option>
                                    <option value="amarillo">Amarillo</option>
                                    <option value="naranja">Naranja</option>
                                    <option value="rosa">Rosa</option>
                                    <option value="morado">Morado</option>
                                    <option value="marron">Marrón</option>
                                    <option value="beige">beige</option>
                                    <option value="multicolor">Multicolor</option>
                                    <option value="fluorescente">Fluorescente</option>
                                    <option value="pastel">Pastel</option>
                                    <option value="otros">Otro color...</option>
                                </select>
                                <small class="form-help">¿De que color son?</small>
                        </div>
                    </div>
                    
                    <!-- Para MATERIALES ESPECIALES -->
                    <div id="campo-subcategoria-especiales" class="campo-condicional" style="display: none;">
                        <!-- Subcategoria: TIPO DE MATERIAL ESPECIAL -->
                        <div class="form-group">
                            <label for="tipo_especial">
                                <i class="fas fa-star"></i> Tipo de Material Especial *
                            </label>
                            <select id="tipo_especial" name="tipo_especial" class="form-control">
                                <option value="">Seleccionar tipo...</option>
                                <option value="bies">Bies</option>
                                <option value="guata">Guata</option>
                                <option value="elastico">Elásticos</option>
                                <option value="cordon">Cordones</option>
                                <option value="cola_rata">Cola de Rata</option>
                                <option value="otro">Otro material...</option>
                            </select>
                        </div>
                    </div>

                </div>
                
                <!-- SECCIÓN 2: ESPECIFICACIONES -->
                <div class="form-section">

                    <div class="form-group">
                        <label for="insumoNombre">
                            <i class="fas fa-tools"></i> Nombre del Insumo *
                        </label>
                        <input type="text" 
                            id="insumoNombre" 
                            name="nombre" 
                            class="form-control"
                            placeholder="Nombre descriptivo del insumo"
                            required>
                        <small class="form-help">Elige un nombre para el insumo</small>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="unidad_medida">
                                <i class="fas fa-balance-scale"></i> Unidad de Medida *
                            </label>
                            <select id="unidad_medida" name="unidad_medida" class="form-control" required>
                                <option value="">Seleccionar unidad</option>
                                <option value="unidad">Unidad</option>
                                <option value="carrete">Carrete</option>
                                <option value="metro">Metro</option>
                                <option value="paquete">Paquete</option>
                                <option value="caja">Caja</option>
                                <option value="rollo">Rollo</option>
                                <option value="docena">Docena</option>
                                <option value="kilo">Kilogramo</option>
                                <option value="litro">Litro</option>
                                <option value="juego">Juego/Set</option>
                                <option value="par">Par</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="cantidad_unidad">
                                <i class="fas fa-cube"></i> Contenido por Unidad *
                            </label>
                            <div class="input-with-icon">
                                <input type="number" 
                                    id="cantidad_unidad" 
                                    name="cantidad_unidad" 
                                    class="form-control"
                                    min="0.01" 
                                    max="10000" 
                                    step="0.01"
                                    value="1" 
                                    required>
                                <span class="unit" id="unidad-sufijo">unidad(es)</span>
                            </div>
                            <small class="form-help">Ej: 100 metros por rollo, 12 unidades por docena</small>
                        </div>
                    </div>
                    
                    <!-- STOCK -->
                    <div class="form-row">
                        <div class="form-group">
                            <label for="stock_actual">
                                <i class="fas fa-boxes"></i> Stock Actual *
                            </label>
                            <input type="number" 
                                id="stock_actual" 
                                name="stock_actual" 
                                class="form-control"
                                min="0" 
                                max="9999" 
                                value="0" 
                                required>
                            <small class="form-help">Cantidad disponible actualmente</small>
                        </div>
                        
                        <div class="form-group">
                            <label for="stock_minimo">
                                <i class="fas fa-exclamation-triangle"></i> Stock Mínimo *
                            </label>
                            <input type="number" 
                                id="stock_minimo" 
                                name="stock_minimo" 
                                class="form-control"
                                min="0" 
                                max="9999" 
                                value="5" 
                                required>
                            <small class="form-help">Alerta cuando el stock baje de este nivel</small>
                        </div>
                    </div>
                </div>

                <!-- BOTONES DE ACCIÓN -->
                <div class="form-actions">
                    <button type="button" class="btn-cancelar" onclick="cerrarModal()">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    
                    <button type="submit" class="btn-guardar">
                        <i class="fas fa-check"></i> Guardar Insumo
                    </button>
                </div>
            </form>
        `;
  },

  inicializarCamposCondicionales() {
    const categoriaSelect = document.getElementById("categoriaInsumo");
    const unidadMedidaSelect = document.getElementById("unidad_medida");
    const unidadSufijo = document.getElementById("unidad-sufijo");

    if (!categoriaSelect) return;

    const camposCondicionales = document.querySelectorAll(".campo-condicional");
    camposCondicionales.forEach((campo) => (campo.style.display = "none"));

    const mapaCategorias = {
      hilos: "campo-subcategoria-hilos",
      agujas: "campo-subcategoria-agujas",
      cierres: "campo-subcategoria-cierres",
      broches: "campo-subcategoria-broches",
      adornos: "campo-subcategoria-adornos",
      especiales: "campo-subcategoria-especiales",
    };

    categoriaSelect.addEventListener("change", function () {
      const categoria = this.value;

      camposCondicionales.forEach((campo) => {
        campo.style.display = "none";

        const inputs = campo.querySelectorAll("input, select");
        inputs.forEach((input) => {
          input.value = "";
          if (input.hasAttribute("required")) {
            input.removeAttribute("required");
          }
        });
      });

      if (mapaCategorias[categoria]) {
        const campoId = mapaCategorias[categoria];
        const campo = document.getElementById(campoId);
        if (campo) {
          campo.style.display = "block";

          const inputs = campo.querySelectorAll("input, select");
          inputs.forEach((input) => {
            input.setAttribute("required", "required");
          });
        }
      }

      const nombreInput = document.getElementById("insumoNombre");
      if (nombreInput) {
        const placeholders = {
          hilos: "Ej: Hilo poliester blanco 1000m, Hilo de seda color rosa...",
          agujas: "Ej: Agujas para máquina #90, Agujas para coser a mano...",
          cierres: "Ej: Cremallera invisible 20cm, Botones de madera...",
          broches: "Ej: Broches de presión 15mm, Ganchos automáticos...",
          adornos: "Ej: Lentejuelas plateadas, Pedrería cristal...",
          herramientas: "Ej: Tijeras profesionales, Dedales de metal...",
          especiales: "Ej: Entretela termoadhesiva, Vivo de algodón...",
          quimicos: "Ej: Quita manchas, Suavizante de telas...",
        };

        nombreInput.placeholder =
          placeholders[categoria] || "Nombre descriptivo del insumo";
      }
    });

    if (unidadMedidaSelect && unidadSufijo) {
      unidadMedidaSelect.addEventListener("change", function () {
        const sufijos = {
          unidad: "unidad(es)",
          carrete: "carrete(s)",
          metro: "metro(s)",
          paquete: "paquete(s)",
          caja: "caja(s)",
          rollo: "rollo(s)",
          docena: "docena(s)",
          kilo: "kg",
          litro: "litro(s)",
          juego: "juego(s)",
          par: "par(es)",
        };

        unidadSufijo.textContent = sufijos[this.value] || "unidad(es)";
      });

      if (unidadMedidaSelect.value) {
        unidadMedidaSelect.dispatchEvent(new Event("change"));
      }
    }

    if (categoriaSelect.value) {
      categoriaSelect.dispatchEvent(new Event("change"));
    }
  },

  validar(datos) {
    const errores = [];

    // 1. Validaciones de campos base
    if (!datos.nombre || datos.nombre.trim() === "") {
      errores.push("El nombre del insumo es requerido");
    }

    if (!datos.categoria) {
      errores.push("La categoría es requerida");
    }

    if (!datos.unidadMedida) {
      errores.push("La unidad de medida es requerida");
    }

    // Validamos que sea un número y mayor a 0
    if (isNaN(datos.cantidadUnidad) || datos.cantidadUnidad <= 0) {
      errores.push("La cantidad por unidad debe ser un número mayor a 0");
    }

    if (datos.stockActual === undefined || isNaN(datos.stockActual) || datos.stockActual < 0) {
      errores.push("El stock actual no puede ser negativo");
    }

    if (datos.stockMinimo === undefined || isNaN(datos.stockMinimo) || datos.stockMinimo < 0) {
      errores.push("El stock mínimo no puede ser negativo");
    }

    // 2. Validaciones condicionales por categoría (usando camelCase)
    switch (datos.categoria) {
      case "hilos":
        if (!datos.tipoHilo) errores.push("El tipo de hilo es requerido");
        // El color de hilo es opcional, así que no lo obligamos a menos que tú quieras
        break;

      case "agujas":
        if (!datos.tipoAguja) errores.push("El tipo de aguja es requerido");
        break;

      case "cierres":
        if (!datos.tipoCierre) errores.push("El tipo de cierre es requerido");
        if (isNaN(datos.medidaCierre) || datos.medidaCierre <= 0) {
          errores.push("La medida del cierre es requerida y debe ser mayor a 0");
        }
        break;

      case "broches":
        if (!datos.tipoBroche) errores.push("El tipo de broche es requerido");
        break;

      case "adornos":
        if (!datos.tipoAdorno) errores.push("El tipo de adorno es requerido");
        break;

      case "especiales":
        if (!datos.tipoEspecial) errores.push("El tipo de material especial es requerido");
        break;
    }

    return errores;
  },

  obtenerDatos(formId) {
      const form = document.getElementById(formId);
      if (!form) return null;
      
      const formData = new FormData(form);

      const datos = {
          categoria: formData.get("categoria"),
          nombre: formData.get("nombre")?.trim(),
          unidadMedida: formData.get("unidad_medida"),
          cantidadUnidad: parseFloat(formData.get("cantidad_unidad")) || 0,
          stockActual: parseInt(formData.get("stock_actual")) || 0,
          stockMinimo: parseInt(formData.get("stock_minimo")) || 0,
      };

      const categoria = datos.categoria;

      switch (categoria) {
          case "hilos":
              datos.tipoHilo = formData.get("tipo_hilo");
              datos.colorHilo = formData.get("color_hilo"); // Captura el color
              break;
          case "agujas":
              datos.tipoAguja = formData.get("tipo_aguja");
              break;
          case "cierres":
              datos.tipoCierre = formData.get("tipo_cierre");
              datos.colorCierre = formData.get("color_cierre"); // Captura el color
              datos.medidaCierre = parseFloat(formData.get("medida_cierre")) || null;
              break;
          case "broches":
              datos.tipoBroche = formData.get("tipo_broche");
              break;
          case "adornos":
              datos.tipoAdorno = formData.get("tipo_adorno");
              break;
          case "especiales":
              datos.tipoEspecial = formData.get("tipo_especial");
              break;
      }

      return datos;
  },

  rellenar(datos) {
  // 1. Buscar el formulario (Ajustado al ID que definiste en generar())
  let form = document.getElementById("modal-añadir") || document.querySelector(".form-inventario");

  if (!form) {
    console.error("ERROR CRÍTICO: El formulario de insumos no existe en el DOM.");
    return;
  }

  // 2. Encabezado y modo
  const header = form.querySelector(".form-header h3");
  if (header) header.innerHTML = `<i class="fas fa-edit"></i> Editar Insumo`;

  form.dataset.modo = "editar";
  form.dataset.idActual = datos.id;

  // --- 3. LÓGICA DEL BOTÓN ELIMINAR ---
  const actionsContainer = form.querySelector(".form-actions");
  // Limpiamos si ya existía un botón eliminar previo para evitar duplicados
  const btnPrevio = document.getElementById("btn-eliminar-insumo");
  if (btnPrevio) btnPrevio.remove();

  if (actionsContainer) {
    const btnEliminar = document.createElement("button");
    btnEliminar.id = "btn-eliminar-insumo";
    btnEliminar.type = "button";
    btnEliminar.innerHTML = `<i class="fas fa-trash"></i> Eliminar`;

    Object.assign(btnEliminar.style, {
      backgroundColor: "#dc3545",
      color: "white",
      border: "none",
      padding: "10px 15px",
      borderRadius: "5px",
      cursor: "pointer",
      marginRight: "auto",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    });

    actionsContainer.prepend(btnEliminar);

    btnEliminar.onclick = (e) => {
      e.preventDefault();
      // Llamamos al método eliminar del objeto actual
      this.eliminar(datos.id); 
    };
  }

  // 4. Función auxiliar para asignar valores
  const asignar = (id, valor) => {
    const el = document.getElementById(id);
    if (el) el.value = (valor !== undefined && valor !== null) ? valor : "";
  };

  // 5. Asignación de campos base
  asignar("categoriaInsumo", datos.categoria);
  asignar("insumoNombre", datos.nombre);
  asignar("unidad_medida", datos.unidadMedida);
  asignar("cantidad_unidad", datos.cantidadUnidad);
  asignar("stock_actual", datos.stockActual);
  asignar("stock_minimo", datos.stockMinimo);

  // 6. Lógica para campos condicionales
  const categoriaSelect = document.getElementById("categoriaInsumo");
  if (categoriaSelect) {
      // Esto activa mostrar/ocultar los divs de subcategorías
      categoriaSelect.dispatchEvent(new Event("change"));
      
      setTimeout(() => {
        const cat = datos.categoria;
        switch (cat) {
          case "hilos":
            asignar("tipo_hilo", datos.tipoHilo);
            asignar("color_hilo", datos.colorHilo);
            break;
          case "agujas":
            asignar("tipo_aguja", datos.tipoAguja);
            break;
          case "cierres":
            asignar("tipo_cierre", datos.tipoCierre);
            asignar("color_cierre", datos.colorCierre);
            asignar("medida_cierre", datos.medidaCierre);
            break;
          case "broches":
            asignar("tipo_broche", datos.tipoBroche);
            break;
          case "adornos":
            asignar("tipo_adorno", datos.tipoAdorno);
            asignar("color_adorno", datos.colorAdorno); // Agregado para coincidir con tu HTML
            break;
          case "especiales":
            asignar("tipo_especial", datos.tipoEspecial);
            break;
        }
        
        const unidadSelect = document.getElementById("unidad_medida");
        if (unidadSelect) unidadSelect.dispatchEvent(new Event("change"));
      }, 100);
    }
  },

  async eliminar(id) {
    // 1. Doble verificación con el usuario
    if (!confirm("¿Seguro que quieres eliminar este insumo del inventario? Esta acción no se puede deshacer.")) {
      return;
    }
    
    try {
      // 2. Llamada a la API
      const response = await fetch(`http://localhost:3000/insumos/${id}`, {
        method: "DELETE",
      });

      // 3. Validación de respuesta
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el insumo");
      }

      // 4. Feedback y actualización de interfaz
      alert("Insumo eliminado con éxito");

      if (window.FormularioManager) {
        window.FormularioManager.cerrarModal();
      }
      
      if (window.inventarioManager) {
        window.inventarioManager.mostrarInventario("insumos");
      }
      
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("No se pudo eliminar: " + error.message);
    }
  },

  async prepararEdicionInsumo(id) {
    console.log("Editando insumo con ID:", id); 
    try {
          // 1. Obtener los datos frescos del servidor
          const response = await fetch(`http://localhost:3000/insumos/${id}`);
          if (!response.ok) throw new Error("No se pudo obtener los datos del insumo");
          const insumo = await response.json();

          // 2. Abrir el modal usando el manager
          if (window.FormularioManager) {
              window.FormularioManager.abrirModalFormulario(
                  "insumos", 
                  "Editar Insumo", 
                  "editar", 
                  id
              );
          }

          // 3. Llenar el formulario con los datos obtenidos
          // Usamos un pequeño delay para asegurar que el HTML se haya inyectado en el DOM
          setTimeout(() => {
              if (window.FormularioInsumos && typeof window.FormularioInsumos.rellenar === "function") {
                  // Llamamos a rellenar (que es el método que revisamos antes)
                  window.FormularioInsumos.rellenar(insumo);
              } else {
                  console.error("FormularioInsumos.rellenar no está disponible");
              }
          }, 150); // 150ms suele ser suficiente

      } catch (error) {
          console.error("Error al preparar edición:", error);
          alert("Error: No se pudo cargar la información del insumo.");
      }
  },

  limpiar() {
      const form = document.getElementById("modal-añadir");
      if (!form) return;

      // 1. Resetear todos los campos del formulario (incluyendo selectores)
      form.reset();

      // 2. Volver al estado "crear" y limpiar el ID de edición
      form.dataset.modo = "crear";
      delete form.dataset.idActual;

      // 3. Eliminar el botón de eliminar (para que no aparezca en "Nuevo Insumo")
      const btnEliminar = document.getElementById("btn-eliminar-insumo");
      if (btnEliminar) btnEliminar.remove();

      // 4. Restaurar el título original del encabezado
      const header = form.querySelector(".form-header h3");
      if (header) {
          header.innerHTML = `<i class="fas fa-plus-circle"></i> Nuevo Insumo`;
      }

      // 5. ¡IMPORTANTE! Ocultar todas las secciones condicionales (hilos, agujas, etc.)
      const camposCondicionales = form.querySelectorAll(".campo-condicional");
      camposCondicionales.forEach(div => {
          div.style.display = "none";
      });

      // 6. Resetear el sufijo de la unidad de medida al valor por defecto
      const sufijoUnidad = document.getElementById("unidad-sufijo");
      if (sufijoUnidad) {
          sufijoUnidad.innerText = "unidad(es)";
      }
  }
};

// MANEJADOR PRINCIPAL DE LOS FORMULARIOS DE INVENTARIO
export const FormularioManager = {
  generarFormulario(categoria, datos = {}) {
    const formularios = {
      vestidos: FormularioVestidos,
      telas: FormularioTelas,
      insumos: FormularioInsumos,
      productos: FormularioProductos,
    };

    const formulario = formularios[categoria];
    if (!formulario) {
      throw new Error(`Categoría no soportada: ${categoria}`);
    }

    return formulario.generar(datos);
  },

  validarFormulario(categoria, datos) {
    const validadores = {
      vestidos: FormularioVestidos.validar,
      telas: FormularioTelas.validar,
      insumos: FormularioInsumos.validar,
      productos: FormularioProductos.validar,
    };

    const validador = validadores[categoria];
    if (!validador) {
      throw new Error(`Validador no encontrado para: ${categoria}`);
    }

    return validador(datos);
  },

  obtenerDatosFormulario(categoria, formId) {
    const mapeo = {
      vestidos: FormularioVestidos,
      telas: FormularioTelas,
      insumos: FormularioInsumos,
      productos: FormularioProductos,
    };

    const modulo = mapeo[categoria];
    if (!modulo || !modulo.obtenerDatos) {
      throw new Error(`Extractor no encontrado para: ${categoria}`);
    }

    return modulo.obtenerDatos(formId);
  },

  async enviarDatosAlServidor(categoria, datos, modo, id) {
    const endpoints = {
      vestidos: "http://localhost:3000/vestidos",
      productos: "http://localhost:3000/productos",
      telas: "http://localhost:3000/telas",
      insumos: "http://localhost:3000/insumos",
    };

    const url =
      modo === "editar"
        ? `${endpoints[categoria]}/${id}`
        : endpoints[categoria];
    const metodo = modo === "editar" ? "PATCH" : "POST";

    const response = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const resultado = await response.json();

    if (!response.ok) {
      throw new Error(resultado.message || "Error en el servidor");
    }

    return { success: true, data: resultado };
  },

  configurarSubmit(formId, categoria, callbackGuardar) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      try {
        const datos = this.obtenerDatosFormulario(categoria, formId);

        const errores = this.validarFormulario(categoria, datos);
        if (errores.length > 0) {
          this.mostrarErrores(errores);
          return;
        }

        this.mostrarLoading();

        const resultado = await callbackGuardar(datos);

        if (resultado.success) {
          this.mostrarExito(`${categoria} guardado correctamente`);
          setTimeout(() => {
            this.cerrarModal();
            if (window.inventarioManager) {
              window.inventarioManager.mostrarInventario(categoria);
            }
          }, 1500);
        }
      } catch (error) {
        console.error("Error en formulario:", error);
        this.mostrarError(error.message);
        this.restaurarBoton();
      }
    });
  },

  restaurarBoton() {
    const btn = document.querySelector(".btn-guardar");
    if (btn) {
      btn.innerHTML = '<i class="fas fa-save"></i> Guardar';
      btn.disabled = false;
    }
  },

  mostrarErrores(errores) {
    const errorHtml = errores
      .map((error) => `<div class="error-message">${error}</div>`)
      .join("");

    const errorContainer = document.createElement("div");
    errorContainer.className = "errores-formulario";
    errorContainer.innerHTML = errorHtml;

    const form = document.querySelector(".form-inventario");
    if (form) {
      const existingErrors = form.querySelector(".errores-formulario");
      if (existingErrors) existingErrors.remove();
      form.prepend(errorContainer);
    }

    setTimeout(() => {
      if (errorContainer.parentNode) {
        errorContainer.remove();
      }
    }, 5000);
  },

  mostrarLoading() {
    const submitBtn = document.querySelector(".btn-guardar");
    if (submitBtn) {
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Guardando...';
      submitBtn.disabled = true;
    }
  },

  mostrarExito(mensaje) {
    const successDiv = document.createElement("div");
    successDiv.className = "exito-formulario";
    successDiv.innerHTML = `
            <div class="exito-content">
                <i class="fas fa-check-circle"></i>
                <span>${mensaje}</span>
            </div>
        `;

    const form = document.querySelector(".form-inventario");
    if (form) {
      form.prepend(successDiv);

      setTimeout(() => {
        if (successDiv.parentNode) {
          successDiv.remove();
        }
      }, 3000);
    }
  },

  mostrarError(mensaje) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-formulario";
    errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${mensaje}</span>
            </div>
        `;

    const form = document.querySelector(".form-inventario");
    if (form) {
      form.prepend(errorDiv);

      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.remove();
        }
      }, 5000);
    }
  },

  cerrarModal() {
    const modal = document.querySelector(".modal-inventario");
    if (modal) {
      modal.remove();
    }
  },

  abrirModalFormulario(categoria, titulo, modo = "crear", idActual = null) {
    const modalHtml = `
            <div class="modal-inventario active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${titulo}</h2>
                        <button class="modal-close" onclick="cerrarModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="modal-form-body">
                        ${this.generarFormulario(categoria)}
                    </div>
                </div>
            </div>
        `;

    const divHelper = document.createElement("div");
    divHelper.innerHTML = modalHtml;
    const modalElement = divHelper.firstElementChild;
    document.body.appendChild(modalElement);

    const form =
      modalElement.querySelector("form") ||
      document.getElementById("modal-añadir");

    if (form) {
      form.dataset.modo = modo;
      if (idActual) form.dataset.idActual = idActual;

      if (modo === "crear") {
        form.reset();
      } else {
        const btnGuardar = form.querySelector(".btn-guardar");
        if (btnGuardar)
          btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
      }
    }

    this.inicializarCamposCondicionales(categoria);

    this.configurarSubmit("modal-añadir", categoria, async (datos) => {
      return await this.enviarDatosAlServidor(categoria, datos, modo, idActual);
    });
  },

  inicializarCamposCondicionales(categoria) {
    const inicializadores = {
      insumos: () => {
        setTimeout(() => {
          if (FormularioInsumos.inicializarCamposCondicionales) {
            FormularioInsumos.inicializarCamposCondicionales();
          }
        }, 50);
      },
      telas: () => {
        const selectNombre = document.getElementById("nombre_tela");
        selectNombre.addEventListener("change", (e) => {
          if (e.target.value === "otraTela") {
            const nuevoNombre = prompt("Ingrese el nombre de la nueva tela:");
            if (nuevoNombre) {
              const option = new Option(nuevoNombre, nuevoNombre, true, true);
              selectNombre.add(option);
            } else {
              selectNombre.value = "";
            }
          }
          setTimeout(() => {
            FormularioTelas.rellenar(datosDeLaTela);
          }, 50);
        });
      },
      vestidos: () => {
        setTimeout(() => {
          if (FormularioVestidos.inicializarCamposCondicionales) {
            FormularioVestidos.inicializarCamposCondicionales();
          }
        }, 50);
      },
    };

    const inicializar = inicializadores[categoria];
    if (inicializar) {
      inicializar();
    }
  },
};

// Exponer cerrarModal para que funcione el 'onclick' en el HTML inyectado
window.cerrarModal = FormularioManager.cerrarModal.bind(FormularioManager);
window.FormularioManager = FormularioManager;
window.FormularioVestidos = FormularioVestidos;
window.FormularioTelas = FormularioTelas;
window.FormularioInsumos = FormularioInsumos;
window.FormularioProductos = FormularioProductos;
