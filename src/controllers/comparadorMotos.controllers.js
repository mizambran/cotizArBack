import mongoose, { isValidObjectId } from "mongoose";
import Valuacion from "../models/valuacion.model.js"; // Ajustá el nombre de tu modelo de valuaciones de motos si varía

export const compararVehiculosMoto = async (req, res) => {
  try {
    const { ids } = req.query; // Ej: "6ab89...,6ab90..."

    if (!ids) {
      return res.status(400).json({ mensaje: "Debés enviar al menos un ID de versión para comparar." });
    }

    const listaIds = ids.split(",").map((id) => id.trim()).filter(Boolean);

    if (listaIds.length === 0 || listaIds.length > 4) {
      return res.status(400).json({ mensaje: "Podés comparar entre 1 y 4 motos como máximo." });
    }

    const idsValidos = listaIds
      .filter((id) => isValidObjectId(id))
      .map((id) => new mongoose.Types.ObjectId(id));

    if (idsValidos.length !== listaIds.length) {
      return res.status(400).json({ mensaje: "Uno o más IDs enviados tienen formato inválido." });
    }

    const pipeline = [
      {
        $match: {
          version_id: { $in: idsValidos },
          price: { $gt: 0 },
        },
      },
      {
        $addFields: {
          precioFinal: { $multiply: ["$price", "$exchange_rate"] },
        },
      },
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
      { $unwind: "$marcaInfo" },
      { $sort: { year: 1 } },
      {
        $group: {
          _id: "$version_id",
          marcaNombre: { $first: "$marcaInfo.nombre" },
          modeloNombre: { $first: "$modeloInfo.nombre" },
          versionNombre: { $first: "$versionInfo.nombre" },
          historico: {
            $push: {
              year: "$year",
              precio: "$precioFinal",
            },
          },
        },
      },
    ];

    const motosAgrupadas = await Valuacion.aggregate(pipeline);

    const analisisMotos = motosAgrupadas.map((moto) => {
      const historialConDevaluacion = [];
      let sumaDevaluaciones = 0;
      let cantidadTramos = 0;

      const histDesc = [...moto.historico].sort((a, b) => b.year - a.year);

      for (let i = 0; i < histDesc.length; i++) {
        const actual = histDesc[i];
        const siguienteMasViejo = histDesc[i + 1];

        let variacionPorcentual = null;

        if (siguienteMasViejo && actual.precio > 0) {
          const diferencia = siguienteMasViejo.precio - actual.precio;
          variacionPorcentual = Number(((diferencia / actual.precio) * 100).toFixed(2));
          sumaDevaluaciones += variacionPorcentual;
          cantidadTramos++;
        }

        historialConDevaluacion.push({
          year: actual.year,
          precio: actual.precio,
          variacionRespectoAlAnterior: variacionPorcentual,
        });
      }

      const devaluacionPromedio =
        cantidadTramos > 0 ? Number((sumaDevaluaciones / cantidadTramos).toFixed(2)) : 0;

      return {
        versionId: moto._id,
        etiquetaCompleta: `${moto.marcaNombre} ${moto.modeloNombre} ${moto.versionNombre}`,
        marcaNombre: moto.marcaNombre,
        modeloNombre: moto.modeloNombre,
        versionNombre: moto.versionNombre,
        precioMasReciente: histDesc[0]?.precio || 0,
        anioMasReciente: histDesc[0]?.year || null,
        devaluacionPromedioAnual: devaluacionPromedio,
        detalleAnual: historialConDevaluacion,
      };
    });

    let sugerenciaCompra = null;
    if (analisisMotos.length > 0) {
      const ordenadosPorRetencion = [...analisisMotos].sort(
        (a, b) => b.devaluacionPromedioAnual - a.devaluacionPromedioAnual
      );
      sugerenciaCompra = ordenadosPorRetencion[0];
    }

    res.status(200).json({
      vehiculos: analisisMotos,
      sugerencia: sugerenciaCompra,
    });
  } catch (error) {
    console.error("Error en compararVehiculosMoto:", error);
    res.status(500).json({ mensaje: "Ocurrió un error al generar la comparativa de motos." });
  }
};