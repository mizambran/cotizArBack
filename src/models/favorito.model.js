import mongoose, { Schema } from "mongoose";

const favoritoEsquema = new Schema(
  {
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
      required: false, // Lo dejamos opcional por si hacés pruebas sin token al principio, luego lo podés pasar a true
    },
    categoria: {
      type: String,
      enum: ["auto", "moto"],
      required: true,
    },
    tipo: {
      type: String,
      enum: ["cotizacion", "presupuesto", "comparativa"],
      required: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true, // Ej: "Chevrolet Onix LTZ", "Presupuesto hasta $10.000.000", "Onix vs Cronos"
    },
    subtitulo: {
      type: String,
      trim: true, // Ej: "Año 2023 - $12.500.000" o "3 vehículos comparados"
    },
    // Se usa cuando tipo === "cotizacion" (1 ID) o tipo === "comparativa" (hasta 4 IDs)
    versiones_ids: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    // Se usa cuando tipo === "presupuesto"
    filtro_presupuesto: {
      presupuesto: { type: String, default: "" },
      marca: { type: String, default: "" },
      modelo: { type: String, default: "" },
      version: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const Favorito = mongoose.model("favorito", favoritoEsquema);

export default Favorito;