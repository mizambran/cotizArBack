import { isValidObjectId } from "mongoose"
import ModeloAuto from "../models/modeloAuto.model.js"
import VersionAuto from "../models/versionAuto.model.js"




export const listarTablaModVersAuto = async(req, res) => {
    try {
        const id = req.params.id 
        if(!isValidObjectId(id)){
            return res.status(400).json({mensaje:"El id es inválido"})
        }
        const modelosEnc = await ModeloAuto.find({marca_id:id}).lean()
        if(!modelosEnc || modelosEnc.length === 0){
            return res.status(404).json({mensaje:"No se encontraron modelos para la marca seleccionada"})
        }
        const idDeModelosAutos = modelosEnc.map((mod) => mod._id)
        const versionesEnc = await VersionAuto.find({modelo_id: {$in:idDeModelosAutos}}).lean()

        const modelosConVersiones = modelosEnc.map((mod) => {
            return {
                ...mod,
                versiones: versionesEnc.filter((ve) => ve.modelo_id.toString() === mod._id.toString())
            }
        })
        res.status(200).json({results:modelosConVersiones})

    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"Ocurrió algo al intentar listar modelos y versiones para la marca"})
    }
}