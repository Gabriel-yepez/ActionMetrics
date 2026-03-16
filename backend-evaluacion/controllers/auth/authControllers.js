const userServices = require("../../services/userServices")
const services = new userServices()
const bcrypt = require("bcrypt");
const { generateToken, setTokenCookie, clearTokenCookie } = require("../../middleware/authMiddleware");


const registerUser = async (req, res)=>{

    try {
        const { nombre_usuario, password, nombre, apellido, email } = req.body

        // Validar campos requeridos
        if (!nombre_usuario || !password || !nombre || !apellido || !email) {
            return res.status(400).json({ ok: false, data: null, message: "Todos los campos son requeridos: nombre_usuario, password, nombre, apellido, email" })
        }

        const user = await services.getUserByfield({nombre_usuario})
        if (user) return res.status(400).json({ ok: false, data: null, message: "El usuario ya existe" })

        const newUser = await services.createUser(req.body)

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
      const user = await services.getUserByfield({ nombre_usuario });
      if (!user) return res.status(404).json({ ok: false, data: null, message: "Usuario no encontrado" });

      // Compara la contraseña enviada en el login con la contraseña hasheada almacenada.
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ ok: false, data: null, message: "Contraseña incorrecta" });

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

  module.exports = { registerUser, loginUser, logoutUser };
