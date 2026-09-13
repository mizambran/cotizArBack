import { Router } from "express";
import marcasRoutes from './marcas.routes.js'
import usuariosRoutes from './usuarios.routes.js'
import modelosRoutes from './modelos.routes.js'
import versionesRoutes from './versiones.routes.js'
import valuacionesRoutes from './valuaciones.routes.js'
import sincronizarRoutes from './sincronizar.routes.js'

const router = Router()

router.use('/usuarios', usuariosRoutes)
router.use('/marcas', marcasRoutes)
router.use('/modelos', modelosRoutes)
router.use('/versiones', versionesRoutes)
router.use('/valuaciones', valuacionesRoutes)
router.use('/sync', sincronizarRoutes)

export default router