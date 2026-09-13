import mongoose, { Schema } from "mongoose";


const valuacionEsquema = new Schema({
    version_id: { 
    type: Schema.Types.ObjectId, 
    ref: 'version', 
    required: true 
  },
  year: { 
    type: Number,
    required: true 
  }, // 0 representa 0Km según la API
  price: { 
    type: Number, 
    required: true
  },
  price_ars_thousands: { 
    type: String 
  }, // Guardado como string según la doc de la API
  exchange_rate: { 
    type: Number, 
    default: null
   },
  recorded_at: { 
    type: String, 
    required: true
   } // Formato YYYY-MM-DD
}, {timestamps:true}
)
// Índice compuesto para evitar guardar la misma cotización dos veces en el mismo mes
valuacionEsquema.index({ version_id: 1, year: 1, recorded_at: 1 }, { unique: true });

const Valuacion = mongoose.model('valuacion', valuacionEsquema)

export default Valuacion