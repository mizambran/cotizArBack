import { isValidObjectId } from "mongoose";
import Modelo from "../models/modelo.model.js";


export const cantModelos = async(req, res) =>{
    try {
        const totalModelos = await Modelo.countDocuments()
        res.status(200).json(totalModelos)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo obtener el total de modelos"})
    }
}

export const paginacionModelos = async(req, res) => {
    try {
        if(req.query.limit > 100){
            return res.status(400).json({mensaje:"El limit no puede ser mayor a 100"})
        }
        let page = req.query.page || 1
        let limit = req.query.limit || 20
        let skip = (page - 1) * limit 
        const [modelos, cantModelos] = await Promise.all([
            Modelo.find().skip(skip).limit(limit),
            Modelo.countDocuments()
        ])
        res.status(200).json({
            results:modelos,
            paginaActual:page,
            totalPaginas:Math.ceil(cantModelos / limit)
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo paginar los modelos"})
    }
}

export const filtrarPorMarca = async(req, res) => {
    try {
        const id = req.params.id
        if(!isValidObjectId(id)){
            return res.status(400).json({mensaje:"El id que buscas es inválido"})
        }
        const modelosEncontrados = await Modelo.find({marca_id:id}).lean()
        if(!modelosEncontrados || modelosEncontrados.length === 0){
            return res.status(404).json({mensaje:"No se encontraron los modelos que buscas"})
        }
        res.status(200).json(modelosEncontrados)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudieron buscar los modelos que necesitas"})
    }
}