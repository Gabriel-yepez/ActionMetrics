const { z } = require('zod');

const cedulaError = (issue) => (issue.input === undefined ? 'La cédula es requerida' : 'La cédula debe ser un número');

// --- Auth ---

const loginSchema = z.object({
  nombre_usuario: z.string().min(1, 'El nombre de usuario es requerido').max(50, 'Máximo 50 caracteres'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

const registerSchema = z.object({
  nombre_usuario: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100, 'Máximo 100 caracteres'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Máximo 255 caracteres'),
  ci: z.number({ error: cedulaError }).int('Debe ser un número entero').positive('Debe ser positivo'),
  // Sin id_rol: el registro público siempre crea empleados
  id_departamento: z.number().int().positive().optional().nullable(),
});

// --- Usuarios ---

const createUserSchema = z.object({
  nombre_usuario: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100, 'Máximo 100 caracteres'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Máximo 255 caracteres'),
  ci: z.number({ error: cedulaError }).int().positive('Debe ser positivo'),
  id_rol: z.number().int().min(1).max(3),
  id_departamento: z.number().int().positive().optional().nullable(),
});

const updateUserSchema = z.object({
  nombre_usuario: z.string().min(3).max(50).optional(),
  password: z.string().min(6).max(100).optional(),
  nombre: z.string().min(2).max(100).optional(),
  apellido: z.string().min(2).max(100).optional(),
  email: z.string().email('Email inválido').max(255).optional(),
  ci: z.number().int().positive().optional(),
  id_rol: z.number().int().min(1).max(3).optional(),
  id_departamento: z.number().int().positive().optional().nullable(),
});

// --- Objetivos ---

const ESTADOS_OBJETIVO = ['completado', 'no completado'];

const createObjetivoSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida').max(255, 'Máximo 255 caracteres'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
  estado_actual: z.enum(ESTADOS_OBJETIVO, { error: 'Estado inválido' }).optional(),
  estado_deseado: z.string().max(255).optional(),
  id_usuario: z.number().int().positive(),
  id_tipo_objetivo: z.number().int().min(1).max(2),
}).refine(data => new Date(data.fecha_fin) >= new Date(data.fecha_inicio), {
  message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
  path: ['fecha_fin'],
});

const updateObjetivoSchema = z.object({
  estado_actual: z.enum(ESTADOS_OBJETIVO, { error: 'Estado inválido' }).optional(),
  estado_deseado: z.string().max(255).optional(),
  descripcion: z.string().min(1).max(255).optional(),
  fecha_inicio: z.string().optional(),
  fecha_fin: z.string().optional(),
});

// --- Retroalimentación ---

const createRetroalimentacionSchema = z.object({
  comentario: z.string().min(1, 'El comentario es requerido').max(255, 'Máximo 255 caracteres'),
  fecha: z.string().optional(),
  id_usuario: z.number().int().positive('ID de usuario inválido'),
  id_evaluacion: z.number().int().positive('ID de evaluación inválido'),
});

const updateRetroalimentacionSchema = z.object({
  comentario: z.string().min(1, 'El comentario es requerido').max(255, 'Máximo 255 caracteres'),
});

// --- Reportes ---
// Solo tipos primitivos: los valores se insertan en la definición del PDF (pdfmake),
// y un objeto ahí podría hacer que el generador lea archivos del servidor.

const textoOpcional = (max) => z.string().max(max).optional().nullable();

const reportSchema = z.object({
  id_usuario: z.coerce.number().int().positive('Usuario inválido'),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (formato AAAA-MM-DD)'),
  comentarioEvaluacion: textoOpcional(5000),
  comentarioHabilidad: textoOpcional(5000),
  puntuacion: z.union([z.number(), z.string().max(20)]).optional().nullable(),
  objetivos_usuario: z.array(z.object({
    descripcion: textoOpcional(1000),
    estado_actual: textoOpcional(255),
    fecha_inicio: textoOpcional(50),
    fecha_fin: textoOpcional(50),
  })).max(500).optional().nullable(),
  responses: z.record(z.string().max(500), z.union([z.string().max(2000), z.number()])).optional().nullable(),
});

// --- Departamentos ---

const createDepartamentoSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(255, 'Máximo 255 caracteres'),
  descripcion: z.string().max(255, 'Máximo 255 caracteres').optional().nullable(),
});

const updateDepartamentoSchema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(255).optional(),
  descripcion: z.string().max(255).optional().nullable(),
});

// --- Evaluaciones ---

const createEvaluacionSchema = z.object({
  reportId: z.string().min(1, 'Se requiere el ID del reporte'),
});

// --- Param ID ---

const idParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID inválido').transform(Number),
});

module.exports = {
  loginSchema,
  registerSchema,
  createUserSchema,
  updateUserSchema,
  createObjetivoSchema,
  updateObjetivoSchema,
  createRetroalimentacionSchema,
  updateRetroalimentacionSchema,
  reportSchema,
  createDepartamentoSchema,
  updateDepartamentoSchema,
  createEvaluacionSchema,
  idParamSchema,
};
