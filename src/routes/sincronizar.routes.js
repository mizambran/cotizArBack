import { Router } from "express";
import { sincronizarMarcas, sincronizarModelos } from "../services/motos.services.js";




const router = Router()

router.route('/marcas').get(async(req, res) => {
    try {
    // 1. Llamamos a tu servicio que hace todo el trabajo pesado
    const resultados = await sincronizarMarcas();
    
    // 2. Usamos res.json() para cerrarle la petición a Postman y mandarle la data
    res.status(200).json({
      exito: true,
      total_sincronizado: resultados.length,
      datos: resultados
    });
  } catch (error) {
    // Si algo explota en el servicio, Postman recibe el error en formato JSON
    res.status(500).json({
      exito: false,
      mensaje: "Fallo en la sincronización de marcas",
      error: error.message
    });
  }
})



export default router 