import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export default class Server {
    constructor() {
        this.app = express()
        this.port = process.env.PORT || 3001
        this.middlewares()
    }
    middlewares(){
        const urlFront = process.env.URL_FRONT
        const corsOptions = {
            origin: [
                `${urlFront}`, // Tu frontend en producción
                'http://localhost:5173'         // Tu frontend en desarrollo (ajustá el puerto si usás otro)
            ],
            credentials: true, // Fundamental para enviar y recibir tokens JWT o cookies
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization']
        };
        this.app.use(cors(corsOptions))
        this.app.use(express.json())
        this.app.use(morgan("dev"))
        const __dirname = dirname(fileURLToPath(import.meta.url))
        this.app.use(express.static(__dirname + "/../../public"))
    }
    listen(){
        this.app.listen(this.port, () => {
            console.info(`Server corriendo, ${this.port}`)
        })
    }
}