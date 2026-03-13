const documentService = require('../services/documentService');

class DocumentController {
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          ok: false,
          data: null,
          message: 'No se proporcionó ningún archivo'
        });
      }

      const objetivoId = req.body.objetivoId || '';

      const now = new Date();
      const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

      const originalName = req.file.originalname;
      const fileExt = originalName.substring(originalName.lastIndexOf('.')) || '';
      const customFileName = `obj_${objetivoId}_${dateStr}${fileExt}`;

      const document = await documentService.saveDocument(req.file, customFileName);

      return res.status(201).json({
        ok: true,
        data: document,
        message: 'Documento subido correctamente'
      });
    } catch (error) {
      console.error('Error en uploadDocument:', error);
      return res.status(500).json({
        ok: false,
        data: null,
        message: error.message || 'Error al subir el documento'
      });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { fileName } = req.params;

      if (!fileName) {
        return res.status(400).json({
          ok: false,
          data: null,
          message: 'Nombre de archivo requerido'
        });
      }

      await documentService.deleteDocument(fileName);

      return res.status(200).json({
        ok: true,
        data: null,
        message: 'Documento eliminado correctamente'
      });
    } catch (error) {
      console.error('Error en deleteDocument:', error);
      return res.status(500).json({
        ok: false,
        data: null,
        message: error.message || 'Error al eliminar el documento'
      });
    }
  }

  async getDocuments(req, res) {
    try {
      const documents = await documentService.getDocuments();

      return res.status(200).json({
        ok: true,
        data: documents,
        message: 'Documentos obtenidos correctamente'
      });
    } catch (error) {
      console.error('Error en getDocuments:', error);
      return res.status(500).json({
        ok: false,
        data: null,
        message: error.message || 'Error al obtener los documentos'
      });
    }
  }
}

module.exports = new DocumentController();
