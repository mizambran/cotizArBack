import mongoose, { isValidObjectId } from "mongoose";
import ValuacionAuto from "../models/valuacionAuto.model.js";

export const compararVehiculosAuto = async (req, res) => {
    try {
        // Ej: "6ab89...,6ab90..."
      const { ids } = req.query; 

    if (!ids) {
      return res.status(400).json({ mensaje: "Debés enviar al menos un ID de versión para comparar." });
    }

    const listaIds = ids.split(",").map((id) => id.trim()).filter(Boolean);

    if (listaIds.length === 0 || listaIds.length > 4) {
      return res.status(400).json({ mensaje: "Podés comparar entre 1 y 4 vehículos como máximo." });
    }

    // Validamos que todos sean ObjectIds reales
    const idsValidos = listaIds.filter((id) => isValidObjectId(id)).map((id) => new mongoose.Types.ObjectId(id));

    if (idsValidos.length !== listaIds.length) {
      return res.status(400).json({ mensaje: "Uno o más IDs enviados tienen formato inválido." });
    }

    // Pipeline para traer todas las valuaciones de esas versiones con sus nombres de Marca, Modelo y Versión
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
          from: "versionautos",
          localField: "version_id",
          foreignField: "_id",
          as: "versionInfo",
        },
      },
      { $unwind: "$versionInfo" },
      {
        $lookup: {
          from: "modeloautos",
          localField: "versionInfo.modelo_id",
          foreignField: "_id",
          as: "modeloInfo",
        },
      },
      { $unwind: "$modeloInfo" },
      {
        $lookup: {
          from: "marcaautos",
          localField: "modeloInfo.marca_id",
          foreignField: "_id",
          as: "marcaInfo",
        },
      },
      { $unwind: "$marcaInfo" },
      { $sort: { year: 1 } }, // Ordenamos cronológicamente (del más viejo al más nuevo)
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

    const vehiculosAgrupados = await ValuacionAuto.aggregate(pipeline);

    // Procesamos la matemática financiera (Devaluación año a año y promedio)
    const analisisVehiculos = vehiculosAgrupados.map((vehiculo) => {
      const historialConDevaluacion = [];
      let sumaDevaluaciones = 0;
      let cantidadTramos = 0;

      // Recorremos del año más nuevo al más viejo para ver cuánto cae el valor respecto al año anterior (más nuevo)
      const histDesc = [...vehiculo.historico].sort((a, b) => b.year - a.year);

      for (let i = 0; i < histDesc.length; i++) {
        const actual = histDesc[i];
        const siguienteMasViejo = histDesc[i + 1];

        let variacionPorcentual = null;

        if (siguienteMasViejo && actual.precio > 0) {
          // Devaluacion % = ((PrecioAñoViejo - PrecioAñoNuevo) / PrecioAñoNuevo) * 100
          // Si 2024 vale $10M y 2023 vale $9M, cayó un -10%
          const diferencia = siguienteMasViejo.precio - actual.precio;
          variacionPorcentual = Number(((diferencia / actual.precio) * 100).toFixed(2));
          sumaDevaluaciones += variacionPorcentual;
          cantidadTramos++;
        }

        historialConDevaluacion.push({
          year: actual.year,
          precio: actual.precio,
          variacionRespectoAlAnterior: variacionPorcentual, // Ej: -8.5 (%)
        });
      }

      const devaluacionPromedio =
        cantidadTramos > 0 ? Number((sumaDevaluaciones / cantidadTramos).toFixed(2)) : 0;

      return {
        versionId: vehiculo._id,
        etiquetaCompleta: `${vehiculo.marcaNombre} ${vehiculo.modeloNombre} ${vehiculo.versionNombre}`,
        marcaNombre: vehiculo.marcaNombre,
        modeloNombre: vehiculo.modeloNombre,
        versionNombre: vehiculo.versionNombre,
        precioMasReciente: histDesc[0]?.precio || 0,
        anioMasReciente: histDesc[0]?.year || null,
        devaluacionPromedioAnual: devaluacionPromedio, // Número negativo (ej: -6.4 significa que pierde 6.4% por año)
        detalleAnual: historialConDevaluacion,
      };
    });

    // Determinamos la sugerencia de compra (el que tiene el número más cercano a 0 o positivo, es decir, el que MENOS valor pierde)
    let sugerenciaCompra = null;
    if (analisisVehiculos.length > 0) {
      const ordenadosPorRetencion = [...analisisVehiculos].sort(
        (a, b) => b.devaluacionPromedioAnual - a.devaluacionPromedioAnual
      );
      sugerenciaCompra = ordenadosPorRetencion[0];
    }

    res.status(200).json({
      vehiculos: analisisVehiculos,
      sugerencia: sugerenciaCompra,
    });
  } catch (error) {
    console.error("Error en compararVehiculosAuto:", error);
    res.status(500).json({ mensaje: "Ocurrió un error al generar la comparativa de vehículos." });
  }
};