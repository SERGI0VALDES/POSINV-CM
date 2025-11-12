// generadorFicha.js - CON MEJOR DEBUGGING
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

// Función para recolectar datos del formulario
function recolectarDatos(form) {
    console.log('Recolectando datos del formulario...');
    // data es un objeto que almacenará los datos del formulario
    const data = {};
    // inputs obtiene todos los elementos input, select y textarea del formulario
    const inputs = form.querySelectorAll('input, select, textarea');
    // Recorremos cada input y asignamos su valor al objeto data según el mapeo
    inputs.forEach(input => {
        if (input.name && input.name in TEMPLATE_MAPPINGS) {
            data[input.name] = input.value || '';
        }
    });
    // Devolvemos el objeto data con los datos recolectados
    return data;
}

// Función para generar y guardar la ficha
async function generarYGuardarFicha(formData) {
    console.log('Generando ficha...');
    
    //  Verificación mejorada
    if (!window.electronAPI) {
        console.error('electronAPI no existe en window');
        alert("Error: La aplicación no está configurada correctamente. Recarga la ventana.");
        return;
    }
    
    if (typeof window.electronAPI.generarFicha !== 'function') {
        console.error('generarFicha no es una función', window.electronAPI);
        alert("Error: La API de generación no está disponible.");
        return;
    }

    console.log('API disponible! Procediendo a generar ficha...');

    // Validación mínima
    if (!formData.nombre.trim() || !formData.fechaPedido) {
        alert("Por favor, completa los siguientes datos: Nombre del cliente y la Fecha de pedido.");
        return;
    }

    try {
        console.log('Enviando datos al proceso principal...', formData);
        const resultado = await window.electronAPI.generarFicha(formData);
        console.log('Respuesta recibida:', resultado);
        
        if (resultado.success) {
            alert(`Ficha guardada correctamente`);
        } else {
            alert(`❌ Error: ${resultado.error}`);
        }
    } catch (error) {
        console.error('Error al generar ficha:', error);
        alert('Error inesperado al guardar la ficha');
    }
}

// Manejo del formulario
document.addEventListener('DOMContentLoaded', () => {

    console.log('JS cargado -> generadorFicha.js');
    
    // Los datos del formulario los tomamos del Id formularioFicha (id del formulario), los guardamos en la constante fomr
    const form = document.getElementById('formularioFicha'); 
    // ...Constante para el botón de abrir carpeta de fichas
    const openFolderBtn = document.getElementById('openFolderFichas');

    // Test de conexión con la API de Electron -> ping (debbugging)
    if (window.electronAPI && typeof window.electronAPI.ping === 'function') {
        window.electronAPI.ping().then(response => {
            console.log('✅ Conexión con Electron establecida:', response);
        }).catch(error => {
            console.error('❌ Error en conexión:', error);
        });
    }

    if (form) {
        // addEventListener escucha el evento submit del formulario
        // function(event) es la función que se ejecuta cuando se envía el formulario
        form.addEventListener('submit', function(event) {
            // event.preventDefault() evita que el formulario se envíe de la manera tradicional
            event.preventDefault();
            // Recolectar datos y generar ficha
            const formData = recolectarDatos(form);
            // generarYGuardarFicha es la función que maneja la generación y guardado de la ficha
            generarYGuardarFicha(formData);
        });
    }

    if (openFolderBtn) {
        openFolderBtn.addEventListener('click', async () => {
            if (window.electronAPI && typeof window.electronAPI.abrirCarpeta === 'function') {
                try {
                    await window.electronAPI.abrirCarpeta('D:\\fichas');
                } catch (error) {
                    alert('Error al abrir la carpeta');
                }
            } else {
                alert('API no disponible');
            }
        });
    }
});