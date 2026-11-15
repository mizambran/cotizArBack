import { Router } from "express";
import {buscarValuacionPorId} from '../controllers/valuacionesAuto.controllers.js'


const router = Router()

router.route('/:id').get(buscarValuacionPorId)

export default router