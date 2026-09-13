import Marca from "../models/marca.model.js";
import Modelo from "../models/modelo.model.js";
import Version from '../models/version.model.js';
import Valuacion from '../models/valuacion.model.js';


export const sincronizarMarcas = async () => {
  let paginaActual = 1;
  let limit = 100;
  let hayMasPaginas = true;
  const marcasGuardadas = []; // Array para devolver al frontend

  console.log("Iniciando sincronización de Marcas...");

  while (hayMasPaginas) {
    const urlBase = process.env.BASE_URL_API_MOTOS;
    const url = `${urlBase}/brands?page=${paginaActual}&per_page=${limit}`;

    try {
      const respuesta = await fetch(url);

      // Validación extra: Captura exacta del status code
      if (!respuesta.ok) {
        throw new Error(
          `Fallo en Proveedor | Código: ${respuesta.status} | URL: ${url}`,
        );
      }

      const datos = await respuesta.json();
      const marcasDeEstaPagina = datos.data;

      if (marcasDeEstaPagina && marcasDeEstaPagina.length > 0) {
        for (const item of marcasDeEstaPagina) {
          // Guardamos en Mongo y capturamos el documento resultante
          const marcaDb = await Marca.findOneAndUpdate(
            { id_api: item.id },
            {
              id_api: item.id,
              nombre: item.name,
              cantModelos:item.models_count
            },
            { upsert: true, returnDocument: "after" },
          );

          marcasGuardadas.push(marcaDb);
        }

        paginaActual++;
      } else {
        hayMasPaginas = false;
      }
    } catch (error) {
      // Logueo preciso para saber exactamente dónde explotó
      console.error(
        `Error crítico en la página ${paginaActual}:`,
        error.message,
      );
      hayMasPaginas = false;

      // Lanzamos el error hacia arriba para que el controlador le avise al frontend
      throw error;
    }
  }

  return marcasGuardadas;
};







// Freno de 21 segundos (3 peticiones por minuto = 1 cada 20s + 1s de margen)
const esperar = (ms = 21000) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================
// 1. SINCRONIZAR MODELOS
// ==========================================
export const sincronizarModelos = async () => {
  const modelosGuardados = [];
  const marcasDb = await Marca.find();
  const urlBase = process.env.BASE_URL_API_MOTOS;

  for (const marca of marcasDb) {
    let paginaActual = 1;
    let limit = 100;
    let hayMasPaginas = true;

    try {
      while (hayMasPaginas) {
        console.log(`Esperando 21s antes de buscar modelos para: ${marca.nombre}...`);
        await esperar(); 

        let respuesta = await fetch(`${urlBase}/brands/${marca.id_api}/models?page=${paginaActual}&per_page=${limit}`);
        
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

        const datos = await respuesta.json();
        let modelosDeEstaPagina = datos.data;
        
        if (modelosDeEstaPagina && modelosDeEstaPagina.length > 0) {
          for (const item of modelosDeEstaPagina) {
            const modeloDb = await Modelo.findOneAndUpdate(
              { id_api: item.id },
              {
                id_api: item.id,
                marca_id: marca._id,
                nombre: item.name,
                cantVersiones: item.versions_count 
              },
              { upsert: true, returnDocument: "after" }
            );
            modelosGuardados.push(modeloDb);
          }
          paginaActual++;
        } else {
          hayMasPaginas = false;
        }
      }
    } catch (error) {
      console.error(`Omitiendo modelos de la marca ${marca.nombre}:`, error.message);
    }
  }
  return modelosGuardados;
};

