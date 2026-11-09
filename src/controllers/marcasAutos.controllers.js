import MarcaAuto from "../models/marcaAuto.model.js"


/* export const listarMarcas = async(req, res) => {
    try {
        const marcasAutoEnc = await MarcaAuto.find().lean()
        res.status(200).json(marcasAutoEnc)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"Ocurrió algo al intentar listar las marcas de autos"})
    }
} */


export const marcasAutoPaginado = async(req, res) => {
    try {
        if(req.query.limit > 100){
            return res.status(400).json({mensaje:"Baja un poco el limit"})
        }
        let page = req.query.page || 1
        let limit = req.query.limit || 10
        const skip = (page - 1) * limit
        const [marcas, cantMarcas] = await Promise.all([
            MarcaAuto.find().skip(skip).limit(limit), MarcaAuto.countDocuments()
        ])
        res.status(200).json({
            results: marcas,
            paginaActual: page,
            TotalPaginas: Math.ceil(cantMarcas / limit),
            cantidadMarcas:cantMarcas
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"Ocurrió algo al intentar paginar las marcas"})
    }
}