// Variables globales extendidas
let dashboardData = {
  cantidad: 0,
  total: 0,
  vestidos: 0,
  telas: 0,
  terminados: 0,
};

async function actualizarDashboard() {
  try {
    // --- 1. REFERENCIAS A ELEMENTOS ---
    const elConteo = document.getElementById("conteoVentas");
    const elMonto = document.getElementById("montoTotalDia");
    const elVestidos = document.getElementById("dash-vestidos");
    const elTelas = document.getElementById("dash-telas");
    const elTerminados = document.getElementById("dash-terminados");

    // VERIFICAR QUE LOS ELEMENTOS EXISTEN
    console.log("Elementos DOM:", {
      elConteo,
      elMonto,
      elVestidos,
      elTelas,
      elTerminados,
    });

    // --- 2. LLAMADAS SIMULTÁNEAS ---
    const [resVentas, resInv] = await Promise.all([
      fetch("http://localhost:3000/ventas/dashboard/resumen-hoy"),
      fetch("http://localhost:3000/inventario/resumen-dashboard"),
    ]);

    // VERIFICAR RESPUESTAS
    console.log("Status Ventas:", resVentas.status);
    console.log("Status Inventario:", resInv.status);

    if (!resVentas.ok) {
      const errorText = await resVentas.text();
      throw new Error(`Ventas: ${resVentas.status} - ${errorText}`);
    }

    if (!resInv.ok) {
      const errorText = await resInv.text();
      throw new Error(`Inventario: ${resInv.status} - ${errorText}`);
    }

    const dataVentas = await resVentas.json();
    const dataInv = await resInv.json();

    // VERIFICAR DATOS RECIBIDOS
    console.log("Datos Ventas:", dataVentas);
    console.log("Datos Inventario:", dataInv);

    // Actualizar variable global
    dashboardData = {
      ...dashboardData,
      ...dataVentas,
      ...dataInv,
    };

    // --- 3. ACTUALIZAR UI CON VALIDACIONES EXTREMAS ---
    if (elConteo) {
      const cantidad = dataVentas?.cantidad ?? 0;
      elConteo.textContent = `${cantidad} ${cantidad === 1 ? "venta" : "ventas"}`;
    }

    if (elMonto) {
      const total = dataVentas?.total ?? 0;
      elMonto.textContent = `$${Number(total).toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    // --- 4. ACTUALIZAR INVENTARIO CON VALORES POR DEFECTO ---
    if (elVestidos) {
      const vestidos = dataInv?.vestidos ?? 0;
      elVestidos.textContent = vestidos;
    }

    if (elTelas) {
      const tipos = dataInv.telas;
      const rollos = dataInv.totalRollos;
      elTelas.innerHTML = `${tipos} <small style="font-size: 0.5em;">tipos</small> | ${rollos} <small style="font-size: 0.5em;">rollos</small>`;
    }
    if (elTerminados) {
      const terminados = dataInv?.terminados ?? 0;
      elTerminados.textContent = terminados;
    }
  } catch (error) {
    console.error("Error en dashboard:", error);

    // Mostrar errores específicos en cada card
    const elementos = {
      conteoVentas: "Cargando...",
      montoTotalDia: "$Cargando...",
      "dash-vestidos": "Cargando...",
      "dash-telas": "Cargando...",
      "dash-terminados": "Cargando...",
    };

    for (const [id, valor] of Object.entries(elementos)) {
      const el = document.getElementById(id);
      if (el) el.textContent = valor;
    }
  }
}

// Inicialización
async function initDashboard() {
  // Esperar a que el DOM cargue
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(actualizarDashboard, 300);
    });
  } else {
    setTimeout(actualizarDashboard, 300);
  }
}

// Este código debe estar en la carga inicial de la aplicación
async function verificarAlertasSistema() {
    try {
        const resp = await fetch('http://localhost:3000/reportes/pendientes');
        const pendientes = await resp.json();

        if (pendientes.length > 0) {
            // Usamos SweetAlert2 o un confirm normal
            const corte = pendientes[0]; 
            if (confirm(`Aviso: Existe un corte de caja pendiente del día ${corte.fecha}. ¿Deseas imprimirlo ahora?`)) {
                
                // 1. Abrir el PDF o mandar a imprimir el ticket
                window.open(`http://localhost:3000/reportes/descargar/${corte.nombreArchivo}`, '_blank');
                
                // 2. Avisar al server que ya se atendió para que no moleste más
                await fetch(`http://localhost:3000/reportes/marcar-impreso/${corte.idCierre}`);
            }
        }
    } catch (e) {
        console.error("Error al revisar reportes", e);
    }
}

document.addEventListener('DOMContentLoaded', verificarAlertasSistema);

initDashboard();
setInterval(actualizarDashboard, 60000);
