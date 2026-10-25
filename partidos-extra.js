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
    mls:       { nombre: 'EE. UU.: MLS',                  corto: 'MLS' }
});

let _idExtra = 100;
function agregar(liga, jornada, filas) {
    filas.forEach(([inicio, local, visitante, marcador]) => {
        PARTIDOS.push({
            id: _idExtra++, liga, jornada, local, visitante,
            inicio: inicio + ':00-05:00',
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
