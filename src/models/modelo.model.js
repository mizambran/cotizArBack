import mongoose, { Schema } from "mongoose";

const modeloEsquema = new Schema(
  {
    id_api: { 
        type: Number, 
        required: true, 
        unique: true 
    },
    nombre: { 
        type: String, 
        required: true, 
        trim: true 
    },
    marca_id: {
      type: Schema.Types.ObjectId,
      ref: "marca",
      required: true,
    },
    cantVersiones:{
      type:Number,
      required:true,
      default:0
    }
  },
  { timestamps: true },
);

const Modelo = mongoose.model('modelo', modeloEsquema)

export default Modelo