const userServices = require("../../services/userServices")
const services = new userServices()
const bcrypt = require("bcrypt");


const registerUser = async (req, res)=>{

    try {
        const { nombre_usuario, password, nombre, apellido, email } = req.body

        // Validar campos requeridos
        if (!nombre_usuario || !password || !nombre || !apellido || !email) {
            return res.status(400).json({ message: "Todos los campos son requeridos: nombre_usuario, password, nombre, apellido, email" })
        }

        const user = await services.getUserByfield({nombre_usuario})
        if (user) return res.status(400).json({message: "El usuario ya existe"})

        const newUser = await services.createUser(req.body)

        // Excluir el password de la respuesta
        const { password: _, ...userSinPassword } = newUser.toJSON ? newUser.toJSON() : newUser;
        res.status(201).json(userSinPassword)
    } catch (error) {
        console.log("error :>> ", error);
        res.status(500).json({ message: "Error al registrar usuario", error: error.message });
    }

}

const loginUser = async (req, res) => {
    try {
      const { nombre_usuario, password } = req.body;

      // Validar campos requeridos
      if (!nombre_usuario || !password) {
        return res.status(400).json({ message: "nombre_usuario y password son requeridos" });
      }

      // Busca el usuario por el usuario.
      const user = await services.getUserByfield({ nombre_usuario });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
      // Compara la contraseña enviada en el login con la contraseña hasheada almacenada.
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });
      
      // Excluir el password del objeto de respuesta
      const { password: _, ...userSinPassword } = user.toJSON ? user.toJSON() : user;
      res.status(200).json({ message: "Login exitoso", data: userSinPassword });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error durante el login", error: error.message });
    }
  };
  
  module.exports = { registerUser, loginUser };