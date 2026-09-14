import { Router } from "express";
import { buscarValuacionesPorId } from "../controllers/valuaciones.controllers.js";




const router = Router()

router.route('/:id').get(buscarValuacionesPorId)

export default router