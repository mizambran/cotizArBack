import mongoose, { Schema } from "mongoose";

const favoritoEsquema = new Schema(
  {
    usuario_id: {
      type: Schema.Types.ObjectId,
      ref: "usuario",
      required: true,
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
      trim: true, // Ej: "Comparativa: Onix vs Cronos vs Argo" o "Presupuesto hasta $10.000.000"
    },
    // Para 'cotizacion' (1 ID) o 'comparativa' (hasta 4 IDs)
    versiones_ids: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
    // Para 'presupuesto' (guardamos los parámetros con los que buscó)
    filtro_presupuesto: {
      montoMaximo: Number,
      marca: String,
      modelo: String,
      version: String,
    },
  },
  { timestamps: true }
);

const Favorito = mongoose.model("favorito", favoritoEsquema);

export default Favorito;