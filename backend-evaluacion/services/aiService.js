require('dotenv').config();
const OpenAI = require('openai');

class AIService {
  constructor() {
    // Debes crear un archivo .env y añadir la variable DEEPSEEK_API_KEY con tu clave de DeepSeek
    this.apiKey = process.env.DEEPSEEK_API_KEY || 'tu-api-key-aqui';
    
    // Inicializar el cliente de OpenAI pero configurado para DeepSeek
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: 'https://api.deepseek.com/v1', // URL base de la API de DeepSeek
    });
  }

  async generateAIComment(userData, evaluationData) {
    try {
      console.log(`generateAIComment - Datos de usuario: ${userData ? 'Presente' : 'No presente'}`);
      console.log(`generateAIComment - Datos de evaluación: ${evaluationData ? 'Presente' : 'No presente'}`);
      
      // Si no hay API key configurada, usar el método simulado
      if (this.apiKey === 'tu-api-key-aqui') {
        console.log('Usando método simulado por falta de API key');
        const resultado = this._generateSimulatedComment(userData, evaluationData);
        console.log('Resultado simulado generado:', resultado ? resultado.substring(0, 50) + '...' : 'vacío');
        return resultado || 'No se pudo generar un análisis simulado. Por favor contacte al administrador.';
      }
      
      const contexto = `Eres un asistente especializado de una empresa líder en desarrollo de software, aplicaciones web y soluciones en la nube. 
      Tu rol es brindar planes de mejora, asesoría técnica y estratégica a clientes, desarrolladores y stakeholders, combinando conocimientos técnicos
      profundos con habilidades de comunicación efectiva.

          Características clave que debes reflejar:
          Experto en Tecnología:
          Dominio de lenguajes de programación (JavaScript, Python, Java, C#, etc.).
          Desarrollo de aplicaciones web (frontend/backend, frameworks como React, Angular, Node.js).
          Plataformas cloud (AWS, Azure, Google Cloud) y arquitecturas (microservicios, serverless).
          Manejo de bases de datos (SQL, NoSQL) y optimización de consultas.
          Protocolos de seguridad (OWASP, cifrado, IAM, compliance GDPR/HIPAA).

          Habilidades Blandas:
          Comunicación clara y adaptada al interlocutor (técnico o no técnico).
          Empatía para resolver dudas o conflictos.
          Capacidad para guiar en gestión de proyectos (Scrum, Kanban).
          Funcionalidades del Chatbot:
          Explicar conceptos técnicos con ejemplos prácticos.
          Recomendar tecnologías según casos de uso.

          Alertar sobre riesgos de seguridad en implementaciones.

          Ofrecer guías paso a paso (ej.: "Cómo migrar una app a la nube").

          Sugerir recursos (documentación, cursos, herramientas).
          
          Tono:

          Profesional pero accesible.

          Evita jerga técnica si el usuario no es experto.

          Sé proactivo/añade ejemplos cuando sea útil.

          Limites:

          Siempre responde en español.s

          Si no sabes algo, dilo y ofrece investigarlo.

          No hagas suposiciones sobre requisitos del proyecto sin preguntar.`;

      // Construir el prompt para DeepSeek con todos los datos disponibles
      const prompt = `Genera un plan de mejora para ${userData.nombreFinal} ${userData.apellidoFinal} 
                    basado en su evaluación con puntuación ${evaluationData.puntuacion}/5 realizada en fecha ${evaluationData.fecha ? evaluationData.fecha : 'actual'}.
                    ${evaluationData.comentarioEvaluacion ? `Evaluación general: ${evaluationData.comentarioEvaluacion}` : ''}
                    ${evaluationData.comentarioHabilidad ? `Habilidades: ${evaluationData.comentarioHabilidad}` : ''}
                    Objetivos: ${JSON.stringify(evaluationData.objetivos_usuario || [])}
                    
                    Respuestas en evaluación de habilidades: ${JSON.stringify(evaluationData.responses || {})}

                    No tomes en cuenta los id de los objetivos y respuestas. Centrate en los comentarios la puntuación y las respuestas.
                  
                    
                    El plan debe incluir:
                    1. Un análisis de fortalezas y debilidades basado en la puntuación
                    2. Recomendaciones específicas para mejorar basadas en las respuestas y comentarios
                    3. Un cronograma sugerido para implementar mejoras
                    4. Métricas para evaluar el progreso
                    
                    IMPORTANTE: Tu respuesta DEBE ser completamente en ESPAÑOL.
                    
                    Formato el plan de manera clara y concisa, evitando generalidades.
                    Por favor responde en contexto a los datos y en español la respuesta.
                    `;
      
      console.log('Preparando llamada a la API de DeepSeek...');
      
      // Llamar a la API de DeepSeek
      const response = await this.client.chat.completions.create({
        model: 'deepseek-reasoner', // Modelo DeepSeek-R1 optimizado para razonamiento complejo
        messages: [
          { role: 'system', 
            content: `Eres un asistente especializado en evaluación de desempeño, 
            análisis empresarial y desarrollo profesional. Ofrece análisis detallados, 
            precisos y con fundamento técnico. Tus respuestas deben ser estructuradas, específicas y 
            orientadas a resultados medibles.
            IMPORTANTE: Debes responder SOLO en español. No uses inglés bajo ninguna circunstancia.
            Contexto: ${contexto}` },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000, // Aumentado significativamente para evitar truncamiento
        temperature: 0.5 // Reducido para respuestas más consistentes y precisas
      });
      
      console.log('Respuesta recibida de DeepSeek');
      console.log('Estructura de respuesta completa:', JSON.stringify(response, null, 2));
      console.log('Choices disponibles:', response.choices ? response.choices.length : 0);
      
      // Validar que la respuesta tenga la estructura esperada
      if (!response || !response.choices || response.choices.length === 0 || !response.choices[0].message) {
        console.error('Estructura de respuesta inválida de DeepSeek:', JSON.stringify(response));
        return "La API de DeepSeek devolvió una respuesta con estructura inválida. Utilizando análisis simulado.\n\n" + 
               this._generateSimulatedComment(userData, evaluationData);
      }
      
      // DeepSeek puede generar respuestas tanto en content como en reasoning_content
      // Verificamos primero si hay content con datos
      const message = response.choices[0].message;
      let content = '';
      
      // Verificar primero el campo content que tiene respuesta formateada en español
      if (message.content && message.content.trim() !== '') {
        content = message.content;
        console.log('Usando content de DeepSeek (respuesta en español)');
      }
      // Si no hay content, intentar usar reasoning_content
      else if (message.reasoning_content && message.reasoning_content.trim() !== '') {
        let rawContent = message.reasoning_content;
        console.log('Usando reasoning_content de DeepSeek');
        
        // Lista de patrones de inicio de la sección en español
        const patrones = [
          'Plan de Mejora para',
          'Plan de Mejora:',
          'Plan de Mejora',
          'Análisis de Fortalezas',
          'Análisis de',
          'Fortalezas:',
          'Fortalezas y Debilidades'
        ];
        
        // Intentar encontrar alguno de los patrones
        let indiceEncontrado = -1;
        let patronEncontrado = '';
        
        for (const patron of patrones) {
          const indice = rawContent.indexOf(patron);
          if (indice !== -1 && (indiceEncontrado === -1 || indice < indiceEncontrado)) {
            indiceEncontrado = indice;
            patronEncontrado = patron;
          }
        }
        
        if (indiceEncontrado !== -1) {
          // Quedarnos solo con el contenido desde el patrón encontrado
          content = rawContent.substring(indiceEncontrado);
          console.log(`Contenido filtrado a partir de "${patronEncontrado}"`);
        } else {
          // Si no encuentra ninguno, usar todo el contenido pero eliminar la primera parte en inglés
          // Típicamente, la primera línea contiene "We are given" o similar
          const lineas = rawContent.split('\n');
          if (lineas.length > 1 && (lineas[0].includes('We are') || lineas[0].includes('Given'))) {
            // Eliminar la primera línea que está en inglés
            content = lineas.slice(1).join('\n');
            console.log('No se encontraron patrones en español, eliminando primera línea en inglés');
          } else {
            content = rawContent;
            console.log('Usando contenido completo, no se detectó estructura conocida');
          }
        }
      } else {
        console.log('No se encontró contenido en español, intentando traducción automática del contenido en inglés');
        
        // Si tenemos reasoning_content en inglés, intentar usarlo con traducción
        if (message.reasoning_content && message.reasoning_content.trim() !== '') {
          try {
            // Función para traducir texto de inglés a español usando el mismo modelo DeepSeek
            const translatedContent = await this._translateFromEnglish(message.reasoning_content);
            if (translatedContent && translatedContent.trim() !== '') {
              content = translatedContent;
              console.log('Contenido traducido automáticamente del inglés');
              return content;
            }
          } catch (translationError) {
            console.error('Error en la traducción automática:', translationError);
          }
        }
        
        console.error('No se encontró contenido válido en la respuesta de DeepSeek');
        return "La API de DeepSeek devolvió contenido vacío. Utilizando análisis simulado.\n\n" + 
               this._generateSimulatedComment(userData, evaluationData);
      }
      
      console.log('Contenido válido recibido de DeepSeek:', content.substring(0, 50) + '...');
      return content;

    } catch (error) {
      console.error('Error llamando a la API de DeepSeek:', error);
      // Si hay error con la API, usar el método simulado como fallback
      return this._generateSimulatedComment(userData, evaluationData);
    }
  }
  
  // Método privado para generar un comentario simulado cuando no hay API key
  _generateSimulatedComment(userData, evaluationData) {
    let calificacion = "";
    const puntuacion = parseInt(evaluationData.puntuacion, 10);
    
    if (puntuacion == 5) {
      calificacion = "excelente";
    } else if (puntuacion < 5) {
      calificacion = "bueno";
    } else if (puntuacion == 3) {
      calificacion = "satisfactorio";
    } else {
      calificacion = "necesita mejorar";
    }

    // Extraer información sobre objetivos si existen
    const objetivosInfo = evaluationData.objetivos_usuario && evaluationData.objetivos_usuario.length > 0 ?
      `\n\nObjetivos identificados: ${evaluationData.objetivos_usuario.length}. ${evaluationData.objetivos_usuario.map(obj => 
        `\n- ${obj.descripcion || 'Sin descripción'} (Estado: ${obj.estado_actual || 'No especificado'})`
      ).join('')}` : '\n\nNo se han establecido objetivos específicos.';
    
    // Extraer información sobre habilidades evaluadas si existen
    const habilidadesEvaluadas = evaluationData.responses && Object.keys(evaluationData.responses).length > 0 ?
      `\n\nHabilidades evaluadas: ${Object.keys(evaluationData.responses).length}. ${Object.entries(evaluationData.responses).map(([key, value]) => 
        `\n- ${key}: ${value}`
      ).join('')}` : '\n\nNo hay evaluación de habilidades específicas.';
    
    return `Análisis generado por IA para ${userData.nombreFinal} ${userData.apellidoFinal} (CI: ${userData.ciFormateado}):
    
    Basado en la evaluación realizada el ${evaluationData.fecha || 'día de hoy'}, el desempeño general es ${calificacion} con una puntuación de ${evaluationData.puntuacion}/5. 
    
    Análisis de fortalezas y áreas de mejora:
    - El evaluado demuestra ${puntuacion > 3 ? 'fortalezas notables' : 'aspectos a desarrollar'} en sus responsabilidades asignadas.
    - ${evaluationData.comentarioHabilidad ? `Respecto a sus habilidades: ${evaluationData.comentarioHabilidad}` : 'No hay comentarios específicos sobre habilidades.'}
    - ${evaluationData.comentarioEvaluacion ? `Evaluación general: ${evaluationData.comentarioEvaluacion}` : 'No hay comentarios generales disponibles.'}
    ${objetivosInfo}
    ${habilidadesEvaluadas}
    
    Recomendaciones:
    - Continuar reforzando las áreas de mayor puntuación
    - Establecer plan de desarrollo en los aspectos con menor rendimiento
    - Revisar periódicamente el avance en los objetivos establecidos
    - Programar seguimiento en 3 meses para verificar mejoras
    
    Este análisis fue generado automáticamente y debe considerarse como complementario a la evaluación humana.`;
  }
  
  // Método para traducir contenido de inglés a español
  async _translateFromEnglish(englishContent) {
    try {
      console.log('Intentando traducir contenido de inglés a español...');
      
      // Si el contenido es demasiado largo, tomamos solo los primeros 3000 caracteres
      // para evitar exceder límites de la API
      const contentToTranslate = englishContent.length > 3000 ? 
        englishContent.substring(0, 3000) : englishContent;
      
      const response = await this.client.chat.completions.create({
        model: 'deepseek-reasoner',
        messages: [
          { 
            role: 'system', 
            content: 'Eres un traductor profesional especializado en traducir textos técnicos y de negocios del inglés al español. Traduce el siguiente texto a español natural, manteniendo la estructura y formato original.' 
          },
          { 
            role: 'user', 
            content: `Traduce este texto de inglés a español, manteniendo todos los formatos, listas y estructura:
            
            ${contentToTranslate}` 
          }
        ],
        max_tokens: 4000,
        temperature: 0.3 // Bajo para traducciones más precisas
      });
      
      if (response && response.choices && response.choices.length > 0 && response.choices[0].message) {
        return response.choices[0].message.content || '';
      }
      
      return '';
    } catch (error) {
      console.error('Error en la traducción:', error);
      return '';
    }
  }
}

module.exports = AIService;
