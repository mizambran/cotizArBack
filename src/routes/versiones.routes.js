import { Router } from "express";
import { buscarVersionPorModelo, cantVersiones, paginacionVersiones } from "../controllers/versiones.controllers.js";



const router = Router()

router.route('/total').get(cantVersiones)
router.route('/paginacion').get(paginacionVersiones)
router.route('/:id').get(buscarVersionPorModelo)

export default router