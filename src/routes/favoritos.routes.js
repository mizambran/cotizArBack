import { Router } from "express";
import { crearFavorito, eliminarFavorito, listarFavoritos } from "../controllers/favoritos.controllers.js";




const router = Router()

router.route('/').get(listarFavoritos).post(crearFavorito)
router.route('/:id').delete(eliminarFavorito)

export default router