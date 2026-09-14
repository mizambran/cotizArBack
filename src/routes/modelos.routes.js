import { Router } from "express";
import { cantModelos, filtrarPorMarca, paginacionModelos } from "../controllers/modelos.controllers.js";



const router = Router()

router.route('/paginacion').get(paginacionModelos)
router.route('/total').get(cantModelos)
router.route('/:id').get(filtrarPorMarca)

export default router