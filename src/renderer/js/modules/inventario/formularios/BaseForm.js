import { BaseForm } from './BaseForm.js';
import { validarSKU, validarPrecio, validarStock } from '../utils/Validators.js';
import { templateVestido } from '../constants/formTemplates.js';

export class VestidoForm extends BaseForm {
  constructor() {
    super('vestidos', 'http://localhost:3000/vestidos');
  }

  procesarDatos(datos) {
    return {
      nombre: datos.nombre_producto?.trim(),
      codigoSku: datos.codigo_sku?.toUpperCase().trim(),
      descripcion: datos.descripcion?.trim() || "",
      stockActual: parseInt(datos.stock_actual) || 0,
      precioVenta: parseFloat(datos.precio_venta) || 0,
      color: datos.color,
      categoria: datos['categoria-vestido'],
      stockMinimo: 0,
    };
  }

  validar(datos) {
    const errores = [];

    if (!datos.codigoSku) {
      errores.push("El código SKU es requerido");
    } else if (!/^[A-Z0-9-]+$/.test(datos.codigoSku)) {
      errores.push("El código SKU solo puede contener letras mayúsculas, números y guiones");
    }

    if (!datos.categoria) errores.push("La categoría es requerida");
    if (!datos.nombre) errores.push("El nombre del vestido es requerido");
    if (!datos.color) errores.push("El color es requerido");
    
    errores.push(...validarStock(datos.stockActual));
    errores.push(...validarPrecio(datos.precioVenta));

    return errores;
  }

  generar(datos = {}) {
    return templateVestido(datos);
  }

  mapaCampos(asignar, datos) {
    const categoriaFormateada = datos.categoria
      ? datos.categoria.charAt(0).toUpperCase() + datos.categoria.slice(1).toLowerCase()
      : "";

    asignar("nombre_producto", datos.nombre);
    asignar("descripcion", datos.descripcion);
    asignar("stock_actual", datos.stockActual);
    asignar("precio_venta", datos.precioVenta);
    asignar("codigo_sku", datos.codigoSku);
    asignar("color", datos.color);
    asignar("categoria-vestido", categoriaFormateada);
  }
}