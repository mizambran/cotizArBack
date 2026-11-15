import { Router } from "express";
import {buscarPorPresupuestoAuto} from '../controllers/presupuestoAuto.controllers.js'


const router = Router()

router.route('/').get(buscarPorPresupuestoAuto)

export default router