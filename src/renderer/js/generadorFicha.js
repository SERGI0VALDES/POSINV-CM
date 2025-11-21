// generadorFicha.js - VERSIÓN DEFINITIVA COMPLETA
const TEMPLATE_MAPPINGS = {
    nombre: 'nombre', edad: 'edad', sexo: 'sexo',
    fechaPedido: 'fechaPedido', fechaPrueba: 'fechaPrueba', fechaEntrega: 'fechaEntrega',
    anchoEspalda: 'anchoEspalda', largoTalleFrente: 'largoTalleFrente', largoTalleEspalda: 'largoTalleEspalda',
    largoTotal: 'largoTotal', busto: 'busto', cintura: 'cintura', cadera: 'cadera',
    hombro: 'hombro', escote: 'escote', tirante: 'tirante', largoManga: 'largoManga',
    puno: 'puno', largoFalda: 'largoFalda', largoExterior: 'largoExterior',
    largoInterior: 'largoInterior', bastilla: 'bastilla', rodilla: 'rodilla',
    anotaciones: 'anotaciones',
};

// ✅ FUNCIÓN PARA RECOLECTAR DATOS DEL FORMULARIO
function recolectarDatos(form) {
    console.log('📊 [RENDERER] Recolectando datos del formulario...');
    const data = {};
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.name && input.name in TEMPLATE_MAPPINGS) {
            data[input.name] = input.value || '';
        }
    });
    
    console.log('📋 [RENDERER] Datos recolectados:', data);
    return data;
}

// ✅ FUNCIÓN PARA GENERAR Y GUARDAR FICHA DOCX
async function generarYGuardarFicha(formData) {
    console.log('🔧 [RENDERER] Iniciando generación de ficha DOCX...');
    
    if (!window.electronAPI || typeof window.electronAPI.generarFicha !== 'function') {
        alert('❌ Error: API de Electron no disponible');
        return;
    }

    if (!formData.nombre.trim() || !formData.fechaPedido) {
        alert("⚠️ Nombre y fecha de pedido son obligatorios.");
        return;
    }

    try {
        console.log('📤 [RENDERER] Enviando datos al proceso principal...');
        
        const resultado = await window.electronAPI.generarFicha(formData);
        
        console.log('📥 [RENDERER] Resultado recibido:', resultado);
        
        if (resultado.success) {
            alert('✅ Ficha guardada correctamente!');
            document.getElementById('formularioFicha').reset();
        } else {
            alert('❌ Error al guardar ficha: ' + resultado.error);
        }
    } catch (error) {
        console.error('💥 [RENDERER] Error inesperado:', error);
        alert('💥 Error inesperado: ' + error.message);
    }
}

