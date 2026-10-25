/* ============================================================
   MATCHDAY - Datos compartidos (lista + detalle)
   Para agregar un partido: copia un objeto de PARTIDOS y cambia los datos.
   Horas en hora de Colombia (-05:00).
   ============================================================ */

const TZ = 'America/Bogota';

const LIGAS = {
    pl:         { nombre: 'Inglaterra: Premier League', corto: 'Premier League' },
    laliga:     { nombre: 'España: LaLiga',             corto: 'LaLiga' },
    seriea:     { nombre: 'Italia: Serie A',            corto: 'Serie A' },
    bundesliga: { nombre: 'Alemania: Bundesliga',       corto: 'Bundesliga' },
    ligue1:     { nombre: 'Francia: Ligue 1',           corto: 'Ligue 1' }
};

/* Escudos. Si un equipo no tiene URL aquí, se muestra un círculo con sus iniciales.
   Para agregar uno: 'Nombre del equipo': 'https://...png' */
const WK = '?utm_source=pt.wikipedia.org&utm_campaign=parser&utm_content=thumbnail';
const ESCUDOS = {
    'Ipswich Town': 'https://img.a.transfermarkt.technology/wappen/head/677.png?lm=1789459206',
    'Nottingham Forest': 'https://upload.wikimedia.org/wikipedia/pt/a/a2/Nottingham_Forest.png',
    'Aston Villa': 'https://thumb.wikimedia.org/wikipedia/pt/thumb/1/15/Aston_Villa.svg/250px-Aston_Villa.svg.png' + WK,
    'Manchester City': 'https://thumb.wikimedia.org/wikipedia/pt/thumb/0/02/Manchester_City_Football_Club.png/250px-Manchester_City_Football_Club.png' + WK,
    'Chelsea': 'https://thumb.wikimedia.org/wikipedia/pt/thumb/c/cc/Chelsea_FC.svg/250px-Chelsea_FC.svg.png' + WK,
    'Tottenham Hotspur': 'https://upload.wikimedia.org/wikipedia/pt/6/6d/Tottenham_Hotspur.png',
    'Real Madrid': 'https://thumb.wikimedia.org/wikipedia/pt/thumb/9/98/Real_Madrid.png/250px-Real_Madrid.png' + WK,
    'Barcelona': 'https://thumb.wikimedia.org/wikipedia/pt/thumb/4/43/FCBarcelona.svg/330px-FCBarcelona.svg.png' + WK,
    'Inter de Milán': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/330px-FC_Internazionale_Milano_2021.svg.png' + WK,
    'Juventus': 'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Juventus_FC_-_logo_black_%28Italy%2C_2020%29.svg/250px-Juventus_FC_-_logo_black_%28Italy%2C_2020%29.svg.png' + WK,
    'Manchester United': 'https://thumb.wikimedia.org/wikipedia/pt/thumb/b/b6/Manchester_United_FC_logo.png/250px-Manchester_United_FC_logo.png' + WK
};

/* Campos opcionales por partido:
   estadio, ciudad, arbitro, jornada, tv,
   marcador: [golesLocal, golesVisitante]  (cuando termine o esté en vivo)
   h2h: [{fecha:'2026-03-02', local:'..', visitante:'..', marcador:'2-1'}]
   alineaciones: { local:['Portero','...'], visitante:['...'] }
   Lo que falte se muestra como "Por confirmar". */
