const { text } = require("express");
const userServices = require("../services/userServices");
const AIService = require("./aiService");
const services = new userServices();
const aiService = new AIService();

const style = {
    h1: {
        fontSize: 22,
        bold: true,
        margin: [0, 10, 0, 15],
        alignment: 'center'
    },
    span: {
        fontSize: 14,
        margin: [0, 3, 0, 5],
    },
    sectionHeader: {
        fontSize: 16,
        bold: true,
        margin: [0, 15, 0, 15]
    },
    footer: {
        fontSize: 10,
        alignment: 'center',
        margin: [0, 20, 0, 0]
    }
}

const extraerObjetivos = (objetivos) => {

    if (!Array.isArray(objetivos)) return [];

    return objetivos.map(obj => {
        const { descripcion, estado_actual, fecha_inicio, fecha_fin  } = obj;

        const periodoComppleto= `${formatearFecha(fecha_inicio)} - ${formatearFecha(fecha_fin)}`
        return { descripcion, estado_actual, periodoComppleto};
    });
}

const extraerClaves = (responses) => {
    if (!responses || typeof responses !== 'object') {
        console.log('Respuestas inválidas para extraer claves:', responses);
        return ["No hay preguntas registradas"];
    }
    
    // Obtener las claves (preguntas) como array
    return Object.keys(responses);
}

const extraerRespuestas = (responses) => {
    if (!responses || typeof responses !== 'object') {
        console.log('Respuestas inválidas para extraer valores:', responses);
        return ["No hay respuestas registradas"];
    }
    
    // Obtener los valores (respuestas) como array
    return Object.values(responses);
}

const validarComentarios = (comentario) => {

    if (!comentario) return "No hay comentarios";

    return comentario
}

const buscarUsuario = async (id_usuario) => {

    const user = await services.getByid(id_usuario)
    if (!user) return null;

    const { ci, nombre, apellido} = user;
    const nombreFinal = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();
    const apellidoFinal = apellido.charAt(0).toUpperCase() + apellido.slice(1).toLowerCase();
    const ciFormateado = ci.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return {
        ciFormateado,
        nombreFinal,
        apellidoFinal,
    }
}

const formatearFecha = (fecha) => {
    if (!fecha){
        const hoy = new Date();
        const dia = String(hoy.getDate()).padStart(2, '0');
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const year = hoy.getFullYear();
        return `${dia}/${mes}/${year}`;
    };

    const fechaObj = new Date(fecha);
    const dia = String(fechaObj.getDate() + 1).padStart(2, '0');
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const year = fechaObj.getFullYear();
    return `${dia}/${mes}/${year}`;
}

/**
 * Convierte texto con formato Markdown a texto plano
 * @param {string} markdownText - Texto en formato Markdown
 * @returns {string} - Texto plano sin formatos Markdown
 */
const convertirMarkdownATexto = (markdownText) => {
    if (!markdownText) return "";
    
    // Convertir a string si no lo es
    const texto = String(markdownText);
    
    return texto
        // Eliminar encabezados (#, ##, ###)
        .replace(/#+\s+/g, '')
        // Eliminar énfasis (*texto* o _texto_)
        .replace(/[\*_]{1,2}([^\*_]+)[\*_]{1,2}/g, '$1')
        // Eliminar código inline (`texto`)
        .replace(/`([^`]+)`/g, '$1')
        // Eliminar bloques de código (```)
        .replace(/```[\s\S]*?```/g, '')
        // Eliminar links [texto](url)
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Mantener listas con viñetas
        .replace(/^[\*-]\s+/gm, '- ')
        // Mantener listas numeradas
        .replace(/^(\d+)\.\s+/gm, '$1. ')
        // Convertir <br> a saltos de línea
        .replace(/<br>/gi, '\n');
}

/**
 * Convierte una tabla Markdown a formato pdfmake
 * @param {string} tablaMd - Texto de la tabla en formato Markdown
 * @returns {Object} Objeto de tabla para pdfmake o null si no es una tabla válida
 */
