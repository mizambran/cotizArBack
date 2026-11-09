import { Router } from "express";
import { filtrarPorMarca, modelosPaginado } from "../controllers/modelosAuto.controllers.js";




const router = Router()

router.route('/paginacion').get(modelosPaginado)
router.route('/:id').get(filtrarPorMarca)

export default router