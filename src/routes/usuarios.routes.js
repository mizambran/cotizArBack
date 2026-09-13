import { Router } from "express";
import usuarioValidacion from '../middlewares/usuarioValidacion.js'
import { crearUsuario, listarUsuarios } from "../controllers/usuarios.controllers.js";


const router = Router()


router.route('/').get(listarUsuarios).post(usuarioValidacion, crearUsuario)

export default router