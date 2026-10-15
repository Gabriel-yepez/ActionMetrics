const userServices = require("../../services/userServices")
const services = new userServices()
const bcrypt = require("bcrypt");
const { generateToken, setTokenCookie, clearTokenCookie } = require("../../middleware/authMiddleware");
const { ROL } = require("../../middleware/access");

// Hash de referencia para comparar cuando el usuario no existe: el login tarda lo mismo
// exista o no el usuario, y no se puede averiguar qué nombres de usuario existen.
const DUMMY_HASH = bcrypt.hashSync("actionmetrics-dummy-password", 10);
const CREDENCIALES_INVALIDAS = "Usuario o contraseña incorrectos";


const registerUser = async (req, res)=>{

    try {
        const { nombre_usuario, password, nombre, apellido, email } = req.body

        // Validar campos requeridos
        if (!nombre_usuario || !password || !nombre || !apellido || !email) {
            return res.status(400).json({ ok: false, data: null, message: "Todos los campos son requeridos: nombre_usuario, password, nombre, apellido, email" })
        }

        const user = await services.getUserByfield({nombre_usuario})
        if (user) return res.status(400).json({ ok: false, data: null, message: "El usuario ya existe" })

        // El registro público siempre crea empleados: el rol nunca lo elige el cliente.
        // Gerentes y super admins se crean desde el panel de un administrador.
        const newUser = await services.createUser({ ...req.body, id_rol: ROL.EMPLEADO })

        // Excluir el password de la respuesta
        const { password: _, ...userSinPassword } = newUser.toJSON ? newUser.toJSON() : newUser;

        // Setear token en cookie httpOnly
        const token = generateToken(newUser);
        setTokenCookie(res, token);

        res.status(201).json({
            ok: true,
            data: userSinPassword,
            message: "Registro exitoso"
        })
    } catch (error) {
        console.log("error :>> ", error);
        res.status(500).json({ ok: false, data: null, message: "Error al registrar usuario" });
    }

}

const loginUser = async (req, res) => {
    try {
      const { nombre_usuario, password } = req.body;

      // Validar campos requeridos
      if (!nombre_usuario || !password) {
        return res.status(400).json({ ok: false, data: null, message: "nombre_usuario y password son requeridos" });
      }

      // Busca el usuario por el usuario.
      const user = await services.getUserForLogin(nombre_usuario);

      // Compara la contraseña enviada en el login con la contraseña hasheada almacenada.
      // Mismo mensaje y mismo costo de cómputo tanto si el usuario no existe como si la contraseña falla.
      const isMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
      if (!user || !isMatch) return res.status(401).json({ ok: false, data: null, message: CREDENCIALES_INVALIDAS });

      // Excluir el password del objeto de respuesta
      const { password: _, ...userSinPassword } = user.toJSON ? user.toJSON() : user;

      // Setear token en cookie httpOnly
      const token = generateToken(user);
      setTokenCookie(res, token);

      res.status(200).json({
        ok: true,
        data: userSinPassword,
        message: "Login exitoso"
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ ok: false, data: null, message: "Error durante el login" });
    }
  };

const logoutUser = (req, res) => {
    clearTokenCookie(res);
    res.status(200).json({ ok: true, data: null, message: "Sesión cerrada exitosamente" });
};

const getMe = async (req, res) => {
    try {
      const user = await services.getUserByfield({ id: req.user.id });
      if (!user) {
        return res.status(404).json({ ok: false, data: null, message: "Usuario no encontrado" });
      }
      const { password: _, ...userSinPassword } = user.toJSON ? user.toJSON() : user;
      res.status(200).json({ ok: true, data: userSinPassword, message: "Usuario obtenido exitosamente" });
    } catch (error) {
      console.log("error getMe :>> ", error);
      res.status(500).json({ ok: false, data: null, message: "Error al obtener usuario" });
    }
  };

  module.exports = { registerUser, loginUser, logoutUser, getMe };