const convertirTablaAPdfmake = (tablaMd) => {
    if (!tablaMd) return null;
    
    try {
        // Dividir en líneas y eliminar líneas vacías
        const lineas = tablaMd.split('\n').filter(line => line.trim() !== '');
        
        // Una tabla debe tener al menos 3 líneas (encabezado, separador y una fila)
        if (lineas.length < 3) return null;
        
        // Verificar que las líneas tengan formato de tabla
        const esTabla = lineas[0].trim().startsWith('|') && 
                      lineas[0].trim().endsWith('|') && 
                      lineas[1].trim().startsWith('|') && 
                      lineas[1].includes('-');
                      
        if (!esTabla) return null;
        
        // Extraer encabezados (primera línea)
        const encabezados = lineas[0].split('|')
            .filter(celda => celda.trim() !== '')
            .map(celda => {
                // Limpiar Markdown del encabezado
                return convertirMarkdownATexto(celda.trim());
            });
            
        // Extraer filas (a partir de la tercera línea)
        const filas = [];
        for (let i = 2; i < lineas.length; i++) {
            if (lineas[i].includes('|')) {
                const celdas = lineas[i].split('|')
                    .filter(celda => celda.trim() !== '')
                    .map(celda => {
                        // Limpiar Markdown del contenido de las celdas
                        return convertirMarkdownATexto(celda.trim());
                    });
                
                if (celdas.length > 0) {
                    filas.push(celdas);
                }
            }
        }
        
        // Crear tabla para pdfmake
        return {
            layout: 'lightHorizontalLines',
            table: {
                headerRows: 1,
                widths: Array(encabezados.length).fill('*'),
                body: [
                    // Encabezados en mayúsculas y centrados
                    encabezados.map(h => ({ 
                        text: h.toUpperCase(), 
                        alignment: 'center', 
                        bold: true 
                    })),
                    // Filas con contenido centrado
                    ...filas.map(fila => 
                        fila.map(celda => ({ 
                            text: celda, 
                            alignment: 'center' 
                        }))
                    )
                ]
            },
            margin: [0, 10, 0, 15]
        };
    } catch (error) {
        console.error('Error al procesar tabla:', error);
        return null;
    }
};

/**
 * Detecta y convierte todas las tablas Markdown en un texto a formato pdfmake
 * @param {string} texto - Texto completo que puede contener tablas
 * @returns {Object} - Objeto con texto sin tablas y array de tablas en formato pdfmake
 */
