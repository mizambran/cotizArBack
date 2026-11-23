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

export const listarMarcasAutoPaginado = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;

    const paginaActual = Math.max(1, parseInt(page));
    const limitePorPagina = parseInt(limit);
    const salto = (paginaActual - 1) * limitePorPagina;

    const pipeline = [];

    // 1. Si hay texto de búsqueda, filtramos primero
    if (search.trim() !== "") {
      pipeline.push({
        $match: {
          nombre: { $regex: search.trim(), $options: "i" },
        },
      });
    }

    // 2. Unimos con modeloautos para contar cuántos modelos tiene cada marca
    pipeline.push(
      {
        $lookup: {
          from: "modeloautos",
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

    const [respuesta] = await MarcaAuto.aggregate(pipeline);

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
    console.error("Error en listarMarcasAutoPaginado:", error);
    res.status(500).json({ mensaje: "Error al listar las marcas de autos" });
  }
};