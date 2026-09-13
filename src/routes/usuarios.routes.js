import { Router } from "express";
import usuarioValidacion from '../middlewares/usuarioValidacion.js'
import { crearUsuario } from "../controllers/usuarios.controllers.js";


const router = Router()

router.route('/').post(usuarioValidacion, crearUsuario)

export default router