// ==========================================
// 2. SINCRONIZAR VERSIONES
// ==========================================
export const sincronizarVersiones = async () => {
  const versionesGuardadas = [];
  // Buscamos solo los modelos que sabemos que tienen versiones (> 0) para ahorrar peticiones
  const modelosDb = await Modelo.find({ cantVersiones: { $gt: 0 } });
  const urlBase = process.env.BASE_URL_API_MOTOS;

  for (const modelo of modelosDb) {
    // VERIFICACIÓN DE REANUDACIÓN
    // Contamos si ya descargamos todas las versiones de este modelo
    const versionesEnMongo = await Version.countDocuments({ modelo_id: modelo._id });
    if (versionesEnMongo >= modelo.cantVersiones) {
      console.log(`⏩ Omitiendo modelo ${modelo.nombre}: Sus ${modelo.cantVersiones} versiones ya están en la BD.`);
      continue; // Salta al siguiente modelo del bucle 'for' sin esperar los 21s
    }

    let paginaActual = 1;
    let limit = 100;
    let hayMasPaginas = true;

    try {
      while (hayMasPaginas) {
        console.log(`Esperando 21s antes de buscar versiones para el modelo: ${modelo.nombre}...`);
        await esperar();

        // Endpoint: /api/v1/motos/models/{model}/versions
        let respuesta = await fetch(`${urlBase}/models/${modelo.id_api}/versions?page=${paginaActual}&per_page=${limit}`);
        
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

        const datos = await respuesta.json();
        let versionesDeEstaPagina = datos.data;
        
        if (versionesDeEstaPagina && versionesDeEstaPagina.length > 0) {
          for (const item of versionesDeEstaPagina) {
            const versionDb = await Version.findOneAndUpdate(
              { id_api: item.moto_id }, // Usamos moto_id que viene como String hexadecimal
              {
                id_api: item.moto_id,
                modelo_id: modelo._id,
                nombre: item.name
              },
              { upsert: true, returnDocument: "after" }
            );
            versionesGuardadas.push(versionDb);
          }
          paginaActual++;
        } else {
          hayMasPaginas = false;
        }
      }
    } catch (error) {
      console.error(`Omitiendo versiones del modelo ${modelo.nombre}:`, error.message);
    }
  }
  return versionesGuardadas;
};

// ==========================================
// 3. SINCRONIZAR VALUACIONES (PRECIOS)
// ==========================================
export const sincronizarValuaciones = async () => {
  const valuacionesGuardadas = [];
  const versionesDb = await Version.find();
  const urlBase = process.env.BASE_URL_API_MOTOS;

  for (const version of versionesDb) {

    // VERIFICACIÓN DE REANUDACIÓN
    // Si ya existe al menos una cotización para esta versión, saltamos
    const yaTieneValuacion = await Valuacion.exists({ version_id: version._id });
    
    if (yaTieneValuacion) {
      console.log(`⏩ Omitiendo valuaciones para ${version.nombre}: Ya procesadas previamente.`);
      continue; // Salta a la siguiente versión inmediatamente
    }


    try {
      console.log(`Esperando 21s antes de buscar precios para versión: ${version.nombre}...`);
      await esperar();

      // Endpoint: /api/v1/motos/versions/{motoId}/prices
      let respuesta = await fetch(`${urlBase}/versions/${version.id_api}/prices`);
      
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

      const datos = await respuesta.json();
      let preciosPorAnio = datos.data; // Array con los precios históricos

      if (preciosPorAnio && preciosPorAnio.length > 0) {
        for (const item of preciosPorAnio) {
          const valuacionDb = await Valuacion.findOneAndUpdate(
            { 
              version_id: version._id, 
              year: item.year, 
              recorded_at: item.recorded_at 
            },
            {
              version_id: version._id,
              year: item.year,
              price: item.price,
              price_ars_thousands: item.price_ars_thousands,
              exchange_rate: item.exchange_rate,
              recorded_at: item.recorded_at
            },
            { upsert: true, returnDocument: "after" }
          );
          valuacionesGuardadas.push(valuacionDb);
        }
      }
    } catch (error) {
      console.error(`Omitiendo valuación de la versión ${version.id_api}:`, error.message);
    }
  }
  return valuacionesGuardadas;
};