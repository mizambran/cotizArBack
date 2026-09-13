import mongoose, { Schema } from "mongoose";

const marcaEsquema = new Schema({
  id_api: { 
    type: Number, 
    required: true, 
    unique: true 
}, // El ID original de la API externa
  nombre: { 
    type: String, 
    required: true, 
    trim: true 
},
cantModelos:{
  type:Number,
  required:true,
  default:0
}
}, { 
  timestamps: true 
});

const Marca = mongoose.model('marca', marcaEsquema);

export default Marca