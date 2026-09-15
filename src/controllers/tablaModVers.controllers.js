import { isValidObjectId } from "mongoose";
import Modelo from "../models/modelo.model.js";
import Version from "../models/version.model.js";

/* 
recibir marca solicitada
ir a buscar modelos de la marca 
ir a buscar versiones de los modelos
devolver modelos y versiones

*/

export const listarModYVersion = async (req, res) => {
  try {
    const id = req.params.id;

    if (!isValidObjectId(id)) {
      return res
        .status(400)
        .json({ mensaje: "El id de la marca no es válido" });
    }

    const modelosEncontrados = await Modelo.find({ marca_id: id }).lean();

    if (!modelosEncontrados || modelosEncontrados.length === 0) {
      return res
        .status(404)
        .json({
          mensaje: "No se encontraron modelos para la marca solicitada",
        });
    }

    const idsDeModelos = modelosEncontrados.map((modelo) => modelo._id);

    const versionesEncontradas = await Version.find({
      modelo_id: { $in: idsDeModelos },
    }).lean();

    const modelosConVersiones = modelosEncontrados.map((modelo) => {
      return {
        ...modelo,
        versiones: versionesEncontradas.filter(
          (version) => version.modelo_id.toString() === modelo._id.toString(),
        ),
      };
    });
    res.status(200).json({
      results: modelosConVersiones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "No se pudo listar modelos y versiones" });
  }
};
