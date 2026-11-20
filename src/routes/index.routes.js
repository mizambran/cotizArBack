import { Router } from "express";
import marcasRoutes from './marcas.routes.js'
import usuariosRoutes from './usuarios.routes.js'
import modelosRoutes from './modelos.routes.js'
import versionesRoutes from './versiones.routes.js'
import valuacionesRoutes from './valuaciones.routes.js'
import sincronizarRoutes from './sincronizar.routes.js'
import tablaModVersRouter from './tablaModVers.routes.js'
import tablaModVersAutoRouter from './tablaModVersAuto.route.js'
import marcasAutoRoutes from './marcasAuto.routes.js'
import modelosAutoRoutes from './modelosAuto.route.js'
import valuacionesAutoRoutes from './valuacionesAuto.route.js'
import presupuestoAutoRoutes from './presupuestoAuto.routes.js'
import compararAutoRoutes from './comparadorAutos.routes.js'
import comparadorMotosRouter from './comparadorMotos.routes.js'
import presupuestoMotoRouter from './presupuestoMoto.routes.js'


const router = Router()

router.use('/usuarios', usuariosRoutes)
router.use('/marcas', marcasRoutes)
router.use('/modelos', modelosRoutes)
router.use('/versiones', versionesRoutes)
router.use('/valuaciones', valuacionesRoutes)
router.use('/sync', sincronizarRoutes)
router.use('/tabla', tablaModVersRouter)
router.use('/comparador', comparadorMotosRouter)
router.use('/presupuesto', presupuestoMotoRouter)
router.use('/autos/tabla', tablaModVersAutoRouter)
router.use('/autos/marcas', marcasAutoRoutes)    
router.use('/autos/modelos', modelosAutoRoutes)    
router.use('/autos/valuaciones', valuacionesAutoRoutes)
router.use('/autos/presupuesto', presupuestoAutoRoutes)
router.use('/autos/comparador', compararAutoRoutes)

export default router