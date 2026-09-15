import { Router } from "express";
import { listarModYVersion } from "../controllers/tablaModVers.controllers.js";



const router = Router()

router.route('/:id').get(listarModYVersion)

export default router