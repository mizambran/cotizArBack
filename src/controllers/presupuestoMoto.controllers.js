import Valuacion from "../models/valuacion.model.js";
 

export const buscarPorPresupuestoMoto = async (req, res) => {
  try {
    const {
      presupuesto,
      marca = "",
      modelo = "",
      version = "",
      page = 1,
      limit = 20,
      sortBy = "precioFinal",
      sortOrder = "desc",
    } = req.query;

    const paginaActual = Math.max(1, parseInt(page));
    const limitePorPagina = parseInt(limit);
    const salto = (paginaActual - 1) * limitePorPagina;

    const pipeline = [
      { $match: { price: { $gt: 0 } } },
      {
        $addFields: {
          precioFinal: { $multiply: ["$price", "$exchange_rate"] },
        },
      },
    ];

    if (presupuesto && Number(presupuesto) > 0) {
      pipeline.push({
        $match: {
          precioFinal: { $lte: Number(presupuesto) },
        },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "versions",
          localField: "version_id",
          foreignField: "_id",
          as: "versionInfo",
        },
      },
      { $unwind: "$versionInfo" },
      {
        $lookup: {
          from: "modelos",
          localField: "versionInfo.modelo_id",
          foreignField: "_id",
          as: "modeloInfo",
        },
      },
      { $unwind: "$modeloInfo" },
      {
        $lookup: {
          from: "marcas",
          localField: "modeloInfo.marca_id",
          foreignField: "_id",
          as: "marcaInfo",
        },
      },
      { $unwind: "$marcaInfo" }
    );

    const matchTexto = {};
    if (marca.trim() !== "") {
      matchTexto["marcaInfo.nombre"] = { $regex: marca.trim(), $options: "i" };
    }
    if (modelo.trim() !== "") {
      matchTexto["modeloInfo.nombre"] = { $regex: modelo.trim(), $options: "i" };
    }
    if (version.trim() !== "") {
      matchTexto["versionInfo.nombre"] = { $regex: version.trim(), $options: "i" };
    }

    if (Object.keys(matchTexto).length > 0) {
      pipeline.push({ $match: matchTexto });
    }

    const columnasPermitidas = {
      marca: "marcaNombre",
      modelo: "modeloNombre",
      version: "versionNombre",
      year: "year",
      precioFinal: "precioFinal",
    };

    const campoOrden = columnasPermitidas[sortBy] || "precioFinal";
    const direccionOrden = sortOrder === "asc" ? 1 : -1;

    pipeline.push(
      {
        $project: {
          _id: 1,
          year: 1,
          precioFinal: 1,
          versionId: "$versionInfo._id",
          versionNombre: "$versionInfo.nombre",
          modeloNombre: "$modeloInfo.nombre",
          marcaNombre: "$marcaInfo.nombre",
        },
      },
      { $sort: { [campoOrden]: direccionOrden, _id: 1 } },
      {
        $facet: {
          resultados: [{ $skip: salto }, { $limit: limitePorPagina }],
          totalDocumentos: [{ $count: "total" }],
        },
      }
    );

    const [respuesta] = await Valuacion.aggregate(pipeline);

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
    console.error("Error en buscarPorPresupuestoMoto:", error);
    res.status(500).json({ mensaje: "Error al filtrar motos por presupuesto" });
  }
};