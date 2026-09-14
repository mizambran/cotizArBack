import Marca from '../models/marca.model.js'

export const cantMarcas = async(req, res) => {
    try {
        const totalMarcas = await Marca.countDocuments()
        res.status(200).json(totalMarcas)
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo obtener el total de marcas"})
    }
}

export const paginacionMarcas = async(req, res) => {
    try {
    if(req.query.limit > 100){
        return res.status(400).json({mensaje:"El limit no debe ser mayor a 100"})
    }
    let page = req.query.page || 1
    let limit = req.query.limit || 10
    let skip = (page - 1) * limit
    const [marcas, cantMarcas] = await Promise.all([
        Marca.find().skip(skip).limit(limit), Marca.countDocuments() 
    ])        
    res.status(200).json({
        results:marcas,
        paginaActual:page,
        totalPaginas:Math.ceil(cantMarcas / limit)
    })
    } catch (error) {
        console.error(error)
        res.status(500).json({mensaje:"No se pudo paginar las marcas"})
    }
}