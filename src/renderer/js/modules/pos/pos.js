const PosManager = {
  productos: [],
  carrito: [],
  total: 0,

  async init() {
    console.log("POS Inicializado");
    await this.cargarDB();
    this.setEventListeners();
    this.mostrarMensajeInicial();
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
    const totalUI = document.getElementById("totalPrecio");
    this.total = this.carrito.reduce(
      (acc, item) => acc + item.precio * item.cantidad,
      0,
    );
    if (totalUI) totalUI.innerText = `$${this.total.toFixed(2)}`;
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
        }),
      });

      if (response.ok) {
        // Esperar un pequeño delay artificial para que la animación se aprecie
        await new Promise((resolve) => setTimeout(resolve, 800));

        this.carrito = [];
        this.actualizarCarrito();
        await this.cargarDB();

        // Quitar el cargador antes del alert
        loader.remove();

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
