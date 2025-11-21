### feat: Nueva funcionalidad
### fix: Corrección de error
### refactor: Refactorización de código
### docs: Actualización de documentación

Flujo de Trabajo Resumido ->

# 1. Obtener la última versión
git pull origin main

# 2. Realizar tus cambios...

# 3. Preparar los archivos para el commit
git add .

# 4. Guardar los cambios localmente
git commit -m "feat: Descripción de mis cambios aquí."

# 5. Enviar los cambios al repositorio remoto
git push origin main

# CSS (Cambios, desarrollo, avances, notas, etc)
Cada pantalla ncesita estilos unicos, de hecho, algunas no necesitan el scroll. Se opto por diseñar un .css global donde manejaremos los estilos que si o si se repiten en toda la aplicación por ej. la barra de arriba (topbar) que contiene el logo y botones, :root que contiene información de colores fijos, la animación de entrada cuando cambias a diferentes screens, fuentes (fonts) e información del usuario(info-user, h2).

Uso de varias apis de electron para meanejo de archivos externos y escritura de archivos .txt, cambios en => generadorFichas.js, abrir_folder.js, main.js y preload.js