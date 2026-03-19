import { z } from 'zod';

// --- Auth ---

export const loginSchema = z.object({
  usuario: z.string().min(1, 'required'),
  password: z.string().min(1, 'required'),
});

export const registerSchema = z.object({
  nombre: z.string().min(1, 'required'),
  apellido: z.string().min(1, 'required'),
  usuario: z.string().min(3, 'minLength'),
  password: z.string().min(6, 'minLengthPassword'),
  email: z.string().email('invalidEmail'),
  cedula: z.string().min(1, 'required').regex(/^\d+$/, 'onlyNumbers'),
  rol: z.string().min(1, 'required'),
  departamento: z.string().optional(),
});

// --- Crear usuario (panel personal) ---

export const createUserSchema = z.object({
  nombre: z.string().min(1, 'required'),
  apellido: z.string().min(1, 'required'),
  nombre_usuario: z.string().min(3, 'minLength'),
  password: z.string().min(6, 'minLengthPassword'),
  email: z.string().email('invalidEmail'),
  ci: z.string().min(1, 'required').regex(/^\d+$/, 'onlyNumbers'),
  id_rol: z.string().min(1, 'required'),
  id_departamento: z.string().optional(),
});

// --- Objetivos ---

export const createObjetivoSchema = z.object({
  descripcion: z.string().min(1, 'required'),
  fechaInicio: z.string().min(1, 'required'),
  fechaFin: z.string().min(1, 'required'),
  userId: z.union([z.string(), z.number()]).optional(),
}).refine(data => {
  if (!data.fechaInicio || !data.fechaFin) return true;
  return new Date(data.fechaFin) >= new Date(data.fechaInicio);
}, {
  message: 'endDateBeforeStart',
  path: ['fechaFin'],
});

// --- Departamentos ---

export const departamentoSchema = z.object({
  nombre: z.string().min(1, 'required').min(2, 'minLength'),
  descripcion: z.string().optional(),
});

// --- Retroalimentación ---

export const retroalimentacionSchema = z.object({
  comentario: z.string().min(1, 'required'),
});
