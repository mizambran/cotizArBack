import { isValidObjectId } from "mongoose";
import Valuacion from "../models/valuacion.model.js";


export const buscarValuacionesPorId = async(req, res) => {
    try {
        const id = req.params.id
        if(!isValidObjectId(id)){
            return res.status(400).json({mensaje:"El id de la versión no es válido"})
        }
        const valuacionesEncontradas = await Valuacion.find({version_id:id})
        if(!valuacionesEncontradas){
            return res.status(404).json({mensaje:"No se encontraron valuaciones para esta versión"})
        }
        res.status(200).json(valuacionesEncontradas)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo buscar valuaciones"})
    }
}