const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento en memoria para procesamiento
const storage = multer.memoryStorage();

// Tipos permitidos y las extensiones válidas para cada uno.
// La extensión debe corresponder al tipo: así no se puede subir, por ejemplo,
// un .html declarado como imagen y servirlo después desde el dominio de la API.
const ALLOWED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
};

/** Extensión normalizada del archivo, o null si no corresponde a su tipo. */
const getAllowedExtension = (file) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowed = ALLOWED_TYPES[file.mimetype];
  return allowed && allowed.includes(ext) ? ext : null;
};

// Filtro para archivos
const fileFilter = (req, file, cb) => {
  if (getAllowedExtension(file)) {
    cb(null, true);
  } else {
    const error = new Error('Tipo de archivo no permitido. Los formatos aceptados son PDF, Word, Excel, PowerPoint, texto plano e imágenes.');
    error.status = 400;
    cb(error, false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB
    files: 1,
  },
  fileFilter,
});

module.exports = upload;
module.exports.getAllowedExtension = getAllowedExtension;
