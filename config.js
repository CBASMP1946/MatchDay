const MATCHDAY_CONFIG = {
    apiUrl: 'matchday-api.sperilla474.workers.dev',            // ej: 'https://matchday-api.tuusuario.workers.dev'
    intervaloLista: 120,   // segundos entre consultas en la lista (plan gratis: 120 o más)
    intervaloDetalle: 60,  // segundos entre consultas dentro de un partido
    cachePosicionesMin: 60, // minutos que se guarda una tabla de posiciones antes de volver a pedirla
    temporada: 2026        // temporada que se pide a la API para las tablas
};
