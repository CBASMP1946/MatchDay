/* ============================================================
   MATCHDAY - Ligas y partidos adicionales
   Formato de cada fila: [inicio, local, visitante, marcador?]
   inicio = 'AAAA-MM-DDTHH:MM' en hora de Colombia.
   Los partidos "Fin" llevan marcador [golesLocal, golesVisitante].
   ============================================================ */

Object.assign(LIGAS, {
    colombia:  { nombre: 'Colombia: Liga Dimayor',        corto: 'Liga Dimayor' },
    mexico:    { nombre: 'México: Liga MX',               corto: 'Liga MX' },
    argentina: { nombre: 'Argentina: Liga Profesional',   corto: 'Argentina' },
    brasil:    { nombre: 'Brasil: Brasileirão Serie A',   corto: 'Brasileirão' },
    mls:       { nombre: 'EE. UU.: MLS',                  corto: 'MLS' },
    /* logo: imagen de la competición (carpeta logos/). Si el archivo no existe se ve el trofeo 🏆.
       tema: color de sus finales ('oro' | 'plata'). copa: la tabla se muestra por grupos/fases. */
    champions:    { nombre: 'Europa: UEFA Champions League',  corto: 'Champions',    copa: true, logo: 'logos/champions.png' },
    libertadores: { nombre: 'Sudamérica: Copa Libertadores', corto: 'Libertadores', tema: 'oro',   copa: true, logo: 'logos/libertadores.png' },
    sudamericana: { nombre: 'Sudamérica: Copa Sudamericana', corto: 'Sudamericana', tema: 'plata', copa: true, logo: 'logos/sudamericana.png' }
});

let _idExtra = 100;
function agregar(liga, jornada, filas) {
    filas.forEach(([inicio, local, visitante, marcador]) => {
        const sinHora = inicio.length === 10;   // 'AAAA-MM-DD': se sabe el día, no la hora
        PARTIDOS.push({
            id: _idExtra++, liga, jornada, local, visitante,
            inicio: (sinHora ? inicio + 'T12:00' : inicio) + ':00-05:00',
            ...(sinHora ? { sinHora: true } : {}),
            ...(marcador ? { marcador } : {})
        });
    });
}

/* ---------- Colombia · Clausura · Jornada 16 de 19 ---------- */
agregar('colombia', 'Clausura · Jornada 16 de 19', [
    ['2026-10-23T20:00', 'Boyacá Chicó', 'Bucaramanga', [1, 0]],
    ['2026-10-23T20:00', 'Junior', 'Águilas Doradas', [1, 0]],
    ['2026-10-24T18:05', 'América de Cali', 'Cúcuta'],
    ['2026-10-24T20:15', 'Once Caldas', 'Deportivo Pereira'],
    ['2026-10-25T14:00', 'Fortaleza', 'Deportivo Cali'],
    ['2026-10-25T16:05', 'Alianza', 'Internacional de Bogotá'],
    ['2026-10-25T18:10', 'Atlético Nacional', 'Medellín'],
    ['2026-10-25T20:15', 'Tolima', 'Pasto'],
    ['2026-10-26T18:00', 'Jaguares', 'Llaneros']
]);

/* Santa Fe 3-2 Millonarios: partido con detalle completo */
PARTIDOS.push({
    id: 150, liga: 'colombia',
    jornada: 'Clausura · Grupo B · Jornada 16 de 19',
    inicio: '2026-10-23T20:00:00-05:00',   // ajusta la fecha/hora real
    local: 'Santa Fe', visitante: 'Millonarios',
    marcador: [3, 2],
    goles: {
        local: [
            { jugador: 'Jhojan Torres',     min: "45+2'" },
            { jugador: 'Franco Fagúndez',   min: "50'" },
            { jugador: 'Emerson Rodríguez', min: "71'" }
        ],
        visitante: [
            { jugador: 'Daniel Ruiz',       min: "6'" },
            { jugador: 'Andrey Estupiñán',  min: "73'" }
        ]
    },
    rojas: {
        local: [{ jugador: 'Helibelton Palacios', min: "86'" }],
        visitante: []
    },
    estadisticas: [
        { label: 'Remates',          local: 11,    visitante: 13 },
        { label: 'Remates al arco',  local: 6,     visitante: 7 },
        { label: 'Posesión',         local: '51%', visitante: '49%' }
    ]
});