const PARTIDOS = [
    { id: 1, liga: 'pl', inicio: '2026-10-23T14:00:00-05:00',
      local: 'Ipswich Town', visitante: 'Nottingham Forest',
      estadio: 'Portman Road', ciudad: 'Ipswich' },

    { id: 2, liga: 'pl', inicio: '2026-10-24T06:30:00-05:00',
      local: 'Aston Villa', visitante: 'Manchester City',
      estadio: 'Villa Park', ciudad: 'Birmingham' },

    { id: 3, liga: 'pl', inicio: '2026-10-24T11:30:00-05:00',
      local: 'Chelsea', visitante: 'Tottenham Hotspur',
      estadio: 'Stamford Bridge', ciudad: 'Londres' },

    { id: 4, liga: 'laliga', inicio: '2026-10-25T15:00:00-05:00',
      local: 'Real Madrid', visitante: 'Barcelona',
      estadio: 'Santiago Bernabéu', ciudad: 'Madrid' },

    { id: 5, liga: 'seriea', inicio: '2026-10-25T12:00:00-05:00',
      local: 'Inter de Milán', visitante: 'Juventus',
      estadio: 'San Siro', ciudad: 'Milán' },

    { id: 6, liga: 'pl', inicio: '2026-10-31T07:30:00-05:00',
      local: 'Chelsea', visitante: 'Manchester United',
      estadio: 'Stamford Bridge', ciudad: 'Londres' },

    /* ---- Ejemplos nuevos: fechas/horas de muestra, verifícalas ---- */
    { id: 7, liga: 'pl', inicio: '2026-11-01T10:30:00-05:00',
      local: 'Liverpool', visitante: 'Arsenal',
      estadio: 'Anfield', ciudad: 'Liverpool' },

    { id: 8, liga: 'laliga', inicio: '2026-10-31T14:00:00-05:00',
      local: 'Atlético de Madrid', visitante: 'Sevilla',
      estadio: 'Riyadh Air Metropolitano', ciudad: 'Madrid' },

    { id: 9, liga: 'seriea', inicio: '2026-11-01T13:45:00-05:00',
      local: 'Milan', visitante: 'Napoli',
      estadio: 'San Siro', ciudad: 'Milán' },

    { id: 10, liga: 'bundesliga', inicio: '2026-10-31T10:30:00-05:00',
      local: 'Bayern Múnich', visitante: 'Borussia Dortmund',
      estadio: 'Allianz Arena', ciudad: 'Múnich' },

    { id: 11, liga: 'ligue1', inicio: '2026-11-01T13:45:00-05:00',
      local: 'Paris Saint-Germain', visitante: 'Olympique de Marsella',
      estadio: 'Parc des Princes', ciudad: 'París' },

    { id: 12, liga: 'ligue1', inicio: '2026-10-31T13:00:00-05:00',
      local: 'AS Mónaco', visitante: 'Olympique de Lyon',
      estadio: 'Stade Louis II', ciudad: 'Mónaco' }
];

/* ---------- Helpers ---------- */

function iniciales(nombre) {
    const palabras = nombre.replace(/[^\p{L}\s]/gu, '').split(/\s+/).filter(Boolean);
    const base = palabras.length > 1 ? palabras.slice(0, 2).map(w => w[0]).join('') : nombre.slice(0, 3);
    return base.toUpperCase();
}

function escudoFallback(img) {
    const span = document.createElement('span');
    span.className = img.className + ' escudo-iniciales';
    span.textContent = img.dataset.ini;
    img.replaceWith(span);
}

function escudoHTML(nombre, clase = 'escudo') {
    const url = ESCUDOS[nombre];
    const ini = iniciales(nombre);
    if (!url) return `<span class="${clase} escudo-iniciales">${ini}</span>`;
    return `<img src="${url}" class="${clase}" alt="${nombre}" loading="lazy" referrerpolicy="no-referrer" data-ini="${ini}" onerror="escudoFallback(this)">`;
}

function partes(fechaISO) {
    const f = new Intl.DateTimeFormat('es-CO', {
        timeZone: TZ, day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
        hour12: false, weekday: 'long', year: 'numeric'
    }).formatToParts(new Date(fechaISO));
    const o = {};
    f.forEach(p => o[p.type] = p.value);
    return o;
}

/* "24.10. 06:30" estilo Flashscore */
function fechaCorta(p) {
    const o = partes(p.inicio);
    return `${o.day}.${o.month}. ${o.hour}:${o.minute}`;
}