const detectarYConvertirTablas = (texto) => {
    console.log('DEPURACIÓN: Iniciando detectarYConvertirTablas');
    if (!texto) {
        console.log('DEPURACIÓN: Texto vacío');
        return { texto: "", tablas: [] };
    }
    
    // Convertir a string si no lo es
    const textoOriginal = String(texto);
    console.log('DEPURACIÓN: Longitud del texto original:', textoOriginal.length);
    
    // Dividir el texto en líneas
    const lineas = textoOriginal.split('\n');
    console.log('DEPURACIÓN: Número de líneas:', lineas.length);
    
    let i = 0;
    let resultado = { texto: "", tablas: [] };
    let textoSinTablas = [];
    let tablasEncontradas = 0;
    
    while (i < lineas.length) {
        // Si encontramos el inicio de una posible tabla
        if (lineas[i] && lineas[i].trim().startsWith('|') && lineas[i].trim().endsWith('|')) {
            console.log(`DEPURACIÓN: Posible inicio de tabla encontrado en línea ${i}: ${lineas[i].substring(0, 30)}...`);
            
            // Verificar si la siguiente línea es un separador de tabla
            if (i + 1 < lineas.length && 
                lineas[i + 1] && 
                lineas[i + 1].includes('|') && 
                lineas[i + 1].includes('-')) {
                
                console.log(`DEPURACIÓN: Confirmado inicio de tabla en línea ${i}`);
                
                // Encontrado inicio de tabla, guardar posición
                const inicioTabla = i;
                i += 2; // Saltar encabezado y separador
                
                // Buscar el final de la tabla
                while (i < lineas.length && 
                       lineas[i] && 
                       lineas[i].trim().startsWith('|') && 
                       lineas[i].trim().endsWith('|')) {
                    i++;
                }
                
                // Extraer la tabla completa
                const tablaMd = lineas.slice(inicioTabla, i).join('\n');
                console.log(`DEPURACIÓN: Tabla extraída (${i-inicioTabla} líneas):\n${tablaMd.substring(0, 100)}...`);
                
                // Convertir a formato pdfmake
                const tablaPdfmake = convertirTablaAPdfmake(tablaMd);
                
                if (tablaPdfmake) {
                    tablasEncontradas++;
                    console.log(`DEPURACIÓN: Tabla #${tablasEncontradas} convertida exitosamente a formato pdfmake`);
                    
                    // Agregar la tabla al resultado
                    resultado.tablas.push(tablaPdfmake);
                    
                    // Agregar un marcador en lugar de la tabla - formato sin guion bajo para coincidir con lo que viene en el texto
                    const marcador = `[[TABLA${resultado.tablas.length - 1}]]`;
                    textoSinTablas.push(marcador);
                    console.log(`DEPURACIÓN: Agregado marcador: ${marcador}`);
                } else {
                    console.log('DEPURACIÓN: No se pudo convertir la tabla, manteniendo texto original');
                    // Si no se pudo convertir, mantener el texto original
                    textoSinTablas = textoSinTablas.concat(lineas.slice(inicioTabla, i));
                }
            } else {
                // No es una tabla, avanzar normalmente
                textoSinTablas.push(lineas[i]);
                i++;
            }
        } else {
            // Línea normal, no es tabla
            textoSinTablas.push(lineas[i]);
            i++;
        }
    }
    
    // Unir el texto sin tablas
    resultado.texto = textoSinTablas.join('\n');
    
    console.log(`DEPURACIÓN: detectarYConvertirTablas completado. ${resultado.tablas.length} tablas encontradas.`);
    console.log('DEPURACIÓN: Marcadores en el texto:', resultado.texto.match(/\[\[TABLA_\d+\]\]/g) || 'Ninguno');
    
    return resultado;
};

