import mongoose, { Schema } from "mongoose";



const usuarioEsquema = new Schema({
    nombre:{
        type:String,
        minLength:3,
        maxLength:50,
        required:true
    },
    edad:{
        type:Number
    },
    email:{
        type:String,
        required:true,
        unique:true,
        validate:{
            validator:(valor) => {
                return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(valor) 
            }, message:"El formato de email no es válido"
        }
    },
    password:{
        type:String,
        select:false
    },
    googleId:{ // nos sirve para saber si entro por google
        type:String,
        default: null
    },
    fotoPerfil:{
        type:String,
        default: null
    },
    habilitado:{
        type:Boolean,
        required:true,
        default:true
    },
    rol:{
        type:String,
        enum:["admin", "cliente", "visita"],
        required:true,
        default:"visita"
    }
}, {timestamps:true})

const Usuario = mongoose.model('usuario', usuarioEsquema)

export default Usuario