const documentService = require('../services/documentService');

/**
 * Controlador para manejar operaciones con documentos
 */
class DocumentController {
  /**
   * Sube un documento
   * @param {Object} req - Solicitud HTTP
   * @param {Object} res - Respuesta HTTP
   */
  async uploadDocument(req, res) {
    try {
      // Verificar si hay un archivo en la solicitud
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      // Obtener ID del usuario y del objetivo si se proporcionan
      const objetivoId = req.body.objetivoId || '';
      
      // Generar un nombre de archivo que incluya el ID del usuario y la fecha
      const now = new Date();
      const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Crear nombre del archivo con formato: obj_[objetivoId]_[fecha][extensión]
      const originalName = req.file.originalname;
      const fileExt = originalName.substring(originalName.lastIndexOf('.')) || '';
      const customFileName = `obj_${objetivoId}_${dateStr}${fileExt}`;
      
      // Guardar el documento usando el servicio
      const document = await documentService.saveDocument(req.file, customFileName);

      return res.status(201).json({
        success: true,
        message: 'Documento subido correctamente',
        data: document
      });
    } catch (error) {
      console.error('Error en uploadDocument:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al subir el documento'
      });
    }
  }

  /**
   * Elimina un documento
   * @param {Object} req - Solicitud HTTP
   * @param {Object} res - Respuesta HTTP
   */
  async deleteDocument(req, res) {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        return res.status(400).json({
          success: false,
          message: 'Nombre de archivo requerido'
        });
      }

      // Eliminar el documento usando el servicio
      await documentService.deleteDocument(fileName);

      return res.status(200).json({
        success: true,
        message: 'Documento eliminado correctamente'
      });
    } catch (error) {
      console.error('Error en deleteDocument:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar el documento'
      });
    }
  }

  /**
   * Obtiene la lista de documentos
   * @param {Object} req - Solicitud HTTP
   * @param {Object} res - Respuesta HTTP
   */
  async getDocuments(req, res) {
    try {
      // Obtener la lista de documentos usando el servicio
      const documents = await documentService.getDocuments();

      return res.status(200).json({
        success: true,
        message: 'Documentos obtenidos correctamente',
        data: documents
      });
    } catch (error) {
      console.error('Error en getDocuments:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener los documentos'
      });
    }
  }
}

module.exports = new DocumentController();
