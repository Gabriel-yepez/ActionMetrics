const userServices = require("../../services/userServices")
const services = new userServices()
const bcrypt = require("bcrypt");


const registerUser = async (req, res)=>{ 

    try {
        
        const {nombre_usuario} = req.body
        const user = await services.getUserByfield({nombre_usuario})
        if (user) return res.status(400).json({message: "El usuario ya existe"})
        
        const newUser = await services.createUser(req.body)

        res.status(201).json(newUser)
    } catch (error) {
        console.log("error :>> ", error);
        res.status(500).json(error);
    }

}

const loginUser = async (req, res) => {
    try {
      const { nombre_usuario, password } = req.body;
      // Busca el usuario por el usuario.
      const user = await services.getUserByfield({ nombre_usuario });
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    
      // Compara la contraseña enviada en el login con la contraseña hasheada almacenada.
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });
      
      res.status(200).json({ message: "Login exitoso", data: user });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error durante el login", error: error.message });
    }
  };
  
  module.exports = { registerUser, loginUser };