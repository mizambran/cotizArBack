import { genSaltSync, hashSync } from 'bcrypt'
import Usuario from '../models/usuario.model.js'


export const crearUsuario = async(req,res) => {
  try {
    const existeElUsuario = await Usuario.findOne({email:req.body.email})
    if(existeElUsuario){
      return res.status(400).json({mensaje:"Ya existe un usuario con este email"})
    }
    if(req.body.rol === "admin"){
      return res.status(401).json({mensaje:"Solicitar permisos al administrador"})
    } 
    const saltos = genSaltSync(10)
    req.body.password = hashSync(req.body.password, saltos)
    const nuevoUsuario = new Usuario(req.body)
    await nuevoUsuario.save()
    res.status(201).json({mensaje:"Nuevo usuario creado!"})
  } catch (error) {
    console.error(error)
    res.status(500).json({mensaje:"No se pudo crear el usuario"})
  }
}