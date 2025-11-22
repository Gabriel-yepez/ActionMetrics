const multer = require('multer');
const path = require('path');

// Configuración de almacenamiento en memoria para procesamiento
const storage = multer.memoryStorage();

// Filtro para archivos
const fileFilter = (req, file, cb) => {
  // Puedes personalizar los tipos de archivos permitidos
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido. Los formatos aceptados son PDF, Word, Excel, PowerPoint, texto plano e imágenes.'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB
  },
  fileFilter,
});

module.exports = upload;
