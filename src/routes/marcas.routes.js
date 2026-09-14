import { Router } from "express";
import { cantMarcas,  paginacionMarcas } from "../controllers/marcas.controllers.js";



const router = Router()

router.route('/paginacion').get(paginacionMarcas)
router.route('/total').get(cantMarcas)

export default router