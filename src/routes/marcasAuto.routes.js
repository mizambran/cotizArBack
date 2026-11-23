import { Router } from "express";
import {  listarMarcasAutoPaginado } from "../controllers/marcasAutos.controllers.js";



const router = Router()

router.route('/paginacion').get(listarMarcasAutoPaginado)

export default router