/* "sábado, 24 de octubre de 2026 · 06:30" */
function fechaLarga(p) {
    const d = new Date(p.inicio);
    const dia = new Intl.DateTimeFormat('es-CO', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
    const o = partes(p.inicio);
    return `${dia} · ${o.hour}:${o.minute}`;
}

/* ---------- Banderas de la competición (flagcdn.com) ---------- */
const PAIS_LIGA = {
    pl: 'gb-eng', laliga: 'es', seriea: 'it', bundesliga: 'de', ligue1: 'fr',
    colombia: 'co', mexico: 'mx', argentina: 'ar', brasil: 'br', mls: 'us'
};

function banderaHTML(liga, clase = 'bandera') {
    const c = PAIS_LIGA[liga];
    if (!c) return '🏆';
    return `<img src="https://flagcdn.com/w40/${c}.png" srcset="https://flagcdn.com/w80/${c}.png 2x" class="${clase}" alt="" loading="lazy" onerror="this.replaceWith('🏆')">`;
}

/* ---------- Datos en vivo (los llena en-vivo.js) ----------
   LIVE[id] = { estado:'1H|HT|2H|FT...', min, extra, marcador:[l,v]|null, t: momento de la consulta } */
const LIVE = {};
const E_VIVO = ['1H', '2H', 'ET', 'BT', 'P', 'LIVE', 'HT', 'INT'];
const E_FIN = ['FT', 'AET', 'PEN', 'AWD', 'WO'];
const E_APL = ['PST', 'CANC', 'ABD', 'SUSP'];
const E_FIJOS = [...E_FIN, 'PST', 'CANC', 'ABD'];   // estados que ya no cambian

/* Un dato "en vivo" solo vale 10 min; si la API deja de responder se vuelve a la estimación por hora */
function liveDe(p) {
    const l = LIVE[p.id];
    if (!l) return null;
    return (E_FIJOS.includes(l.estado) || Date.now() - l.t < 10 * 60 * 1000) ? l : null;
}

function marcadorDe(p) {
    const l = liveDe(p);
    return (l && l.marcador) || p.marcador || null;
}

/* 'prog' | 'vivo' | 'fin' | 'apl' */
function estadoPartido(p) {
    const l = liveDe(p);
    if (l) {
        if (E_FIN.includes(l.estado)) return 'fin';
        if (E_APL.includes(l.estado)) return 'apl';
        if (E_VIVO.includes(l.estado)) return 'vivo';
        return 'prog';   // NS / TBD: la API dice que aún no empieza
    }
    const ahora = Date.now();
    const ini = new Date(p.inicio).getTime();
    if (ahora < ini) return 'prog';
    if (ahora < ini + 115 * 60 * 1000 && !(p.marcador && p.terminado)) return 'vivo';
    return 'fin';
}

/* Texto del minuto: 27' · 45+2' · Descanso · ~27' (estimado si no hay API) */
function etiquetaTiempo(p) {
    const l = liveDe(p);
    const fijo = { HT: 'Descanso', BT: 'Descanso', P: 'Penales', INT: 'Interrumpido', LIVE: 'En vivo' };
    if (l) {
        if (fijo[l.estado]) return fijo[l.estado];
        if (l.extra) return `${l.min}+${l.extra}'`;
        const tope = l.estado === '1H' ? 45 : l.estado === '2H' ? 90 : 120;
        return `${Math.min(l.min + Math.floor((Date.now() - l.t) / 60000), tope)}'`;
    }
    const m = Math.floor((Date.now() - new Date(p.inicio)) / 60000);
    if (m <= 45) return `~${Math.max(m, 1)}'`;
    if (m <= 60) return 'Descanso';
    return `~${Math.min(m - 15, 90)}'`;
}

const ETIQUETA_ESTADO = { prog: 'Progr.', vivo: 'En vivo', fin: 'Final', apl: 'Aplaz.' };
