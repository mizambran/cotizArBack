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

export const listarMarcasMotoPaginado = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

    const paginaActual = Math.max(1, parseInt(page));
    const limitePorPagina = parseInt(limit);
    const salto = (paginaActual - 1) * limitePorPagina;

    const pipeline = [];

    if (search.trim() !== "") {
      pipeline.push({
        $match: {
          nombre: { $regex: search.trim(), $options: "i" },
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "modelos",
          localField: "_id",
          foreignField: "marca_id",
          as: "modelosAsociados",
        },
      },
      {
        $project: {
          _id: 1,
          nombre: 1,
          cantidadModelos: { $size: "$modelosAsociados" },
        },
      },
      { $sort: { nombre: 1 } },
      {
        $facet: {
          resultados: [{ $skip: salto }, { $limit: limitePorPagina }],
          totalDocumentos: [{ $count: "total" }],
        },
      }
    );

    const [respuesta] = await Marca.aggregate(pipeline);

    const resultados = respuesta?.resultados || [];
    const total = respuesta?.totalDocumentos[0]?.total || 0;
    const totalPaginas = Math.ceil(total / limitePorPagina);

    res.status(200).json({
      results: resultados,
      paginaActual,
      totalPaginas,
      totalRegistros: total,
    });
  } catch (error) {
    console.error("Error en listarMarcasMotoPaginado:", error);
    res.status(500).json({ mensaje: "Error al listar las marcas de motos" });
  }
};