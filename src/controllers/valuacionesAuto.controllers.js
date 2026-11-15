import { isValidObjectId } from "mongoose"
import ValuacionAuto from "../models/valuacionAuto.model.js"




export const buscarValuacionPorId = async(req, res) => {
    try {
        const id = req.params.id
        if(!isValidObjectId(id)){
            return res.status(400).json({mensaje:"El id es inválido"})
        }
        const valuacionesEnc = await ValuacionAuto.find({version_id: id}).lean()
        if(!valuacionesEnc || valuacionesEnc.length === 0){
            return res.status(404).json({mensaje:"No se encontraron valuaciones para esta versión"})
        }
        res.status(200).json(valuacionesEnc)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo listar las cotizaciones"})
    }
}