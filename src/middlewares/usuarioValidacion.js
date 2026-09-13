import { body } from "express-validator"
import resultadoValidacion from './resultadoValidacion.js'



const usuarioValidacion = [
    body("nombre")
    .trim()
    .notEmpty().withMessage("El campo nombre es obligatorio")
    .isLength({min:3, max:50})
    .withMessage("Nombre, debe tener de tres a veinte caracteres"),

    body("email")
    .trim()
    .notEmpty().withMessage("El campo email es un dato obligatorio")
    .isEmail().withMessage("Debe tener un formato de email válido"),

    body("password")
    // Si no viene de google , hacemos la validación de la contraseña
    .if(body("googleId").not().exists())
    .trim()
    .notEmpty().withMessage("El campo contraseña es un dato obligatorio")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W_]{8,64}$/)
    .withMessage("La contraseña debe tener entre 8 y 64 caracteres, incluir al menos una mayúscula, una minúscula y un número."),

    resultadoValidacion
]

export default usuarioValidacion