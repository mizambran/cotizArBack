import jwt from "jsonwebtoken"


const generarJWT = (id, rol) => {
    try {
        const payload = {id, rol}
        const token = jwt.sign(payload, process.env.SECRETJWT, {expiresIn:"2h"})
        return token
    } catch (error) {
        console.error(error)
        throw new Error("No se pudo generar el token")
    }
}

export default generarJWT