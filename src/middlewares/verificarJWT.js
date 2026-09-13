import jwt from "jsonwebtoken"



const verificarJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.starWith('Bearer ')){
        return res.status(401).json({mensaje:"No hay token en la petición"})
    }
    const token = authHeader.split(' ')[1]
    const payload = jwt.verify(token, process.env.SECRETJWT)
    req.idUsuario = payload.id
    req.rolUsuario = payload.rol
    next()
    } catch (error) {
        console.error(error)
        res.status(401).json({mensaje:"Token inválido o expirado"})
    }
}

export default verificarJWT