import { Router } from "express";
import {compararVehiculosMoto} from '../controllers/comparadorMotos.controllers.js'



const router = Router()

router.route('/').get(compararVehiculosMoto)

export default router