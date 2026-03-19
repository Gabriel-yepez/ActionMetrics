const { z } = require('zod');

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
  ci: z.number({ invalid_type_error: 'La cédula debe ser un número' }).int('Debe ser un número entero').positive('Debe ser positivo'),
  id_rol: z.number().int().min(1).max(3).optional(),
  id_departamento: z.number().int().positive().optional().nullable(),
});

// --- Usuarios ---

const createUserSchema = z.object({
  nombre_usuario: z.string().min(3, 'Mínimo 3 caracteres').max(50, 'Máximo 50 caracteres'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').max(100, 'Máximo 100 caracteres'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  apellido: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  email: z.string().email('Email inválido').max(255, 'Máximo 255 caracteres'),
  ci: z.number({ invalid_type_error: 'La cédula debe ser un número' }).int().positive('Debe ser positivo'),
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

const createObjetivoSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es requerida').max(255, 'Máximo 255 caracteres'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'La fecha de fin es requerida'),
  estado_actual: z.string().max(255).optional(),
  estado_deseado: z.string().max(255).optional(),
  id_usuario: z.number().int().positive(),
  id_tipo_objetivo: z.number().int().min(1).max(2),
}).refine(data => new Date(data.fecha_fin) >= new Date(data.fecha_inicio), {
  message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
  path: ['fecha_fin'],
});

const updateObjetivoSchema = z.object({
  estado_actual: z.string().max(255).optional(),
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
  createDepartamentoSchema,
  updateDepartamentoSchema,
  createEvaluacionSchema,
  idParamSchema,
};
