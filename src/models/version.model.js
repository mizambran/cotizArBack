import mongoose, { Schema } from "mongoose";



const versionEsquema = new Schema({
    id_api: { 
        type: String, 
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
    ref: 'modelo', 
    required: true 
  }
}, {timestamps:true})

const Version = mongoose.model('version', versionEsquema)

export default Version