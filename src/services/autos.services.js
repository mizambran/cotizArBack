import MarcaAuto from '../models/marcaAuto.model.js';
import ModeloAuto from '../models/modeloAuto.model.js';
import VersionAuto from '../models/versionAuto.model.js';
import ValuacionAuto from '../models/valuacionAuto.model.js';

// Freno de 21 segundos (3 peticiones por minuto = 1 cada 20s + 1s de margen)
const esperar = (ms = 21000) => new Promise(resolve => setTimeout(resolve, ms));

// ==========================================

// 0. SINCRONIZAR MARCAS (AUTOS)
// ==========================================
export const sincronizarMarcasAutos = async () => {
  const marcasGuardadas = [];
  const urlBase = process.env.BASE_URL_API_AUTOS;
  
  let paginaActual = 1;
  let limit = 100;
  let hayMasPaginas = true;

  try {
    while (hayMasPaginas) {
      console.log(`Esperando 21s antes de buscar Marcas de Autos (Página ${paginaActual})...`);
      await esperar();

      // Endpoint base de marcas: /api/v1/autos/brands
      let respuesta = await fetch(`${urlBase}/brands?page=${paginaActual}&per_page=${limit}`);
      
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

      const datos = await respuesta.json();
      let marcasDeEstaPagina = datos.data; // Asumiendo que la API envuelve el array en "data"
      
      if (marcasDeEstaPagina && marcasDeEstaPagina.length > 0) {
        for (const item of marcasDeEstaPagina) {
          const marcaDb = await MarcaAuto.findOneAndUpdate(
            { id_api: item.id },
            {
              id_api: item.id,
              nombre: item.name,
              cantModelos: item.models_count
            },
            { upsert: true, returnDocument: "after" }
          );
          marcasGuardadas.push(marcaDb);
        }
        paginaActual++;
      } else {
        // Si ya no vienen más marcas, cortamos el bucle while
        hayMasPaginas = false;
      }
    }
  } catch (error) {
    console.error(`Error al intentar sincronizar las marcas de autos:`, error.message);
  }

  console.log(`✅ Sincronización de marcas de autos completada. Total guardadas/actualizadas: ${marcasGuardadas.length}`);
  return marcasGuardadas;
};




// ==========================================
// 1. SINCRONIZAR MODELOS (AUTOS)
// ==========================================
export const sincronizarModelosAutos = async () => {
  const modelosGuardados = [];
  const marcasDb = await MarcaAuto.find();
  const urlBase = process.env.BASE_URL_API_AUTOS; 

  for (const marca of marcasDb) {
    let paginaActual = 1;
    let limit = 100;
    let hayMasPaginas = true;

    try {
      while (hayMasPaginas) {
        console.log(`Esperando 21s antes de buscar modelos de Auto para: ${marca.nombre}...`);
        await esperar(); 

        let respuesta = await fetch(`${urlBase}/brands/${marca.id_api}/models?page=${paginaActual}&per_page=${limit}`);
        
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

        const datos = await respuesta.json();
        let modelosDeEstaPagina = datos.data;
        
        if (modelosDeEstaPagina && modelosDeEstaPagina.length > 0) {
          for (const item of modelosDeEstaPagina) {
            const modeloDb = await ModeloAuto.findOneAndUpdate(
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
// 2. SINCRONIZAR VERSIONES (AUTOS)
// ==========================================
export const sincronizarVersionesAutos = async () => {
  const versionesGuardadas = [];
  // Buscamos solo los modelos que sabemos que tienen versiones (> 0) para ahorrar peticiones
  const modelosDb = await ModeloAuto.find({ cantVersiones: { $gt: 0 } });
  const urlBase = process.env.BASE_URL_API_AUTOS;

  for (const modelo of modelosDb) {
    // VERIFICACIÓN DE REANUDACIÓN
    // Contamos si ya descargamos todas las versiones de este modelo
    const versionesEnMongo = await VersionAuto.countDocuments({ modelo_id: modelo._id });
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

        // Endpoint: /api/v1/autos/models/{model}/versions
        let respuesta = await fetch(`${urlBase}/models/${modelo.id_api}/versions?page=${paginaActual}&per_page=${limit}`);
        
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

        const datos = await respuesta.json();
        let versionesDeEstaPagina = datos.data;
        
        if (versionesDeEstaPagina && versionesDeEstaPagina.length > 0) {
          for (const item of versionesDeEstaPagina) {
            // CAMBIO IMPORTANTE: Acá usamos item.id e item.available_years según la API de autos
            const versionDb = await VersionAuto.findOneAndUpdate(
              { id_api: item.id }, 
              {
                id_api: item.id,
                modelo_id: modelo._id,
                nombre: item.name,
                aniosDisponible: item.available_years // Mapeo del nuevo campo
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
// 3. SINCRONIZAR VALUACIONES (AUTOS)
// ==========================================
export const sincronizarValuacionesAutos = async () => {
  const valuacionesGuardadas = [];
  const versionesDb = await VersionAuto.find();
  const urlBase = process.env.BASE_URL_API_AUTOS;

  for (const version of versionesDb) {

    // VERIFICACIÓN DE REANUDACIÓN
    // Si ya existe al menos una cotización para esta versión, saltamos
    const yaTieneValuacion = await ValuacionAuto.exists({ version_id: version._id });
    
    if (yaTieneValuacion) {
      console.log(`⏩ Omitiendo valuaciones para ${version.nombre}: Ya procesadas previamente.`);
      continue; // Salta a la siguiente versión inmediatamente
    }

    try {
      console.log(`Esperando 21s antes de buscar precios para versión: ${version.nombre}...`);
      await esperar();

      // Endpoint: /api/v1/autos/versions/{versionId}/prices
      let respuesta = await fetch(`${urlBase}/versions/${version.id_api}/prices`);
      
      if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);

      const datos = await respuesta.json();
      let preciosPorAnio = datos.data; // Array con los precios históricos

      if (preciosPorAnio && preciosPorAnio.length > 0) {
        for (const item of preciosPorAnio) {
          const valuacionDb = await ValuacionAuto.findOneAndUpdate(
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