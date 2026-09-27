import mongoose, { Schema } from "mongoose";

const versionAutoEsquema = new Schema({
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
        modelo_id: { 
        type: Schema.Types.ObjectId, 
        ref: 'modeloAuto', 
        required: true 
      },
      aniosDisponible:{
        type:[Number],
        required:true,
        default:[]
      }
} , {timestamps:true})

const VersionAuto = mongoose.model('versionAuto', versionAutoEsquema)

export default VersionAuto