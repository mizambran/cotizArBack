import { Router } from "express";
import {  marcasAutoPaginado } from "../controllers/marcasAutos.controllers.js";



const router = Router()

router.route('/paginacion').get(marcasAutoPaginado)

export default router

