import { isValidObjectId } from "mongoose";
import Version from "../models/version.model.js";


export const cantVersiones = async(req, res) => {
    try {
        const totalVersiones = Version.countDocuments()
        res.status(200).json(totalVersiones)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo calcular el total de versiones"})
    }
}

export const paginacionVersiones = async(req, res) => {
    try {
        if(req.query.limit > 100){
            return res.status(400).json({mensaje:"El limit no puede ser mayor a 100"})
        }
        let page = req.query.page || 1
        let limit = req.query.limit || 20
        let skip = (page -1) * limit
        const [versiones, cantVersiones] = await Promise.all([
            Version.find().skip(skip).limit(limit),
            Version.countDocuments()
        ])
        res.status(200).json({
            results:versiones,
            paginaActual:page,
            totalPaginas: Math.ceil(cantVersiones / limit)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo paginar las versiones"})
    }
}

export const buscarVersionPorModelo = async(req, res) => {
    try {
        const id = req.params.id
        if(!isValidObjectId(id)){
            return res.status(400).json({mensaje:"El id del modelo es inválido"})
        }
        const versionesEncontradas = await Version.find({modelo_id:id}).lean()
        if(!versionesEncontradas || versionesEncontradas.length === 0){
            return res.status(404).json({mensaje:"No se encontró la versión que estas buscando"})
        }
        res.status(200).json(versionesEncontradas)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo buscar la versión que buscas"})
    }
}