import router from './src/routes/index.routes.js'
import Server from './src/server/config.js'
import './src/server/dbConfig.js'
import { 
   sincronizarModelos,
   sincronizarVersiones,
   sincronizarValuaciones
   
} from './src/services/motos.services.js';



const server = new Server()

server.app.use('/api', router)

server.listen()


const ejecutarSincronizacionMasiva = async () => {
  try {
    console.log("=== INICIANDO ACTUALIZACIÓN MOTOS ===");
    console.log("Nota: Este proceso durará varias horas por el límite de la API.");

    console.log("\n--- PASO 1: Sincronizando Modelos ---");
    await sincronizarModelos();

    console.log("\n--- PASO 2: Sincronizando Versiones ---");
    await sincronizarVersiones();

    console.log("\n--- PASO 3: Sincronizando Valuaciones (Precios) ---");
    await sincronizarValuaciones();

    console.log("\n=== ¡BASE DE DATOS COTIZAR COMPLETAMENTE ACTUALIZADA! ===");
  } catch (error) {
    console.error("El script masivo se detuvo por un error:", error);
  }
};


//ejecutarSincronizacionMasiva();