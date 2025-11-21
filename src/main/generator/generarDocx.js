// ✅ FORMA CORRECTA para Electron
const docx = require('docx');

// Extraer todas las clases del módulo docx
const { 
    Document, 
    Paragraph, 
    Table, 
    TableCell, 
    TableRow, 
    TextRun, 
    HeadingLevel, 
    AlignmentType, 
    WidthType, 
    BorderStyle 
} = docx;

class GeneradorFichaDocx {
    static async generarFicha(datosFicha) {
        try {
            // Definimos estilos de fuente por defecto (Calibri, 11pt)
            const defaultStyles = {
                paragraphStyles: [
                    {
                        id: "Normal",
                        name: "Normal",
                        run: {
                            font: "Calibri",
                            size: 22, // 11pt
                            color: "333333", // Gris oscuro para mejor contraste
                        },
                    },
                    {
                        id: "Heading1",
                        name: "Heading 1",
                        basedOn: "Normal",
                        next: "Normal",
                        run: {
                            size: 32, // 16pt
                            bold: true,
                            color: "5B21B6", // Color morado/índigo para títulos
                        },
                        paragraph: {
                            spacing: { before: 200, after: 300 },
                        },
                    },
                    {
                        id: "Heading2",
                        name: "Heading 2",
                        basedOn: "Normal",
                        next: "Normal",
                        run: {
                            size: 28, // 14pt
                            bold: true,
                            color: "5B21B6", // Color morado/índigo para subtítulos
                        },
                        paragraph: {
                            spacing: { before: 400, after: 200 },
                            border: {
                                bottom: { style: BorderStyle.SINGLE, size: 6, color: "5B21B6" },
                            }
                        },
                    },
                ],
            };

            const doc = new Document({
                styles: defaultStyles, // Aplicamos los nuevos estilos
                sections: [{
                    properties: {},
                    children: [
                        // Título principal (Usando un estilo customizado)
                        new Paragraph({
                            text: "CREACIONES MADRIZ",
                            heading: HeadingLevel.TITLE,
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                            run: { color: "F9F8FD" }
                        }),
                        
                        new Paragraph({
                            text: "Ficha Técnica del Cliente",
                            heading: HeadingLevel.HEADING_1, // Usa el nuevo estilo H1
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 600 },
                        }),

                        // Datos del cliente
                        new Paragraph({
                            text: "DATOS DEL CLIENTE",
                            heading: HeadingLevel.HEADING_2, // Usa el nuevo estilo H2
                        }),

                        // Tabla de datos del cliente
                        this.crearTablaDatosCliente(datosFicha),

                        // Fechas
                        new Paragraph({
                            text: "FECHAS DEL PEDIDO",
                            heading: HeadingLevel.HEADING_2, // Usa el nuevo estilo H2
                        }),

                        this.crearTablaFechas(datosFicha),

                        // Medidas
                        new Paragraph({
                            text: "MEDIDAS CORPORALES (cm)",
                            heading: HeadingLevel.HEADING_2, // Usa el nuevo estilo H2
                        }),

                        this.crearTablaMedidas(datosFicha),

                        // Anotaciones si existen
                        ...this.crearSeccionAnotaciones(datosFicha.anotaciones),

                        // Pie de página
                        this.crearPieDePagina(),
                    ],
                }],
            });

            // ✅ CAMBIO IMPORTANTE: Usar docx.Packer en lugar de Packer directamente
            const buffer = await docx.Packer.toBuffer(doc);
            return buffer;

        } catch (error) {
            throw new Error(`Error al generar documento: ${error.message}`);
        }
    }

    // Estilos de celda para las etiquetas (fondo gris)
    static estiloCeldaEtiqueta(text) {
        return new TableCell({
            children: [
                new Paragraph({ 
                    text: text, 
                    alignment: AlignmentType.LEFT,
                    run: { bold: true, color: "444444" } // Etiqueta en negrita
                })
            ],
            shading: { fill: "F8F9FA" }, // Fondo gris muy claro
            borders: this.estilosBordesCeldaSuave(),
            width: { size: 30, type: WidthType.PERCENTAGE }, // 30% del ancho para etiquetas
        });
    }

    // Estilos de celda para los valores (fondo blanco)
    static estiloCeldaValor(text) {
        return new TableCell({
            children: [
                new Paragraph({ 
                    text: text || "N/A", 
                    alignment: AlignmentType.LEFT,
                    run: { color: "333333" }
                })
            ],
            borders: this.estilosBordesCeldaSuave(),
            width: { size: 70, type: WidthType.PERCENTAGE }, // 70% del ancho para valores
        });
    }
    
    // Bordes de tabla sutiles
    static estilosBordesCeldaSuave() {
        return {
            top: { style: BorderStyle.SINGLE, size: 4, color: "E0E0E0" },
            bottom: { style: BorderStyle.SINGLE, size: 4, color: "E0E0E0" },
            left: { style: BorderStyle.SINGLE, size: 4, color: "E0E0E0" },
            right: { style: BorderStyle.SINGLE, size: 4, color: "E0E0E0" },
        };
    }
    
    static estilosBordesTabla() {
        return {
             top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
             bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
             left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
             right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        };
    }
    // -----------------------------------------------------------

    static crearTablaDatosCliente(datos) {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100 },
            borders: this.estilosBordesTabla(), // Usamos borders: NONE
            rows: [
                new TableRow({
                    children: [
                        this.estiloCeldaEtiqueta("Nombre del Cliente"),
                        this.estiloCeldaValor(datos.nombre || "No especificado"),
                    ],
                }),
                new TableRow({
                    children: [
                        this.estiloCeldaEtiqueta("Edad"),
                        this.estiloCeldaValor(datos.edad || "No especificado"),
                    ],
                }),
                new TableRow({
                    children: [
                        this.estiloCeldaEtiqueta("Sexo"),
                        this.estiloCeldaValor(datos.sexo || "No especificado"),
                    ],
                }),
            ],
        });
    }

    static crearTablaFechas(datos) {
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            margins: { top: 100, bottom: 100 },
            borders: this.estilosBordesTabla(), // Usamos borders: NONE
            rows: [
                new TableRow({
                    children: [
                        this.estiloCeldaEtiqueta("Fecha de Pedido"),
                        this.estiloCeldaValor(datos.fechaPedido || "No especificada"),
                    ],
                }),
                new TableRow({
                    children: [
                        this.estiloCeldaEtiqueta("Fecha de Prueba"),
                        this.estiloCeldaValor(datos.fechaPrueba || "No especificada"),
                    ],
                }),
                new TableRow({
                    children: [
                        this.estiloCeldaEtiqueta("Fecha de Entrega"),
                        this.estiloCeldaValor(datos.fechaEntrega || "No especificada"),
                    ],
                }),
            ],
        });
    }

    static crearTablaMedidas(datos) {
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

        const rows = [];
        
        // Creamos una cabecera para la tabla de medidas (con fondo sólido)
        rows.push(new TableRow({
            children: [
                new TableCell({
                    children: [new Paragraph({ text: "MEDIDA", run: { color: "FFFFFF", bold: true } })],
                    shading: { fill: "5B21B6" }, // Color Morado/Índigo
                    borders: this.estilosBordesCeldaSuave(),
                }),
                new TableCell({
                    children: [new Paragraph({ text: "VALOR (cm)", run: { color: "FFFFFF", bold: true } })],
                    shading: { fill: "5B21B6" }, // Color Morado/Índigo
                    borders: this.estilosBordesCeldaSuave(),
                }),
            ],
        }));

        // Agrupamos en filas de una sola columna para la vista compacta y limpia
        medidas.forEach((medida, index) => {
            rows.push(new TableRow({
                children: [
                    this.estiloCeldaEtiqueta(medida.label), // Etiqueta
                    this.estiloCeldaValor(medida.value ? `${medida.value} cm` : "No tomada"), // Valor
                ],
                // Sombreado alternado (Morado claro)
                shading: index % 2 === 0 ? { fill: "F9F8FD" } : undefined,
            }));
        });

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            columnWidths: [5000, 5000], // Columnas iguales
            borders: this.estilosBordesTabla(),
            rows,
        });
    }

    static crearSeccionAnotaciones(anotaciones) {
        if (!anotaciones || anotaciones.trim() === '') return [new Paragraph({})];

        return [
            new Paragraph({ text: "", spacing: { after: 400 } }),
            new Paragraph({
                text: "INFORMACIÓN ADICIONAL",
                heading: HeadingLevel.HEADING_2,
            }),
            new Paragraph({
                children: [
                    new TextRun({
                        text: anotaciones,
                        color: "333333",
                    }),
                ],
                // Box con bordes y sombreado para que se destaque
                border: {
                    top: { style: BorderStyle.THICK, size: 12, color: "007ACC" },
                    bottom: { style: BorderStyle.THICK, size: 12, color: "007ACC" },
                    left: { style: BorderStyle.THICK, size: 12, color: "007ACC" },
                    right: { style: BorderStyle.THICK, size: 12, color: "007ACC" },
                },
                shading: { fill: "E6F0F8" }, // Azul muy suave
                spacing: { before: 300, after: 300, line: 360 }, // Espaciado cómodo
                indentation: { left: 200, right: 200 },
            }),
        ];
    }

    static crearPieDePagina() {
        return new Paragraph({
            children: [
                new TextRun({
                    text: `Ficha generada el ${new Date().toLocaleDateString('es-ES', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}.`,
                    color: "666666",
                    italics: true,
                    size: 18, // 9pt
                }),
                new TextRun({
                    text: `\n\n© Creaciones Madriz`,
                    color: "5B21B6",
                    size: 18, // 9pt
                    bold: true,
                }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 800 },
        });
    }

    // Eliminamos la función de bordes genéricos y usamos los específicos para celda/tabla
}

module.exports = GeneradorFichaDocx;