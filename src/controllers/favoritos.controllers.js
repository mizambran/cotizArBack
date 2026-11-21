import { isValidObjectId } from "mongoose";
import Favorito from "../models/favorito.model.js";

// 1. Guardar un nuevo favorito (Cotización, Presupuesto o Comparativa)
export const crearFavorito = async (req, res) => {
  try {
    const {
      usuario_id,
      categoria,
      tipo,
      titulo,
      subtitulo,
      versiones_ids,
      filtro_presupuesto,
    } = req.body;

    if (!categoria || !tipo || !titulo) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios (categoría, tipo o título)." });
    }

    const nuevoFavorito = new Favorito({
      usuario_id: usuario_id || null,
      categoria,
      tipo,
      titulo,
      subtitulo: subtitulo || "",
      versiones_ids: versiones_ids || [],
      filtro_presupuesto: filtro_presupuesto || {},
    });

    await nuevoFavorito.save();

    res.status(201).json({
      mensaje: "Guardado en favoritos correctamente",
      favorito: nuevoFavorito,
    });
  } catch (error) {
    console.error("Error en crearFavorito:", error);
    res.status(500).json({ mensaje: "Error al guardar en favoritos" });
  }
};

// 2. Listar todos los favoritos (opcionalmente filtrados por usuario_id)
export const listarFavoritos = async (req, res) => {
  try {
    const { usuario_id } = req.query;
    const filtro = {};

    if (usuario_id && isValidObjectId(usuario_id)) {
      filtro.usuario_id = usuario_id;
    }

    const favoritosEnc = await Favorito.find(filtro).sort({ createdAt: -1 }).lean();

    res.status(200).json(favoritosEnc);
  } catch (error) {
    console.error("Error en listarFavoritos:", error);
    res.status(500).json({ mensaje: "Error al obtener la lista de favoritos" });
  }
};

// 3. Eliminar un favorito por su _id
export const eliminarFavorito = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ mensaje: "El ID del favorito es inválido" });
    }

    const favoritoEliminado = await Favorito.findByIdAndDelete(id);

    if (!favoritoEliminado) {
      return res.status(404).json({ mensaje: "No se encontró el favorito solicitado" });
    }

    res.status(200).json({ mensaje: "Eliminado de favoritos correctamente" });
  } catch (error) {
    console.error("Error en eliminarFavorito:", error);
    res.status(500).json({ mensaje: "Error al eliminar el favorito" });
  }
};