document.addEventListener('DOMContentLoaded', () => {
    // 1. Obtiene el elemento donde se mostrará la fecha
    const dateElement = document.getElementById('currentDate');

    if (dateElement) {
        
        // 2. Función para obtener y formatear la fecha
        function updateDateTime() {
            const now = new Date();
            
            // Opciones para el formato de la fecha
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            // Opciones para el formato de la hora (opcional, si también la quieres)
            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true // Para formato AM/PM
            };

            // Formatea la fecha, por ejemplo: "jueves, 25 de septiembre de 2025"
            const formattedDate = now.toLocaleDateString('es-ES', options);
            
            // Formatea la hora, por ejemplo: "03:20:00 p.m."
            const formattedTime = now.toLocaleTimeString('es-ES', timeOptions);

            // Combina la fecha y la hora para mostrar
            // Si solo quieres la fecha (como en tu HTML):
            // dateElement.textContent = formattedDate; 
            
            // Si quieres FECHA y HORA:
            dateElement.textContent = `${formattedDate} - ${formattedTime}`;
        }

        // 3. Llama a la función inmediatamente al cargar
        updateDateTime();

        // 4. (Opcional) Actualiza la hora cada segundo para que esté siempre al día
         setInterval(updateDateTime, 1000); 
    }
});