/* ---------- México · Apertura · Jornada 14 de 17 ---------- */
agregar('mexico', 'Apertura · Jornada 14 de 17', [
    ['2026-10-23T20:00', 'Necaxa', 'Juárez', [1, 1]],
    ['2026-10-23T22:00', 'Atlante', 'San Luis', [0, 1]],
    ['2026-10-24T18:00', 'León', 'Toluca'],
    ['2026-10-24T20:00', 'Monterrey', 'Guadalajara'],
    ['2026-10-24T22:10', 'Pumas', 'Tigres'],
    ['2026-10-25T18:00', 'Atlas', 'Puebla'],
    ['2026-10-25T20:00', 'Querétaro', 'Cruz Azul'],
    ['2026-10-25T20:05', 'América', 'Pachuca'],
    ['2026-10-25T22:10', 'Tijuana', 'Santos Laguna']
]);

/* ---------- Argentina ---------- */
agregar('argentina', null, [
    ['2026-10-24T15:00', 'Talleres', 'Defensa y Justicia'],
    ['2026-10-24T17:15', 'San Lorenzo', "Newell's"],
    ['2026-10-24T19:30', 'Rosario Central', 'Huracán'],
    ['2026-10-25T12:45', 'Aldosivi', 'Belgrano'],
    ['2026-10-25T15:00', 'Independiente', 'Boca Juniors'],
    ['2026-10-25T17:15', 'River Plate', 'Racing'],
    ['2026-10-25T19:30', 'Central Córdoba', 'Vélez'],
    ['2026-10-25T19:30', 'Barracas Central', 'Estudiantes de Río Cuarto'],
    ['2026-10-26T17:00', 'Unión', 'Estudiantes'],
    ['2026-10-26T19:15', 'Instituto', 'Deportivo Riestra']
]);

/* ---------- Brasil · Jornada 32 de 38 ---------- */
agregar('brasil', 'Jornada 32 de 38', [
    ['2026-10-23T20:00', 'Cruzeiro', 'Remo', [1, 0]],
    ['2026-10-24T14:30', 'Internacional', 'Botafogo'],
    ['2026-10-24T14:30', 'Mirassol', 'São Paulo'],
    ['2026-10-24T14:30', 'Vitória', 'Paranaense'],
    ['2026-10-24T16:30', 'Palmeiras', 'Bragantino'],
    ['2026-10-24T16:30', 'Vasco da Gama', 'Corinthians'],
    ['2026-10-24T17:30', 'Chapecoense', 'Fluminense'],
    ['2026-10-24T19:00', 'Santos', 'Bahía'],
    ['2026-10-26T17:30', 'Coritiba', 'Grêmio'],
    ['2026-10-26T18:00', 'Flamengo', 'Atlético Mineiro']
]);

/* ---------- MLS (hoy) ---------- */
agregar('mls', null, [
    ['2026-10-24T12:30', 'Montréal', 'Nashville SC'],
    ['2026-10-24T14:30', 'Columbus Crew', 'Toronto'],
    ['2026-10-24T16:30', 'New York RB', 'Inter Miami'],
    ['2026-10-24T18:30', 'Philadelphia', 'New England'],
    ['2026-10-24T18:30', 'Atlanta United', 'Chicago Fire'],
    ['2026-10-24T18:30', 'Orlando City', 'NYC FC'],
    ['2026-10-24T18:30', 'DC United', 'Cincinnati'],
    ['2026-10-24T19:30', 'FC Dallas', 'SJ Earthquakes']
]);

/* ---------- Finales continentales (CONMEBOL) ----------
   Hora aún sin anunciar: cuando la confirmen, cambia 'inicio' y borra sinHora: true.
   Local/visitante es nominal (cancha neutral). */
PARTIDOS.push({
    id: 200, liga: 'sudamericana', jornada: 'Final',
    inicio: '2026-11-21T15:00:00-05:00', sinHora: true,
    local: 'Boca Juniors', visitante: 'Atlético Mineiro',
    estadio: 'Estadio Metropolitano Roberto Meléndez', ciudad: 'Barranquilla'
});

PARTIDOS.push({
    id: 201, liga: 'libertadores', jornada: 'Final',
    inicio: '2026-11-28T15:00:00-05:00', sinHora: true,
    local: 'Palmeiras', visitante: 'Estudiantes',
    estadio: 'Estadio Centenario', ciudad: 'Montevideo'
});

/* ============================================================
   Resultados y partidos del 1 al 13 de noviembre de 2026
   (ids desde 300 para no chocar con los de arriba).
   Fecha sin hora ('AAAA-MM-DD') = se sabe el día, no la hora.
   ============================================================ */
_idExtra = 300;

agregar('pl', 'Jornada 10 de 38', [
    ['2026-11-06', 'Everton', 'Coventry City', [3, 1]],
    ['2026-11-07T07:30', 'Leeds United', 'Tottenham Hotspur', [1, 0]],
    ['2026-11-07T10:00', 'Fulham', 'Newcastle United', [1, 1]],
    ['2026-11-07T10:00', 'Arsenal', 'Hull City', [1, 0]],
    ['2026-11-07T12:30', 'Nottingham Forest', 'Manchester City', [3, 1]],
    ['2026-11-08T09:00', 'Crystal Palace', 'Liverpool', [1, 3]],
    ['2026-11-08T09:00', 'Ipswich Town', 'Bournemouth', [1, 2]],
    ['2026-11-08T09:00', 'Brighton', 'Brentford', [2, 0]],
    ['2026-11-08T09:00', 'Sunderland', 'Chelsea', [1, 0]],
    ['2026-11-08T11:30', 'Manchester United', 'Aston Villa', [4, 4]]
]);

