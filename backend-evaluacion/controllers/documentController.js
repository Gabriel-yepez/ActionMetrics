const documentService = require('../services/documentService');
const { getAllowedExtension } = require('../middleware/uploadMiddleware');
const { Objetivo } = require('../db/sequelize');
const { toId, isSuperAdmin, canAccessObjetivo, getObjetivosWhere } = require('../middleware/access');

// Los documentos se nombran obj_<idObjetivo>_<fecha>.<ext>
const getObjetivoIdFromFileName = (fileName) => {
  const match = /^obj_(\d+)_/.exec(fileName);
  return match ? Number(match[1]) : null;
};

const accesoDenegado = (res) =>
  res.status(403).json({ ok: false, data: null, message: 'Acceso denegado.' });

/** ¿Puede el usuario acceder al documento según el objetivo al que pertenece? */
const canAccessDocument = async (user, fileName) => {
  if (isSuperAdmin(user)) return true;
  const objetivoId = getObjetivoIdFromFileName(fileName);
  if (!objetivoId) return false;
  return canAccessObjetivo(user, await Objetivo.findByPk(objetivoId));
};

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

      // El documento debe asociarse a un objetivo existente al que el usuario tenga acceso
      const objetivoId = toId(req.body.objetivoId);
      if (!objetivoId) {
        return res.status(400).json({ ok: false, data: null, message: 'objetivoId inválido' });
      }
      const objetivo = await Objetivo.findByPk(objetivoId);
      if (!objetivo) {
        return res.status(404).json({ ok: false, data: null, message: 'Objetivo no encontrado' });
      }
      if (!(await canAccessObjetivo(req.user, objetivo))) return accesoDenegado(res);

      const now = new Date();
      const dateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;

      // Extensión ya validada contra el tipo del archivo en el middleware de subida
      const fileExt = getAllowedExtension(req.file);
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
        message: 'Error al subir el documento'
      });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { fileName } = req.params;

      if (!documentService.resolveSafePath(documentService.DOCUMENTS_DIR, fileName)) {
        return res.status(400).json({
          ok: false,
          data: null,
          message: 'Nombre de archivo inválido'
        });
      }

      if (!(await canAccessDocument(req.user, fileName))) return accesoDenegado(res);

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
        message: 'Error al eliminar el documento'
      });
    }
  }

  async getDocuments(req, res) {
    try {
      let documents = await documentService.getDocuments();

      // Solo los documentos de objetivos visibles para el usuario
      if (!isSuperAdmin(req.user) || req.query.departamento) {
        const visibles = await Objetivo.findAll({
          where: await getObjetivosWhere(req),
          attributes: ['id'],
          raw: true
        });
        const visibleIds = new Set(visibles.map(o => o.id));
        documents = documents.filter(doc => visibleIds.has(getObjetivoIdFromFileName(doc.fileName)));
      }

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
        message: 'Error al obtener los documentos'
      });
    }
  }
}

module.exports = new DocumentController();
module.exports.canAccessDocument = canAccessDocument;