// ✅ FUNCIÓN PARA IMPRIMIR FORMULARIO ACTUAL
function imprimirFormularioActual() {
    console.log('🖨️ [RENDERER] Preparando impresión del formulario...');
    
    const form = document.getElementById('formularioFicha');
    if (!form) {
        alert('❌ No se encontró el formulario para imprimir');
        return;
    }

    // Validar que haya datos antes de imprimir
    const datos = recolectarDatos(form);
    if (!datos.nombre && !datos.fechaPedido) {
        if (!confirm('⚠️ El formulario está vacío. ¿Deseas imprimirlo de todas formas?')) {
            return;
        }
    }

    // Crear una ventana de impresión
    const ventanaImpresion = window.open('', '_blank', 'width=800,height=600');
    
    if (!ventanaImpresion) {
        alert('❌ No se pudo abrir la ventana de impresión. Verifica los bloqueadores de ventanas emergentes.');
        return;
    }

    // Contenido HTML para imprimir
    ventanaImpresion.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Formulario de Cliente - Creaciones Madriz</title>
            <style>
                body { 
                    font-family: 'Arial', sans-serif; 
                    margin: 20px; 
                    color: #333;
                    line-height: 1.4;
                }
                .header { 
                    text-align: center; 
                    margin-bottom: 30px;
                    border-bottom: 2px solid #2c3e50;
                    padding-bottom: 15px;
                }
                .header h1 {
                    color: #2c3e50;
                    margin: 0;
                    font-size: 24px;
                }
                .header h2 {
                    color: #34495e;
                    margin: 5px 0;
                    font-size: 18px;
                }
                .header p {
                    color: #7f8c8d;
                    margin: 0;
                    font-size: 14px;
                }
                .section { 
                    margin-bottom: 25px; 
                    page-break-inside: avoid;
                }
                .section-title { 
                    font-weight: bold; 
                    color: #2c3e50; 
                    margin-bottom: 12px;
                    font-size: 16px;
                    border-left: 4px solid #3498db;
                    padding-left: 10px;
                }
                .data-grid { 
                    display: grid; 
                    grid-template-columns: 1fr 1fr; 
                    gap: 12px; 
                }
                .data-item { 
                    margin-bottom: 8px; 
                    padding: 5px 0;
                }
                .data-label { 
                    font-weight: bold; 
                    color: #555;
                    display: inline-block;
                    width: 160px;
                }
                .medidas-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 10px;
                    margin-top: 10px;
                }
                .medida-item {
                    padding: 8px;
                    border-left: 3px solid #3498db;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
                .medida-label {
                    font-size: 12px;
                    color: #666;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .medida-value {
                    font-weight: bold;
                    font-size: 14px;
                }
                .anotaciones {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 6px;
                    padding: 15px;
                    margin-top: 10px;
                }
                .empty-value {
                    color: #999;
                    font-style: italic;
                }
                @media print {
                    body { margin: 0.5in; }
                    .no-print { display: none; }
                    .section { margin-bottom: 20px; }
                }
                @page {
                    margin: 0.5in;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>CREACIONES MADRIZ</h1>
                <h2>Ficha Técnica del Cliente</h2>
                <p>Generado: ${new Date().toLocaleString('es-ES')}</p>
            </div>
            ${formularioParaImprimir(datos)}
        </body>
        </html>
    `);
    
    ventanaImpresion.document.close();
    
    // Esperar a que cargue y luego imprimir
    ventanaImpresion.onload = function() {
        setTimeout(() => {
            console.log('🖨️ [RENDERER] Ejecutando impresión...');
            ventanaImpresion.print();
            // Opcional: cerrar después de imprimir
            // ventanaImpresion.close();
        }, 500);
    };
}

// ✅ FUNCIÓN PARA GENERAR HTML DEL FORMULARIO PARA IMPRIMIR
function formularioParaImprimir(datos) {
    return `
        <div class="section">
            <div class="section-title">DATOS DEL CLIENTE</div>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Nombre:</span> 
                    ${datos.nombre || '<span class="empty-value">No especificado</span>'}
                </div>
                <div class="data-item">
                    <span class="data-label">Edad:</span> 
                    ${datos.edad || '<span class="empty-value">No especificado</span>'}
                </div>
                <div class="data-item">
                    <span class="data-label">Sexo:</span> 
                    ${datos.sexo || '<span class="empty-value">No especificado</span>'}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">FECHAS DEL PEDIDO</div>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Fecha de Pedido:</span> 
                    ${datos.fechaPedido || '<span class="empty-value">No especificada</span>'}
                </div>
                <div class="data-item">
                    <span class="data-label">Fecha de Prueba:</span> 
                    ${datos.fechaPrueba || '<span class="empty-value">No especificada</span>'}
                </div>
                <div class="data-item">
                    <span class="data-label">Fecha de Entrega:</span> 
                    ${datos.fechaEntrega || '<span class="empty-value">No especificada</span>'}
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">MEDIDAS CORPORALES (cm)</div>
            <div class="medidas-grid">
                ${generarMedidasParaImprimir(datos)}
            </div>
        </div>

        ${datos.anotaciones ? `
        <div class="section">
            <div class="section-title">INFORMACIÓN ADICIONAL</div>
            <div class="anotaciones">
                ${datos.anotaciones.replace(/\n/g, '<br>')}
            </div>
        </div>
        ` : ''}
    `;
}

// ✅ FUNCIÓN PARA GENERAR LAS MEDIDAS EN FORMATO IMPRIMIBLE
function generarMedidasParaImprimir(datos) {
    const medidas = [
        { label: 'Ancho de Espalda', value: datos.anchoEspalda },
        { label: 'Largo Talle Frente', value: datos.largoTalleFrente },
        { label: 'Largo Talle Espalda', value: datos.largoTalleEspalda },
        { label: 'Largo Total', value: datos.largoTotal },
        { label: 'Busto', value: datos.busto },
        { label: 'Cintura', value: datos.cintura },
        { label: 'Cadera', value: datos.cadera },
        { label: 'Hombro', value: datos.hombro },
        { label: 'Escote', value: datos.escote },
        { label: 'Tirante', value: datos.tirante },
        { label: 'Largo de Manga', value: datos.largoManga },
        { label: 'Puño', value: datos.puno },
        { label: 'Largo Falda/Pantalón', value: datos.largoFalda },
        { label: 'Largo Exterior', value: datos.largoExterior },
        { label: 'Largo Interior', value: datos.largoInterior },
        { label: 'Bastilla', value: datos.bastilla },
        { label: 'Rodilla', value: datos.rodilla },
    ];

    return medidas.map(medida => `
        <div class="medida-item">
            <div class="medida-label">${medida.label}</div>
            <div class="medida-value">
                ${medida.value ? medida.value + ' cm' : '<span class="empty-value">No tomada</span>'}
            </div>
        </div>
    `).join('');
}

// ✅ FUNCIÓN PARA ABRIR CARPETA DE FICHAS
async function abrirCarpetaFichas() {
    console.log('📁 [RENDERER] Solicitando abrir carpeta de fichas...');
    
    if (window.electronAPI && typeof window.electronAPI.abrirCarpeta === 'function') {
        try {
            await window.electronAPI.abrirCarpeta('D:\\fichas');
            console.log('✅ [RENDERER] Carpeta abierta exitosamente');
        } catch (error) {
            console.error('❌ [RENDERER] Error al abrir carpeta:', error);
            alert('❌ Error al abrir carpeta: ' + error.message);
        }
    } else {
        alert('❌ API no disponible para abrir carpeta');
    }
}

/** ✅ FUNCIÓN PARA LIMPIAR FORMULARIO
function limpiarFormulario() {
    console.log('🧹 [RENDERER] Limpiando formulario...');
    const form = document.getElementById('formularioFicha');
    if (form) {
        form.reset();
        alert('✅ Formulario limpiado correctamente');
    } else {
        alert('❌ No se encontró el formulario');
    }
}*/

// ✅ FUNCIÓN PARA PROBAR CONEXIÓN CON ELECTRON
async function probarConexionElectron() {
    console.log('🏓 [RENDERER] Probando conexión con Electron...');
    
    if (window.electronAPI && typeof window.electronAPI.ping === 'function') {
        try {
            const response = await window.electronAPI.ping();
            console.log('✅ [RENDERER] Conexión exitosa:', response);
            return true;
        } catch (error) {
            console.error('❌ [RENDERER] Error de conexión:', error);
            return false;
        }
    } else {
        console.error('❌ [RENDERER] API de Electron no disponible');
        return false;
    }
}

// ✅ INICIALIZACIÓN Y EVENT LISTENERS
document.addEventListener('DOMContentLoaded', function() {

    // console.log('📄 [RENDERER] DOM cargado - Inicializando generadorFicha.js');
    
    // Obtener referencias a los elementos
    const form = document.getElementById('formularioFicha'); 
    const openFolderBtn = document.getElementById('openFolderFichas');
    const imprimirBtn = document.getElementById('imprimirFormulario');
    const guardarBtn = document.getElementById('guardarFicha');

    /** Log de elementos encontrados
    console.log('🔍 [RENDERER] Elementos encontrados:');
    console.log('  - Formulario:', !!form);
    console.log('  - Botón Abrir Carpeta:', !!openFolderBtn);
    console.log('  - Botón Imprimir:', !!imprimirBtn);
    console.log('  - Botón Guardar:', !!guardarBtn);*/

    /**  ✅ 1. Probar conexión con Electron
    probarConexionElectron().then(conexionExitosa => {
        if (conexionExitosa) {
            console.log('✅ [RENDERER] Aplicación lista para usar');
        } else {
            console.error('❌ [RENDERER] Problemas de conexión con Electron');
            alert('⚠️ Hay problemas de conexión. Algunas funciones pueden no estar disponibles.');
        }
    });
    */

    // ✅ 2. Event Listener para GUARDAR FICHA (form submit)
    if (form) {
        form.addEventListener('submit', function(event) {
            console.log('🖱️ [RENDERER] Formulario enviado - Guardando ficha...');
            event.preventDefault();
            const formData = recolectarDatos(form);
            generarYGuardarFicha(formData);
        });
    } else {
        console.error('❌ No se encontró el formulario con ID "formularioFicha"');
    }

    // ✅ 3. Event Listener para IMPRIMIR FORMULARIO
    if (imprimirBtn) {
        imprimirBtn.addEventListener('click', imprimirFormularioActual);
        // console.log('✅ Event listener de IMPRIMIR conectado');
    } else {
        console.error('❌ No se encontró el botón de imprimir con ID "imprimirFormulario"');
    }

    // ✅ 4. Event Listener para ABRIR CARPETA
    if (openFolderBtn) {
        openFolderBtn.addEventListener('click', abrirCarpetaFichas);
        // console.log('✅ Event listener de ABRIR CARPETA conectado');
    } else {
        console.error('❌ No se encontró el botón de abrir carpeta con ID "openFolderFichas"');
    }

    // console.log('🎯 [RENDERER] Inicialización completada - Todos los event listeners conectados');
});

// ✅ Exportar funciones para uso global (si es necesario)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        recolectarDatos,
        generarYGuardarFicha,
        imprimirFormularioActual,
        abrirCarpetaFichas,
        limpiarFormulario,
        probarConexionElectron
    };
}