agregar('laliga', 'Jornada 12 de 38', [
    ['2026-11-07T15:00', 'Valencia', 'Real Madrid', [0, 3]],
    ['2026-11-08T15:00', 'Atlético de Madrid', 'Barcelona', [1, 2]]
]);

/* Serie A, jornada 11: el calendario la ubica el 7-8 de nov; el día exacto de cada partido puede variar */
agregar('seriea', 'Jornada 11 de 38', [
    ['2026-11-08', 'Parma', 'Bologna', [1, 2]],
    ['2026-11-08', 'Roma', 'Sassuolo', [3, 0]],
    ['2026-11-08', 'Napoli', 'Lazio', [1, 1]],
    ['2026-11-08', 'Genoa', 'Milan', [1, 2]],
    ['2026-11-08', 'Monza', 'Atalanta', [0, 1]],
    ['2026-11-08', 'Inter de Milán', 'Como', [2, 0]],
    ['2026-11-08', 'Fiorentina', 'Juventus', [2, 2]]
]);

agregar('bundesliga', 'Jornada 9 de 34', [
    ['2026-11-07', 'Mainz 05', 'Bayern Múnich', [1, 2]]
]);

agregar('colombia', 'Clausura · Jornada 17 de 19', [
    ['2026-11-04T20:30', 'Millonarios', 'América de Cali', [0, 0]]
]);
agregar('colombia', 'Clausura · Jornada 18 de 19', [
    ['2026-11-06T18:00', 'Boyacá Chicó', 'Internacional de Bogotá', [2, 1]],
    ['2026-11-08', 'Santa Fe', 'Pasto', [5, 0]]
]);
agregar('colombia', 'Clausura · Jornada 19 de 19', [
    ['2026-11-13T20:30', 'Internacional de Bogotá', 'Santa Fe'],
    ['2026-11-14T15:30', 'Millonarios', 'Alianza']
]);

agregar('brasil', 'Jornada 34 de 38', [
    ['2026-11-04', 'Flamengo', 'Grêmio', [3, 1]],
    ['2026-11-04', 'Palmeiras', 'Remo', [6, 1]],
    ['2026-11-05T19:30', 'Cruzeiro', 'Bahía', [3, 2]],
    ['2026-11-06T18:00', 'Vitória', 'Fluminense', [0, 3]]
]);

/* ---------- UEFA Champions League · fase de liga, jornada 4 (3 y 4 de nov) ---------- */
agregar('champions', 'Fase de liga · Jornada 4 de 8', [
    ['2026-11-03T12:45', 'Shakhtar Donetsk', 'Sporting CP', [0, 1]],
    ['2026-11-03', 'Galatasaray', 'Stuttgart', [2, 0]],
    ['2026-11-03', 'Feyenoord', 'Inter de Milán', [0, 3]],
    ['2026-11-03T15:00', 'Bodø/Glimt', 'Lille', [0, 0]],
    ['2026-11-03T15:00', 'Atlético de Madrid', 'Bayern Múnich', [0, 2]],
    ['2026-11-03T15:00', 'Villarreal', 'Paris Saint-Germain', [0, 6]],
    ['2026-11-03T15:00', 'Barcelona', 'Aston Villa', [3, 0]],
    ['2026-11-03T15:00', 'Manchester United', 'Roma', [3, 2]],
    ['2026-11-03T15:00', 'LASK', 'Slovan Bratislava', [4, 0]],
    ['2026-11-04T12:45', 'AEK Atenas', 'Real Madrid', [2, 3]],
    ['2026-11-04T12:45', 'Fenerbahçe', 'Liverpool', [3, 2]],
    ['2026-11-04T15:00', 'Borussia Dortmund', 'Real Betis', [2, 1]],
    ['2026-11-04T15:00', 'Porto', 'Napoli', [4, 1]],
    ['2026-11-04T15:00', 'PSV', 'Club Brugge', [1, 2]],
    ['2026-11-04T15:00', 'RB Leipzig', 'Manchester City', [2, 3]],
    ['2026-11-04T15:00', 'Lens', 'Como', [1, 9]],
    ['2026-11-04T15:00', 'Slavia Praga', 'Arsenal', [1, 2]],
    ['2026-11-04T15:00', 'Viking', 'Sabah', [4, 1]]
]);
