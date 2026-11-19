import { Router } from "express";
import { compararVehiculosAuto } from "../controllers/comparadorAutos.controllers.js";



const router = Router()

router.route('/').get(compararVehiculosAuto)

export default router