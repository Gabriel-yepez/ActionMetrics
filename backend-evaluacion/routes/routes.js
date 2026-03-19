const { Router }= require ("express");
const { getAllUsers, getByid, createUser, updateUser, deleteUser, getUserCount}= require("../controllers/userControllers");
const { registerUser, loginUser, logoutUser, getMe } = require("../controllers/auth/authControllers");
const { getEvaluacionCount, getAllEvaluacion, createEvaluacion, getEstadisticasGenerales, getEstadisticasUsuario, getUserEvaluationCount, deleteEvaluacion } = require("../controllers/evaluacionController");
const { getAllObjetivos, getObjetivoById, createObjetivo, updateObjetivoEstado, deleteObjetivo } = require("../controllers/objetivoControllers");
const {getReport, getReportWithAI}= require("../controllers/reportControllers");
const { getAllRetroalimentaciones, getRetroalimentacionById, createRetroalimentacion, updateRetroalimentacion, deleteRetroalimentacion, getRetroalimentacionesByUsuario, getRetroalimentacionesByEvaluacion } = require("../controllers/retroalimentacionControllers");
const { uploadDocument, deleteDocument, getDocuments } = require("../controllers/documentController");
const { deleteHabilidad, getHabilidad } = require("../controllers/habilidadControllers");
const { getAllDepartamentos, getDepartamentoById, createDepartamento, updateDepartamento, deleteDepartamento, getDepartamentoCount } = require("../controllers/departamentoControllers");
const upload = require("../middleware/uploadMiddleware");
const { verifyToken, requireAdmin, requireSuperAdmin } = require("../middleware/authMiddleware");
const { validate } = require("../validations/validate");
const {
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
} = require("../validations/schemas");

const router = Router();

    // --- Rutas públicas (sin autenticación) ---
    router.get("/health", (req, res) => {
        res.send("Api is Healthy!!!");
      });

    router.post("/auth/register", validate(registerSchema), registerUser)
    router.post("/auth/login", validate(loginSchema), loginUser)
    router.get("/departamentos/public", getAllDepartamentos)

    // Logout (limpia la cookie)
    router.post("/auth/logout", logoutUser)

    // --- Todas las rutas siguientes requieren autenticación ---
    router.use(verifyToken);

    // Verificar sesión actual
    router.get("/auth/me", getMe);

    // usuarios
    router.get("/usuarios/count", getUserCount)
    router.get("/usuarios", getAllUsers)
    router.get("/usuarios/:id", getByid)
    router.post("/usuarios", requireAdmin, validate(createUserSchema), createUser)
    router.put("/usuarios/:id", requireAdmin, validate(updateUserSchema), updateUser)
    router.delete("/usuarios/:id", requireAdmin, deleteUser)

    //evaluaciones
    router.get("/evaluaciones/count", getEvaluacionCount)
    router.get("/evaluaciones/count/:userId", getUserEvaluationCount)
    router.get("/evaluaciones", getAllEvaluacion)
    router.post("/evaluaciones", requireAdmin, validate(createEvaluacionSchema), createEvaluacion)
    router.get("/evaluaciones/grafica", getEstadisticasGenerales)
    router.get("/evaluaciones/grafica/:idUsuario", getEstadisticasUsuario)
    router.delete("/evaluaciones/:id", requireAdmin, deleteEvaluacion)

    // objetivos
    router.get("/objetivos", getAllObjetivos)
    router.get("/objetivos/:id", getObjetivoById)
    router.post("/objetivos", requireAdmin, validate(createObjetivoSchema), createObjetivo)
    router.put("/objetivos/:id", validate(updateObjetivoSchema), updateObjetivoEstado)
    router.delete("/objetivos/:id", requireAdmin, deleteObjetivo)

    // reportes
    router.get("/reportes", getReport)
    router.post("/reportes", getReport)
    router.post("/reportes/ai", getReportWithAI)

    // retroalimentaciones
    router.get("/retroalimentacion", getAllRetroalimentaciones)
    router.get("/retroalimentacion/:id", getRetroalimentacionById)
    router.post("/retroalimentacion", validate(createRetroalimentacionSchema), createRetroalimentacion)
    router.put("/retroalimentacion/:id", updateRetroalimentacion)
    router.delete("/retroalimentacion/:id", requireAdmin, deleteRetroalimentacion)
    router.get("/retroalimentacion/usuario/:idUsuario", getRetroalimentacionesByUsuario)
    router.get("/retroalimentacion/evaluacion/:idEvaluacion", getRetroalimentacionesByEvaluacion)

    // documentos
    router.post("/documentos", upload.single('document'), uploadDocument)
    router.get("/documentos", getDocuments)
    router.delete("/documentos/:fileName", requireAdmin, deleteDocument)

    // habilidades
    router.delete("/habilidades/:id", requireAdmin, deleteHabilidad)
    router.get("/habilidades", getHabilidad)

    // departamentos (CRUD solo super admin)
    router.get("/departamentos/count", getDepartamentoCount)
    router.get("/departamentos", getAllDepartamentos)
    router.get("/departamentos/:id", getDepartamentoById)
    router.post("/departamentos", requireSuperAdmin, validate(createDepartamentoSchema), createDepartamento)
    router.put("/departamentos/:id", requireSuperAdmin, validate(updateDepartamentoSchema), updateDepartamento)
    router.delete("/departamentos/:id", requireSuperAdmin, deleteDepartamento)

module.exports= router;
