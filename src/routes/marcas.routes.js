import { Router } from "express";
import { cantMarcas,  listarMarcasMotoPaginado } from "../controllers/marcas.controllers.js";



const router = Router()

router.route('/paginacion').get(listarMarcasMotoPaginado)
router.route('/total').get(cantMarcas)

export default router