
export const SCREENS_PATHS = {
    // --- Pantallas Raíz (Directamente en /screens/) ---

    // necesitamos subir un nivel (../) para ir a la raíz /screens/
    DASHBOARD: '../dashboard.html', 
    LOGIN: '../login.html', 
    
    // --- Pantallas Administrativas (En /screens/administrativo/) ---
    
    // Desde /screens/dashboard.html, la ruta es screens/administrativo/fichas.html
    FICHA: './administrativo/fichas.html',
    REPORTES: './administrativo/reportes.html',
    
    // --- Pantallas de Inventario (En /screens/inventarios/) ---
    
    // Rutas desde la raíz /screens/
    INVENTARIOS: "./inventarios/inventario.html",
    TELAS: './inventarios/telas.html',
    VESTIDOS: './inventarios/vestidos.html',
    
    // --- Pantalla de Venta (En /screens/venta/) ---
    POS: './venta/pos.html',
};