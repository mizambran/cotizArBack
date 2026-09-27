import mongoose, { Schema } from "mongoose";



const modeloAutoEsquema = new Schema({
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
      ref: "marcaAuto",
      required: true,
    },
    cantVersiones:{
      type:Number,
      required:true,
      default:0
    }   
}, {timestamps:true})

const ModeloAuto = mongoose.model('modeloAuto', modeloAutoEsquema)

export default ModeloAuto