const maquetareport = async (data, withAI = false) => {
    
   const {
            fecha,
            id_usuario, 
            comentarioEvaluacion, 
            objetivos_usuario, 
            puntuacion, 
            comentarioHabilidad, 
            responses 
        } = data;
   
    const comentarioFinalEvaluacion = validarComentarios(comentarioEvaluacion); 
    const comentarioFinalHabilidad = validarComentarios(comentarioHabilidad);     
    const fechaFormateada= formatearFecha(fecha);
    const objetivos = extraerObjetivos(objetivos_usuario);
    const respuestas = extraerRespuestas(responses);
    const claves = extraerClaves(responses);
      // Obtener datos del usuario
    const user = await buscarUsuario(parseInt(id_usuario, 10));
    const {nombreFinal, apellidoFinal, ciFormateado} = user;
    
    // Sección de objetivos en formato de tabla/lista
    
    // Define todosObjetivosTable as an array of elements
    let todosObjetivosTable;
    
    if (objetivos.length > 0) {   
        // Create array with title and table as separate elements
        todosObjetivosTable = [
            // Title element
            {
                text: `Objetivos de ${nombreFinal}`,
                style: 'sectionHeader',
                margin: [0, 15, 0, 10]
            },
            // Table element
            {
                layout: 'lightHorizontalLines',
                table: {
                    widths: [50, '*', 'auto', 'auto'],
                    body: [
                        ['N°','DESCRIPCIÓN','ESTADO','PERÍODO' ],
                        ...objetivos.map((obj, index) =>[
                            index + 1,
                            obj.descripcion,
                            obj.estado_actual,
                            obj.periodoComppleto
                        ]),
                    ],
                },
                margin: [0, 10, 0, 10]
            }
        ];  
    } else {
        todosObjetivosTable = [
            {
                text: `Objetivos de ${nombreFinal}`,
                style: 'sectionHeader',
                margin: [0, 15, 0, 10]
            },
            {
                text: "No hay objetivos registrados.",
                style: 'span',
                italics: true,
                margin: [0, 5, 0, 15]    
            }
        ];
    }
    // Crear tabla para los datos personales
    const tablaPersonal = {
        
        text:[
            {
                text:"Datos Personales\n",
                style: "sectionHeader"
            },
            `Nombre: ${nombreFinal}\nApellido: ${apellidoFinal}\n Cedula de indentidad: ${ciFormateado}`
        ],
            
        margin: [0, 0, 0, 20]
    };
    
    // Tabla para comentarios
    const tablaComentarios = {
    
        text:[
            {
                text: "Comentarios acerca de la evaluacion: ",
                style: "sectionHeader",
            },
            {
                text:`${comentarioFinalEvaluacion}`,
                style: "span",
            }
            
        ],
        margin: [0, 10, 0, 10] // Add margin [left, top, right, botto

    };
    
    // Tabla para comentarios de habilidad
    const tablaHabilidades = {
        text:[
            {
                text: "Comentarios acerca de la evaluacion de habilidades: ",
                style: "sectionHeader",
            },
            {
                text:`${comentarioFinalHabilidad}`,
                style: "span",
            }
            
        ],
        margin: [0, 10, 0, 10] // Add margin [left, top, right, botto
    };
    
    // Sección de puntuación
    const seccionPuntuacion = {
        text: [
            {
                width: '70%',
                text: 'PUNTUACIÓN FINAL: ',
                style: 'sectionHeader',
                alignment: 'center'
            },
            {
                width: '30%',
                text: puntuacion,
                style: 'h1',
                alignment: 'center',
                color: parseInt(puntuacion) >= 3 ? '#27ae60' : parseInt(puntuacion) < 3 ? '#f39c12' : '#e74c3c'
            }
        ],
        margin: [0, 10, 0, 20]
    };
    
    // Create array of objects where each object has Habilidad and res properties
    const totalRespuestas = claves.map((clave, index) => {
        return {
            Habilidad: clave,
            res: index < respuestas.length ? respuestas[index] : 'Sin respuesta'
        };
    });
    
    // Determinar cuántos elementos procesar
    const maxItems = totalRespuestas.length;
    let tablaRespuestas;

    if (maxItems > 0) {
        // Para cada índice dentro del rango máximo, crear una entrada
         tablaRespuestas = [
            // Title element
            {
                text: `Evaluacion de Habilidades`,
                style: 'sectionHeader',
                margin: [0, 15, 0, 10]
            },
            // Table element
            {
                layout: 'lightHorizontalLines',
                table: {
                    widths: ['*', '40%'],
                    body: [
                        ['Habilidad','Tu Resultado' ],
                        ...totalRespuestas.map((item) => [
                           item.Habilidad,
                           item.res
                        ]),
                    ],
                },
                margin: [0, 10, 0, 10]
            }
        ]; 
    } else {
        // Si no hay elementos en ninguno de los arrays
        tablaRespuestas =[
            {
                text: `Evaluacion de Habilidades`,
                style: 'sectionHeader',
                margin: [0, 15, 0, 10]
            },
            {
                text: `No se hizo evaluacion de habilidades`,
                style: 'span',
                margin: [0, 15, 0, 10]
            }
        ]
    }
    
    // Pie de página
    const piePagina = {
        text: `Documento Realizado por ActionMetrics ${fechaFormateada}` ,
        style: 'footer'
    };
    
    // Definir estructura del documento
    const docDefinition = {
        // Definir una función para el encabezado que verifica el número de página
        header: function(currentPage) {
            // Siempre incluimos la fecha en todas las páginas
            const headerColumns = [
                // Solo incluir la imagen en la primera página
                currentPage === 1 ? {
                    image: "./assets/fotoPerfil3.jpg",
                    width: 60,
                    margin: [10, 0]
                } : {},
                {
                    text: `Fecha: ${fechaFormateada}`,
                    alignment: 'right',
                    fontSize: 12,
                }
            ];
            
            return {
                columns: headerColumns,
                margin: [15, 15, 15, 30]
            };
        },
        content: [
            {
                text: 'Reporte de Desempeño',
                style: 'h1'
            },
            tablaPersonal,
            todosObjetivosTable,
            tablaComentarios,
            tablaRespuestas,
            tablaHabilidades,
            seccionPuntuacion,
            piePagina
        ],
        styles: style,
        pageMargins: [40, 60, 40, 60],
        defaultStyle: {
            font: 'Roboto'
        }
    };
    
    // Si es con IA, agregar la sección correspondiente
    if (withAI) {
        try {
            console.log('Intentando generar análisis de IA...');
            // Generar análisis de IA
            let analisisIA = await aiService.generateAIComment(user, data);
            console.log('Análisis IA recibido:', analisisIA?.substring(0, 100) + '...');
            console.log('Tipo de dato recibido:', typeof analisisIA);
            
            // Verificar que el análisis no sea vacío o nulo y asegurarse de que sea string
            if (analisisIA === null || analisisIA === undefined) {
                throw new Error('El análisis de IA es nulo o indefinido');
            }
            
            // Convertir a string si no lo es
            analisisIA = String(analisisIA);
            
            if (analisisIA.trim() === '') {
                throw new Error('El análisis de IA generado está vacío');
            }
            
            // Detectar y convertir las tablas en el texto usando la función directa
            const resultado = detectarYConvertirTablas(analisisIA);
            let textoLimpio = resultado.texto;
            const tablasPdfmake = resultado.tablas;
            
            console.log(`Encontradas ${tablasPdfmake.length} tablas en la respuesta de IA`);
            
            // Convertir formato Markdown a texto plano (para el texto entre tablas)
            textoLimpio = convertirMarkdownATexto(textoLimpio);
            
            console.log('DEPURACIÓN: Texto limpio final:', textoLimpio);
            console.log('DEPURACIÓN: Tablas PDFMake disponibles:', tablasPdfmake.length);
            
            // Encontrar la posición de seccionPuntuacion para insertar después
            const seccionIndex = docDefinition.content.findIndex(item => 
                item === seccionPuntuacion
            );
            console.log('DEPURACIÓN: Índice de seccionPuntuacion:', seccionIndex);
            
            // Crear los elementos de contenido para la sección de IA
            const elementosContenido = [];
            
            // Primero el título de la sección
            elementosContenido.push({
                text: 'Plan de mejora con IA',
                style: 'sectionHeader',
                margin: [0, 30, 0, 10],
                pageBreak: 'before'
            });
            console.log('DEPURACIÓN: Título agregado a elementosContenido');
            
            if (tablasPdfmake.length > 0) {
                // Si hay tablas, insertar el contenido alternando texto y tablas
                // Busca tanto [[TABLA_0]] como [[TABLA0]]
                const marcadoresTabla = textoLimpio.match(/\[\[TABLA[_]?\d+\]\]/g) || [];
                console.log('DEPURACIÓN: Marcadores encontrados:', marcadoresTabla);
                
                if (marcadoresTabla.length > 0) {
                    console.log('DEPURACIÓN: Procesando texto con marcadores de tabla');
                    
                    // Para rastrear las posiciones de las tablas en el texto
                    const posicionesTablas = [];
                    const textoConPosiciones = textoLimpio.replace(/\[\[TABLA[_]?(\d+)\]\]/g, (match, index) => {
                        posicionesTablas.push(parseInt(index, 10));
                        return '[[MARCA_TEMPORAL]]';
                    });
                    
                    console.log('DEPURACIÓN: Índices de tablas encontrados:', posicionesTablas);
                    
                    // Dividir el texto por los marcadores temporales
                    const partes = textoConPosiciones.split('[[MARCA_TEMPORAL]]');
                    console.log('DEPURACIÓN: Partes de texto dividido:', partes.length);
                    
                    // Para cada parte de texto y tabla
                    partes.forEach((parte, indice) => {
                        console.log(`DEPURACIÓN: Procesando parte ${indice}:`, parte.substring(0, 30) + (parte.length > 30 ? '...' : ''));
                        
                        // Si el texto no está vacío, agregarlo
                        if (parte.trim()) {
                            elementosContenido.push({
                                text: parte,
                                style: 'span',
                                margin: [0, 5, 0, 10]
                            });
                            console.log(`DEPURACIÓN: Texto de parte ${indice} agregado a elementosContenido`);
                        }
                        
                        // Si hay una tabla correspondiente, agregarla
                        if (indice < posicionesTablas.length && posicionesTablas[indice] < tablasPdfmake.length) {
                            const tablaIndice = posicionesTablas[indice];
                            console.log(`DEPURACIÓN: Agregando tabla ${tablaIndice} después de parte ${indice}`);
                            elementosContenido.push(tablasPdfmake[tablaIndice]);
                        }
                    });
                } else {
                    console.log('DEPURACIÓN: No se encontraron marcadores en el texto, agregando texto y luego tablas');
                    // No se encontraron marcadores, poner texto primero y luego tablas
                    elementosContenido.push({
                        text: textoLimpio,
                        style: 'span',
                        margin: [0, 5, 0, 10]
                    });
                    
                    tablasPdfmake.forEach((tabla, idx) => {
                        console.log(`DEPURACIÓN: Agregando tabla ${idx} al final`);
                        elementosContenido.push(tabla);
                    });
                }
            } else {
                console.log('DEPURACIÓN: No hay tablas, solo agregando texto');
                // No hay tablas, solo agregar el texto
                elementosContenido.push({
                    text: textoLimpio,
                    style: 'span',
                    margin: [0, 5, 0, 20]
                });
            }
            
            console.log('DEPURACIÓN: Elementos de contenido generados:', elementosContenido.length);
            
            // Insertar el contenido en el documento
            if (seccionIndex !== -1) {
                console.log('DEPURACIÓN: Insertando análisis de IA después de seccionPuntuacion...');
                // Insertar después (+1) de la posición de seccionPuntuacion
                docDefinition.content.splice(seccionIndex + 1, 0, ...elementosContenido);
                console.log('DEPURACIÓN: Inserción completada, nuevo tamaño de content:', docDefinition.content.length);
            } else {
                console.error('DEPURACIÓN: No se encontró la sección de puntuación, insertando al final');
                // Añadir al final si no se encuentra la posición
                docDefinition.content.push(...elementosContenido);
                console.log('DEPURACIÓN: Contenido añadido al final, nuevo tamaño:', docDefinition.content.length);
            }
            
        } catch (error) {
            console.error('Error al generar análisis de IA:', error);
            
            // Agregar mensaje de error al documento
            const seccionIndex = docDefinition.content.findIndex(item => 
                item === seccionPuntuacion
            );
            
            if (seccionIndex !== -1) {
                docDefinition.content.splice(seccionIndex + 1, 0,
                    {
                        text: 'Plan de mejora con IA',
                        style: 'sectionHeader',
                        margin: [0, 30, 0, 10],
                        pageBreak: 'before'
                    },
                    {
                        text: `No se pudo generar el análisis de IA. Error: ${error.message}`,
                        style: 'span',
                        color: 'red',
                        margin: [0, 5, 0, 20]
                    }
                );
            }
        }
    }
    
    return docDefinition;
}

const maquetareportWithAI = async (data) => {
    return maquetareport(data, true);
};

module.exports = {
    maquetareport,
    maquetareportWithAI
};