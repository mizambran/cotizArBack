import { Router } from "express";
import {buscarPorPresupuestoMoto} from '../controllers/presupuestoMoto.controllers.js'


const router = Router()

router.route('/').get(buscarPorPresupuestoMoto)

export default router