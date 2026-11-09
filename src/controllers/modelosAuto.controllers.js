import { isValidObjectId } from "mongoose"
import ModeloAuto from "../models/modeloAuto.model.js"




export const modelosPaginado = async(req, res) => {
    try {
        if(req.query.limit > 100){
            return res.status(400).json({mensaje:"Baja el limit"})
        }
        let page = req.query.page || 1
        let limit = req.query.limit || 100
        let skip = (page - 1) * limit
        const [modelos, cantModelos] = await Promise.all([
            ModeloAuto.find().skip(skip).limit(limit), ModeloAuto.countDocuments()
        ])
        res.status(200).json({
            results: modelos,
            paginaActual: page,
            totalPaginas: Math.ceil(cantModelos / limit)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"Algo salió mal al paginar modelos de autos"})
    }
}

export const filtrarPorMarca = async(req, res) => {
    try {
        const id = req.params.id
        if(!isValidObjectId(id)){
            return res.status(400).json({mensaje:"El id es inválido"})
        }
        const modelosPorMarca = await ModeloAuto.find({marca_id: id}).lean()
        if(!modelosPorMarca || modelosPorMarca.length === 0){
            return res.status(404).json({mensaje:"No se encontraron marcas de este modelo"})
        }
        res.status(200).json(modelosPorMarca)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo listar marcas de este modelo"})
    }
}