const { Router }= require ("express");
const { getAllUsers, getByid, createUser, updateUser, deleteUser, getUserCount}= require("../controllers/userControllers");
const { registerUser, loginUser } = require("../controllers/auth/authControllers");
const { getEvaluacionCount, getAllEvaluacion, createEvaluacion, getEstadisticasGenerales, getEstadisticasUsuario, getUserEvaluationCount, deleteEvaluacion } = require("../controllers/evaluacionController");
const { getAllObjetivos, getObjetivoById, createObjetivo, updateObjetivoEstado, deleteObjetivo } = require("../controllers/objetivoControllers");
const {getReport, getReportWithAI}= require("../controllers/reportControllers");
const { getAllRetroalimentaciones, getRetroalimentacionById, createRetroalimentacion, updateRetroalimentacion, deleteRetroalimentacion, getRetroalimentacionesByUsuario, getRetroalimentacionesByEvaluacion } = require("../controllers/retroalimentacionControllers");
const { uploadDocument, deleteDocument, getDocuments } = require("../controllers/documentController");
const { deleteHabilidad, getHabilidad } = require("../controllers/habilidadControllers");
const upload = require("../middleware/uploadMiddleware");

const router = Router();

    router.get("/health", (req, res) => {
        res.send("Api is Healthy!!!");
      });

    // auth
    router.post("/auth/register", registerUser)
    router.post("/auth/login", loginUser)
    
    // usuarios
    router.get("/usuarios/count", getUserCount)
    router.get("/usuarios", getAllUsers)
    router.get("/usuarios/:id", getByid)
    router.post("/usuarios", createUser)
    router.put("/usuarios/:id", updateUser)
    router.delete("/usuarios/:id", deleteUser)

    //evaluaciones
    router.get("/evaluaciones/count", getEvaluacionCount)
    router.get("/evaluaciones/count/:userId", getUserEvaluationCount)
    router.get("/evaluaciones", getAllEvaluacion)
    router.post("/evaluaciones", createEvaluacion)
    router.get("/evaluaciones/grafica", getEstadisticasGenerales)
    router.get("/evaluaciones/grafica/:idUsuario", getEstadisticasUsuario)
    router.delete("/evaluaciones/:id", deleteEvaluacion)
    // objetivos
    router.get("/objetivos", getAllObjetivos)
    router.get("/objetivos/:id", getObjetivoById)
    router.post("/objetivos", createObjetivo)
    router.put("/objetivos/:id", updateObjetivoEstado)  
    router.delete("/objetivos/:id", deleteObjetivo)

    // reportes
    router.get("/reportes", getReport)
    router.post("/reportes", getReport)
    router.post("/reportes/ai", getReportWithAI)
    
    // retroalimentaciones
    router.get("/retroalimentacion", getAllRetroalimentaciones)
    router.get("/retroalimentacion/:id", getRetroalimentacionById)
    router.post("/retroalimentacion", createRetroalimentacion)
    router.put("/retroalimentacion/:id", updateRetroalimentacion)
    router.delete("/retroalimentacion/:id", deleteRetroalimentacion)
    router.get("/retroalimentacion/usuario/:idUsuario", getRetroalimentacionesByUsuario)
    router.get("/retroalimentacion/evaluacion/:idEvaluacion", getRetroalimentacionesByEvaluacion)
    
    // documentos
    router.post("/documentos", upload.single('document'), uploadDocument)
    router.get("/documentos", getDocuments)
    router.delete("/documentos/:fileName", deleteDocument)
    
    // habilidades
    router.delete("/habilidades/:id", deleteHabilidad)
    router.get("/habilidades", getHabilidad)
    module.exports= router;
