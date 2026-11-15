import { Router } from "express";
import {  listarTablaModVersAuto } from "../controllers/tablaModVersAuto.controllers.js";




const router = Router()

router.route('/:id').get(listarTablaModVersAuto)

export default router