const PosManager = {
  productos: [],
  carrito: [],
  total: 0,
  descuentoAplicado: 0,

  async init() {
    console.log("POS Inicializado");
    await this.cargarDB();
    this.setEventListeners();
    this.mostrarMensajeInicial();
    const btnDescuento = document.querySelector(".agregar-descuento-btn");
    if (btnDescuento) {
      // CAMBIA ESTO:
      btnDescuento.onclick = () => this.abrirModalDescuento();
    }
  },

  async cargarDB() {
    try {
      const response = await fetch("http://localhost:3000/inventario/todos");
      if (!response.ok) throw new Error("Error al conectar con la DB");
      this.productos = await response.json();
      // --- AGREGA ESTO ---
      console.log("ESTRUCTURA REAL DE UN PRODUCTO:", this.productos[1]);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      const contenedor = document.getElementById("listaProductos");
      if (contenedor)
        contenedor.innerHTML = `<p style="color:red;">Error de conexión.</p>`;
    }
  },

  setEventListeners() {
    const buscador = document.getElementById("buscador");
    if (buscador) {
      let timeoutId;
      buscador.addEventListener("input", (e) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          this.filtrarProductos(e.target.value.toLowerCase());
        }, 300); // Retardo de 300ms
      });
    }

    const contenedorProductos = document.getElementById("listaProductos");
    if (contenedorProductos) {
      contenedorProductos.addEventListener("click", (e) => {
        const boton = e.target.closest(".btn-add-carrito");
        if (boton) {
          const id = boton.dataset.id || boton.getAttribute("data-id");
          if (id && id !== "undefined") {
            this.agregarAlCarrito(id);
          }
        }
      });
    }

    document.querySelector(".agregar-descuento-btn").onclick = () =>
      this.abrirModalDescuento();

    document.getElementById("btnCerrarModal").onclick = () =>
      this.cerrarModalDescuento();
    document.getElementById("btnConfirmarDescuento").onclick = () =>
      this.confirmarDescuento();
  },

  mostrarMensajeInicial() {
    const contenedor = document.getElementById("listaProductos");
    if (contenedor) {
      contenedor.innerHTML = `
        <div class="mensaje-inicial" style="text-align:center; padding: 2rem; color: #666;">
            <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>Escriba en el buscador para ver productos disponibles</p>
        </div>`;
    }
  },

  filtrarProductos(termino) {
    const contenedor = document.getElementById("listaProductos");
    if (!contenedor) return;

    if (!termino || termino.trim() === "") {
      const grid = contenedor.querySelector(".productos-grid");
      if (grid && grid.querySelectorAll(".producto-card").length > 0) {
        const cards = Array.from(grid.querySelectorAll(".producto-card"));
        // Todas salen a la vez, no escalonado
        cards.forEach((card) => {
          card.style.animation = "slideOutLeft 0.2s ease forwards";
        });
        setTimeout(() => {
          this.mostrarMensajeInicial();
        }, 200);
      } else {
        this.mostrarMensajeInicial();
      }
      return;
    }

    let grid = contenedor.querySelector(".productos-grid");
    if (!grid) {
      grid = document.createElement("div");
      grid.className = "productos-grid";
      contenedor.innerHTML = "";
      contenedor.appendChild(grid);
    }

    const terminoLower = termino.toLowerCase();
    const productosFiltrados = this.productos.filter((p) => {
      const coincideFiltro =
        p.nombre.toLowerCase().includes(terminoLower) ||
        (p.categoria && p.categoria.toLowerCase().includes(terminoLower));

      // AGREGA ESTA LÍNEA:
      const tieneStock = Number(p.stockActual) > 0;

      return coincideFiltro && tieneStock; // Solo si cumple ambos
    });

    const cards = grid.querySelectorAll(".producto-card");
    const cardsArray = Array.from(cards);
    const idsActuales = new Set();

    cardsArray.forEach((card) => {
      const btn = card.querySelector(".btn-add-carrito");
      if (btn && btn.dataset.id) {
        idsActuales.add(btn.dataset.id);
      }
    });

    // 1. Animar salida de tarjetas que NO coinciden
    const tarjetasParaSalir = cardsArray.filter((card) => {
      const btn = card.querySelector(".btn-add-carrito");
      if (!btn || !btn.dataset.id) return false;

      const id = btn.dataset.id;
      const producto = this.productos.find(
        (p) => p.idProducto.toString() === id,
      );
      if (!producto) return true;

      const nombre = producto.nombre.toLowerCase();
      const categoria = producto.categoria
        ? producto.categoria.toLowerCase()
        : "";

      return !(
        nombre.includes(terminoLower) || categoria.includes(terminoLower)
      );
    });

    // SALIDA RÁPIDA (todas a la vez)
    tarjetasParaSalir.forEach((card) => {
      card.style.animation = "slideOutLeft 0.15s ease forwards";
      setTimeout(() => {
        if (card.parentNode === grid) {
          grid.removeChild(card);
        }
      }, 150);
    });

    // 2. Resaltar las que quedan
    cardsArray
      .filter((card) => !tarjetasParaSalir.includes(card))
      .forEach((card) => {
        const texto = card.querySelector(".prod-nombre");
        if (texto) {
          const textoOriginal = texto.textContent || texto.innerText;
          const terminoEscapado = termino.replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&",
          );
          const regex = new RegExp(`(${terminoEscapado})`, "gi");
          texto.innerHTML = textoOriginal.replace(regex, "<mark>$1</mark>");
        }
      });

    // 3. Entrada de nuevos productos
    const productosParaEntrar = productosFiltrados.filter(
      (prod) => !idsActuales.has(prod.idProducto.toString()),
    );

    if (productosParaEntrar.length > 0) {
      const fragment = document.createDocumentFragment();

      productosParaEntrar.forEach((prod, index) => {
        const card = document.createElement("div");
        card.className = "producto-card";
        card.style.opacity = "0";
        card.style.transform = "translateX(20px)";

        let nombreHTML = prod.nombre;
        const terminoEscapado = termino.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const regex = new RegExp(`(${terminoEscapado})`, "gi");
        nombreHTML = prod.nombre.replace(regex, "<mark>$1</mark>");

        card.innerHTML = `
        <div class="prod-info">
          <strong class="prod-nombre">${nombreHTML}</strong>
          <span class="prod-precio">$${(Number(prod.precioVenta) || 0).toFixed(2)}</span>
          <small class="prod-stock">Stock: ${prod.stockActual || 0}</small>
        </div>
        <button class="btn-add-carrito" data-id="${prod.idProducto}">
          <i class="fas fa-plus" style="pointer-events: none;">+</i>
        </button>
      `;

        fragment.appendChild(card);

        // ENTRADA RÁPIDA (muy poco delay entre ellas)
        setTimeout(() => {
          card.style.animation = "slideInRight 0.2s ease forwards";
          card.style.opacity = "1";
          card.style.transform = "translateX(0)";
        }, index * 10); // Solo 10ms de diferencia
      });

      grid.appendChild(fragment);
    }

    // 4. Si no hay resultados
    setTimeout(() => {
      const cardsVisibles = grid.querySelectorAll(".producto-card");
      if (cardsVisibles.length === 0 && productosFiltrados.length === 0) {
        contenedor.innerHTML = `
        <div class="mensaje-inicial" style="text-align:center; padding: 2rem; color: #666;">
          <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>No se encontraron productos para "${termino}"</p>
        </div>`;
      }
    }, 250);
  },

  renderizarInventario(lista, termino = "") {
    const contenedor = document.getElementById("listaProductos");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "productos-grid";

    lista.forEach((prod) => {
      // CORRECCIÓN: Usamos 'prod' que es la variable del forEach
      // Y verificamos stockActual directamente en 'prod'
      if (!prod) return;

      // --- VALIDACIÓN DE STOCK CERO ---
      if (Number(prod.stockActual) <= 0) {
        return; // Salta este producto y sigue con el siguiente
      }

      const card = document.createElement("div");
      card.className = "producto-card";

      // Si tienes lógica de resaltado de texto para la búsqueda,
      // podrías usar una variable para el nombre, si no, prod.nombre está bien.
      const nombreDisplay = prod.nombre;

      card.innerHTML = `
            <div class="prod-info">
                <strong class="prod-nombre">${nombreDisplay}</strong>
                <span class="prod-precio">$${(Number(prod.precioVenta) || 0).toFixed(2)}</span>
                <small class="prod-stock">Stock: ${prod.stockActual}</small>
            </div>
            <button class="btn-add-carrito" data-id="${prod.idProducto}">
                <i class="fas fa-plus" style="pointer-events: none;"></i>
            </button>
        `;
      grid.appendChild(card);
    });

    contenedor.appendChild(grid);

    // Aplicamos el efecto de parpadeo si no hay búsqueda activa
    if (!termino) {
      grid.classList.add("stock-update-flash");
      setTimeout(() => grid.classList.remove("stock-update-flash"), 1500);
    }
  },

  agregarAlCarrito(id) {
    const idNum = Number(id);
    // Buscamos directamente en la lista de productos
    const producto = this.productos.find((p) => Number(p.idProducto) === idNum);

    if (!producto) {
      console.error("No se encontró el producto con idProducto:", idNum);
      return;
    }

    const itemExistente = this.carrito.find(
      (item) => Number(item.id) === idNum,
    );

    if (itemExistente) {
      if (itemExistente.cantidad >= producto.stockActual) {
        alert("No hay suficiente stock");
        return;
      }
      itemExistente.cantidad++;
    } else {
      this.carrito.push({
        id: producto.idProducto,
        nombre: producto.nombre,
        precio: Number(producto.precioVenta) || 0,
        cantidad: 1,
        stockMaximo: producto.stockActual,
      });
    }

    this.actualizarCarrito();
  },

  actualizarCarrito() {
    const listaUI = document.getElementById("listaCarrito");
    if (!listaUI) return;

    const fragment = document.createDocumentFragment();
    this.carrito.forEach((item) => {
      fragment.appendChild(this.crearItemCarrito(item));
    });

    listaUI.innerHTML = "";
    listaUI.appendChild(fragment);
    this.actualizarTotales();
  },

  actualizarTotales() {
    // 1. Calcular Subtotal (suma simple de productos)
    const subtotal = this.carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0,
    );

    // 2. Calcular monto a restar
    const montoDescuento = subtotal * (this.descuentoAplicado / 100);

    // 3. Calcular Total final
    this.total = subtotal - montoDescuento;

    // 4. Pintar en el HTML
    const subtotalElem = document.getElementById("subtotalTexto");
    const descuentoElem = document.getElementById("descuento");
    const totalElem = document.getElementById("totalPrecio");

    if (subtotalElem)
      subtotalElem.textContent = `Subtotal: $${subtotal.toFixed(2)}`;

    if (descuentoElem) {
      descuentoElem.textContent =
        this.descuentoAplicado > 0
          ? `Descuento (${this.descuentoAplicado}%): -$${montoDescuento.toFixed(2)}`
          : "";
    }

    if (totalElem) totalElem.textContent = `$${this.total.toFixed(2)}`;
  },

  crearItemCarrito(item) {
    const li = document.createElement("li");
    li.className = "carrito-item";
    li.innerHTML = `
        <div class="item-info">
            <span class="carrito-nombre">${item.nombre}</span>
            <div class="item-controles">
                <button class="btn-decremento">-</button>
                <span class="carrito-cantidad">${item.cantidad}</span>
                <button class="btn-incremento">+</button>
            </div>
        </div>
        <span class="carrito-precio">$${(item.precio * item.cantidad).toFixed(2)}</span>
        <button class="btn-eliminar-item"><i class="fas fa-times">x</i></button>
    `;

    li.querySelector(".btn-decremento").addEventListener("click", () =>
      this.modificarCantidad(item.id, -1),
    );
    li.querySelector(".btn-incremento").addEventListener("click", () =>
      this.modificarCantidad(item.id, 1),
    );
    li.querySelector(".btn-eliminar-item").addEventListener("click", () =>
      this.eliminarDelCarrito(item.id),
    );

    return li;
  },

  modificarCantidad(id, cambio) {
    const item = this.carrito.find((i) => Number(i.id) === Number(id));
    if (!item) return;

    const nuevaCantidad = item.cantidad + cambio;

    if (nuevaCantidad < 1) {
      this.eliminarDelCarrito(id);
      return;
    }

    if (cambio > 0 && nuevaCantidad > item.stockMaximo) {
      alert("No hay más stock disponible");
      return;
    }

    item.cantidad = nuevaCantidad;
    this.actualizarCarrito();
  },

  eliminarDelCarrito(id) {
    this.carrito = this.carrito.filter((i) => Number(i.id) !== Number(id));
    this.actualizarCarrito();
  },

  async finalizarCompra() {
    if (this.carrito.length === 0) return alert("El carrito está vacío");

    const confirmar = confirm(
      `¿Confirmar venta por $${this.total.toFixed(2)}?`,
    );
    if (!confirmar) return;

    // --- MOSTRAR CARGANDO ---
    const loader = document.createElement("div");
    loader.className = "loader-overlay";
    loader.innerHTML = `
        <div class="spinner"></div>
        <p style="margin-top: 15px; font-family: sans-serif; font-weight: bold; color: #333;">
            Procesando venta...
        </p>
    `;
    document.body.appendChild(loader);

    // Bloquear botón para evitar doble clic
    const btn = document.getElementById("finalizarCompraBtn");
    btn.disabled = true;

    try {
      const response = await fetch("http://localhost:3000/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: this.carrito.map((item) => ({
            idProducto: item.id,
            cantidad: item.cantidad,
          })),
          porcentajeDescuento: this.descuentoAplicado,
        }),
      });

      if (response.ok) {
        const resultado = await response.json(); // Obtenemos el ID de venta y totales del backend
        // GUARDAMOS una copia del carrito antes de limpiarlo para el ticket
        const copiaCarrito = [...this.carrito];

        // Esperar un pequeño delay artificial para que la animación se aprecie
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 1. Limpiamos el carrito
        this.carrito = [];
        // 2. Reseteamos el descuento aplicado a 0 de nuevo
        this.descuentoAplicado = 0;
        // 3. Actualizamos la interfaz
        this.actualizarCarrito(); // Esto llamará a actualizarTotales y pondrá todo en $0

        await this.cargarDB();

        // Quitar el cargador antes del alert
        loader.remove();
        const imprimir = confirm("¿Desea imprimir el ticket?");
        if (imprimir) {
          setTimeout(() => {
            this.imprimirTicket(resultado, copiaCarrito);
          }, 300); // Pequeño delay
        }

        // Refrescar inventario
        const buscador = document.getElementById("buscador");
        this.renderizarInventario(this.productos, buscador?.value || "");
      } else {
        loader.remove();
        const resultado = await response.json();
        alert(
          "Error: " + (resultado.message || "No se pudo completar la venta"),
        );
      }
    } catch (error) {
      loader.remove();
      console.error("Error:", error);
      alert("Error de conexión");
    } finally {
      btn.disabled = false;
      if (document.querySelector(".loader-overlay")) loader.remove();
    }
  },

  abrirModalDescuento() {
    const modal = document.getElementById("modalDescuento");
    const input = document.getElementById("inputPorcentaje");
    if (modal && input) {
      input.value = this.descuentoAplicado || "";
      modal.style.display = "flex";
      input.focus();
    } else {
      console.error("No se encontró el HTML del modal de descuento");
    }
  },

  cerrarModalDescuento() {
    document.getElementById("modalDescuento").style.display = "none";
  },

  confirmarDescuento() {
    const input = document.getElementById("inputPorcentaje");
    const porcentaje = parseFloat(input.value) || 0;

    if (porcentaje < 0 || porcentaje > 100) {
      alert("El descuento debe estar entre 0 y 100");
      return;
    }

    this.descuentoAplicado = porcentaje;
    this.actualizarTotales();
    input.value = ""; // Limpiar el input para la próxima vez
    this.cerrarModalDescuento();
  },

  async imprimirTicket(datosVenta, itemsCarrito) {
    // ===========================================
    // 1. CARGAR EL LOGO
    // ===========================================
    let logoSrc = "";

    // Intentar cargar el logo desde el servidor
    try {
      // Ruta relativa desde donde se sirve el HTML
      const logoBase64 = await this.convertirImagenABase64(
        "../../../assets/img/logo.png",
      );
      if (logoBase64) {
        logoSrc = logoBase64;
      } else {
        // Fallback: logo de texto
        logoSrc = null;
      }
    } catch (error) {
      console.warn("No se pudo cargar el logo, usando texto:", error);
      logoSrc = null;
    }

    // ===========================================
    // 2. GENERAR HTML DEL TICKET
    // ===========================================
    const ANCHO_TICKET = "250px";

    const ticketHTML = `
        <div class="ticket-container" style="
            width: ${ANCHO_TICKET};
            padding: 12px 15px;
            background: white;
            font-family: 'Courier New', Courier, monospace;
            color: black;
            margin: 0 auto;
            box-sizing: border-box;
            border: none;
            font-size: 12px;
            line-height: 1.3;
        ">
            
            <!-- ===== LOGO REAL ===== -->
            <div style="text-align: center; margin-bottom: 8px;">
                ${
                  logoSrc
                    ? `
                    <img src="${logoSrc}" 
                         style="width: 100px; height: auto; margin-bottom: 5px; display: inline-block;"
                         alt="Creaciones Madriz Logo">
                    <div style="font-size: 14px; font-weight: bold; letter-spacing: 1px; margin-top: 2px;">
                        CREACIONES MADRIZ
                    </div>
                `
                    : `
                    <div style="font-size: 22px; font-weight: bold; letter-spacing: 2px; color: #000;">
                        CREACIONES MADRIZ
                    </div>
                    <div style="font-size: 11px; margin-top: 2px; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 3px 0; display: inline-block;">
                        ✦ PUNTO DE VENTA ✦
                    </div>
                `
                }
            </div>
            
            <!-- ===== INFORMACIÓN CONTACTO ===== -->
            <div style="text-align: center; font-size: 11px; margin-bottom: 12px;">
                <div style="margin-bottom: 2px;">+52 453 103 9314</div>
                <div style="margin-bottom: 2px;">Martínez de Navarrete #490</div>
                <div>Col. Jardines de Cdral</div>
            </div>
            
            <!-- SEPARADOR -->
            <div style="border-top: 1px dashed #333; margin: 8px 0;"></div>
            
            <!-- ===== FECHA Y FOLIO ===== -->
            <div style="font-size: 11px; margin-bottom: 10px; display: flex; justify-content: space-between;">
                <span>${this.formatearFechaTicket(new Date())}</span>
                <span>Ticket #${datosVenta.idVenta}</span>
            </div>
            
            <!-- SEPARADOR -->
            <div style="border-top: 1px dashed #333; margin: 8px 0;"></div>
            
            <!-- ===== PRODUCTOS ===== -->
            <div style="display: flex; font-weight: bold; font-size: 11px; margin-bottom: 5px; border-bottom: 1px solid #000; padding-bottom: 3px;">
                <div style="width: 15%;">CANT</div>
                <div style="width: 55%;">PRODUCTO</div>
                <div style="width: 30%; text-align: right;">TOTAL</div>
            </div>
            
            ${itemsCarrito
              .map(
                (item) => `
                <div style="display: flex; font-size: 11px; margin-bottom: 3px;">
                    <div style="width: 15%;">${item.cantidad}</div>
                    <div style="width: 55%;">${item.nombre.substring(0, 14)}${item.nombre.length > 14 ? ".." : ""}</div>
                    <div style="width: 30%; text-align: right;">$${(item.precio * item.cantidad).toFixed(2)}</div>
                </div>
            `,
              )
              .join("")}
            
            <!-- SEPARADOR -->
            <div style="border-top: 1px dashed #333; margin: 12px 0;"></div>
            
            <!-- ===== TOTALES ===== -->
            <div style="font-size: 11px; margin-bottom: 3px; display: flex; justify-content: space-between;">
                <span>SUBTOTAL:</span>
                <span>$${datosVenta.subtotal.toFixed(2)}</span>
            </div>
            
            ${
              datosVenta.porcentajeDescuento > 0
                ? `
                <div style="font-size: 11px; margin-bottom: 3px; display: flex; justify-content: space-between;">
                    <span>DESCUENTO (${datosVenta.porcentajeDescuento}%):</span>
                    <span>-$${datosVenta.descuento.toFixed(2)}</span>
                </div>
            `
                : ""
            }
            
            <div style="font-size: 14px; font-weight: bold; margin-top: 8px; padding-top: 5px; border-top: 2px double #000; display: flex; justify-content: space-between;">
                <span>TOTAL:</span>
                <span>$${datosVenta.total.toFixed(2)}</span>
            </div>
            
            <!-- SEPARADOR -->
            <div style="border-top: 1px dashed #333; margin: 12px 0;"></div>
            
            <!-- ===== PIE DE PÁGINA ===== -->
            <div style="text-align: center; font-size: 9px;">
                <p style="margin: 2px 0;">Cambios hasta 4 días hábiles</p>
                <p style="margin: 2px 0;">Conserve este ticket para aclaraciones</p>
                <div style="margin: 12px 0 5px 0;">
                    <span style="font-size: 13px; font-weight: bold;">¡GRACIAS POR SU COMPRA!</span>
                </div>
            </div>
        </div>
    `;

    // ===========================================
    // 3. CREAR IFRAME PARA IMPRESIÓN
    // ===========================================
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = ANCHO_TICKET;
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Ticket Creaciones Madriz</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                @page { 
                    margin: 0; 
                    size: 58mm auto;
                }
                
                body { 
                    margin: 0; 
                    padding: 0;
                    background: white; 
                    display: flex; 
                    justify-content: center;
                    font-family: 'Courier New', Courier, monospace;
                }
                
                img {
                    max-width: 100%;
                    height: auto;
                }
                
                @media print {
                    body { padding: 0; }
                    .ticket-container { box-shadow: none; }
                }
            </style>
        </head>
        <body>
            ${ticketHTML}
            <script>
                window.onload = function() {
                    setTimeout(function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }, 300);
                };
            <\/script>
        </body>
        </html>
    `);
    iframeDoc.close();

    // Limpieza
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 5000);
  },

  // Método auxiliar para obtener estilos
  obtenerEstilosTicket() {
    // Puedes copiar aquí los estilos de ticket.css como string
    return `
        .ticket-container {
            width: 250px;
            padding: 10px;
            font-family: 'Courier New', Courier, monospace;
            color: #000;
        }
        .ticket-header { text-align: center; font-size: 11px; }
        .ticket-header strong { font-size: 14px; }
        .separador { border-top: 1px dashed #000; margin: 10px 0; }
        .ticket-tabla { width: 100%; font-size: 11px; border-collapse: collapse; }
        .ticket-tabla th { border-bottom: 1px solid #000; text-align: left; }
        .ticket-tabla td { padding: 3px 0; }
        .ticket-totales { font-size: 12px; }
        .fila-total { display: flex; justify-content: space-between; margin-bottom: 3px; }
        .total-negrita { font-weight: bold; font-size: 14px; border-top: 1px double #000; padding-top: 5px; }
        .ticket-footer { text-align: center; font-size: 10px; margin-top: 15px; }
    `;
  },

  formatearFechaTicket(fecha) {
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();

    let horas = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const ampm = horas >= 12 ? "PM" : "AM";

    horas = horas % 12;
    horas = horas ? horas : 12; // el número 0 se convierte en 12

    return `${dia}/${mes}/${anio} - ${horas}:${minutos} ${ampm}`;
  },

  // MÉTODO NUEVO - Convertir imagen local a Base64
  async convertirImagenABase64(ruta) {
    try {
      const response = await fetch(ruta);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Error cargando logo:", error);
      return null;
    }
  },

};

window.PosManager = PosManager;
// Al final de tu archivo pos.js, asegúrate de que el init se llame así:
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Cargado, iniciando PosManager...");
  PosManager.init();

  // Refuerzo: Vincular el botón manualmente por si el setEventListeners falló
  const btnFinalizar = document.getElementById("finalizarCompraBtn");
  if (btnFinalizar) {
    console.log("Botón Finalizar encontrado y vinculado.");
    btnFinalizar.onclick = () => {
      PosManager.finalizarCompra();
    };
  } else {
    console.error("ERROR: No se encontró el botón con ID 'finalizarCompraBtn'");
  }
});
