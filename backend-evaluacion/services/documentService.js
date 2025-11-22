const fs = require('fs');
const path = require('path');

/**
 * Servicio para manejar documentos
 */
class DocumentService {
  /**
   * Guarda un documento en la carpeta public/document
   * @param {Object} file - Archivo cargado a través de multer
   * @param {string} customFileName - Nombre personalizado para el archivo (opcional)
   * @returns {Object} - Información del documento guardado
   */
  async saveDocument(file, customFileName = null) {
    try {
      if (!file) {
        throw new Error('No se proporcionó ningún archivo');
      }

      // Crear la carpeta si no existe
      const uploadDir = path.join(process.cwd(), 'public', 'document');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Generar un nombre único para el archivo
      const fileName = customFileName || `${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, fileName);

      // Guardar el archivo
      fs.writeFileSync(filePath, file.buffer);

      // Crear la URL del documento
      const documentUrl = `/document/${fileName}`;

      return {
        fileName: fileName,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: documentUrl,
        path: filePath
      };
    } catch (error) {
      console.error('Error al guardar el documento:', error);
      throw new Error(`Error al guardar el documento: ${error.message}`);
    }
  }

  /**
   * Elimina un documento de la carpeta public/document
   * @param {string} fileName - Nombre del archivo a eliminar
   * @returns {boolean} - Indica si la eliminación fue exitosa
   */
  async deleteDocument(fileName) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'document', fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error('El archivo no existe');
      }

      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      console.error('Error al eliminar el documento:', error);
      throw new Error(`Error al eliminar el documento: ${error.message}`);
    }
  }

  /**
   * Obtiene la lista de documentos disponibles
   * @returns {Array} - Lista de documentos
   */
  async getDocuments() {
    try {
      const documentsDir = path.join(process.cwd(), 'public', 'document');
      
      // Crear la carpeta si no existe
      if (!fs.existsSync(documentsDir)) {
        fs.mkdirSync(documentsDir, { recursive: true });
        return [];
      }

      const files = fs.readdirSync(documentsDir);
      
      return files.map(file => {
        const filePath = path.join(documentsDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          fileName: file,
          size: stats.size,
          createdAt: stats.birthtime,
          updatedAt: stats.mtime,
          url: `/document/${file}`
        };
      });
    } catch (error) {
      console.error('Error al obtener la lista de documentos:', error);
      throw new Error(`Error al obtener la lista de documentos: ${error.message}`);
    }
  }
}

module.exports = new DocumentService();
