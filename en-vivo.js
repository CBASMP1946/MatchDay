/* ============================================================
   MATCHDAY - Datos en vivo (API-Football a través de tu proxy).
   Llena LIVE (estado, minuto, marcador) y DETALLE (goles, tarjetas,
   estadísticas, alineaciones). Sin apiUrl en config.js no hace nada.
   ============================================================ */
const EnVivo = (() => {
    const CFG = (typeof MATCHDAY_CONFIG !== 'undefined' && MATCHDAY_CONFIG) || {};
    const API = (CFG.apiUrl || '').replace(/\/$/, '');
    const DETALLE = {};

    const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } };
    const MAPA = leer('md-mapa', {});              // id de Matchday -> id de la API
    Object.assign(LIVE, leer('md-live', {}));      // último estado conocido

    /* Nombres que no se parecen lo suficiente al de la API (el resto se empareja solo) */
    const ALIAS = {
        'Inter de Milán': ['Inter'], 'Olympique de Marsella': ['Marseille'],
        'Paranaense': ['Athletico-PR', 'Athletico Paranaense'], 'Atlético Mineiro': ['Atletico-MG'],
        'New York RB': ['New York Red Bulls'], 'NYC FC': ['New York City FC'],
        'SJ Earthquakes': ['San Jose Earthquakes'], "Newell's": ['Newells Old Boys']
    };
    const RUIDO = ['fc', 'cf', 'sc', 'ac', 'as', 'cd', 'club', 'de', 'del', 'la', 'el', 'ca', 'afc', 'ud'];
    const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
    const toks = s => new Set(norm(s).split(' ').filter(t => t && !RUIDO.includes(t)));

    function sim(nuestro, api) {
        if ((ALIAS[nuestro] || []).some(a => norm(a) === norm(api))) return 1;
        const ta = toks(nuestro), tb = toks(api);
        const comunes = [...ta].filter(t => tb.has(t)).length;
        if (!comunes) return 0;
        if (comunes === ta.size && comunes === tb.size) return 1;
        return 0.7 * comunes / Math.min(ta.size, tb.size);
    }

    const claveFecha = p => { const o = partes(p.inicio); return `${o.year}-${o.month}-${o.day}`; };

    /* Busca en la lista de la API el partido que corresponde al nuestro (hora + nombres).
       Si quieres forzarlo, agrega apiId: 12345 al partido en datos.js. */
    function emparejar(p, lista) {
        const fijo = p.apiId || MAPA[p.id];
        if (fijo) return lista.find(f => f.fixture.id === fijo) || null;
        const t0 = new Date(p.inicio).getTime();
        let mejor = null, puntos = 0;
        lista.forEach(f => {
            const dif = Math.abs(f.fixture.timestamp * 1000 - t0) / 60000;
            if (dif > 90) return;
            const a = sim(p.local, f.teams.home.name), b = sim(p.visitante, f.teams.away.name);
            const s = a + b - dif / 1000;
            if (a >= 0.5 && b >= 0.5 && a + b >= 1.2 && s > puntos) { mejor = f; puntos = s; }
        });
        if (mejor) { MAPA[p.id] = mejor.fixture.id; guardar('md-mapa', MAPA); }
        return mejor;
    }

    function aplicar(p, f) {
        const s = f.fixture.status;
        LIVE[p.id] = {
            estado: s.short, min: s.elapsed || 0, extra: s.extra || 0,
            marcador: f.goals.home == null ? null : [f.goals.home, f.goals.away], t: Date.now()
        };
    }

    async function pedir(ruta, params) {
        const u = new URL(API + ruta);
        Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
        const r = await fetch(u);
        const j = await r.json();
        const errores = j.errors && (Array.isArray(j.errors) ? j.errors.length : Object.keys(j.errors).length);
        if (!r.ok || errores) throw new Error(errores ? JSON.stringify(j.errors) : 'HTTP ' + r.status);
        return j.response;
    }

    /* Una sola consulta trae TODOS los partidos de un día: estado, minuto y marcador */
    async function sincronizar(fecha) {
        const lista = await pedir('/fixtures', { date: fecha, timezone: TZ });
        PARTIDOS.filter(p => claveFecha(p) === fecha).forEach(p => {
            const f = emparejar(p, lista);
            if (f) aplicar(p, f);
        });
        guardar('md-live', LIVE);
    }

    /* Días que vale la pena consultar: los de partidos por empezar (2 min antes) o en curso (hasta 3 h) */
    function fechasActivas(incluirHoy) {
        const ahora = Date.now();
        const set = new Set(incluirHoy ? [claveFecha({ inicio: new Date().toISOString() })] : []);
        PARTIDOS.forEach(p => {
            const ini = new Date(p.inicio).getTime(), l = LIVE[p.id];
            if (l && E_FIJOS.includes(l.estado)) return;
            if (ahora > ini - 120000 && ahora < ini + 175 * 60000) set.add(claveFecha(p));
        });
        return [...set];
    }

    function bucle(tarea, segundos, seguir) {
        let timer;
        const ciclo = async () => {
            clearTimeout(timer);
            if (!document.hidden) await tarea();
            timer = setTimeout(ciclo, seguir() ? segundos() * 1000 : 60000);
        };
        document.addEventListener('visibilitychange', () => { if (!document.hidden) ciclo(); });
        ciclo();
    }

    function iniciarLista(cb) {
        if (!API) return;
        cb();
        let primera = true;
        bucle(async () => {
            const fechas = fechasActivas(primera);
            primera = false;
            for (const f of fechas) {
                try { await sincronizar(f); } catch (e) { console.warn('En vivo:', e.message); }
            }
            if (fechas.length) cb();
        }, () => CFG.intervaloLista || 120, () => fechasActivas(false).length > 0);
    }

    /* ---------- Detalle de un partido ---------- */
    const ES = {
        'Ball Possession': 'Posesión', 'Total Shots': 'Remates', 'Shots on Goal': 'Remates al arco',
        'Corner Kicks': 'Tiros de esquina', 'Fouls': 'Faltas', 'Offsides': 'Fuera de juego',
        'Yellow Cards': 'Amarillas', 'Red Cards': 'Rojas', 'Goalkeeper Saves': 'Atajadas',
        'Passes %': 'Precisión de pases', 'expected_goals': 'Goles esperados (xG)'
    };

    function procesarDetalle(f) {
        const H = f.teams.home.id, A = f.teams.away.id;
        const min = e => `${e.time.elapsed}${e.time.extra ? '+' + e.time.extra : ''}'`;
        const evs = (f.events || []).filter(e => e.comments !== 'Penalty Shootout');
        const lado = id => id === H ? 'local' : 'visitante';

        // Autogoles: se prueba a quién los acredita la API y se deja la versión que cuadra con el marcador
        const goles = invertir => {
            const r = { local: [], visitante: [] };
            evs.filter(e => e.type === 'Goal' && e.detail !== 'Missed Penalty').forEach(e => {
                const propio = e.detail === 'Own Goal';
                const local = (e.team.id === H) !== (propio && invertir);
                r[local ? 'local' : 'visitante'].push({
                    jugador: e.player.name + (e.detail === 'Penalty' ? ' (p)' : propio ? ' (a.p.)' : ''), min: min(e)
                });
            });
            return r;
        };
        const cuadra = g => g.local.length === f.goals.home && g.visitante.length === f.goals.away;
        let g = goles(false);
        if (!cuadra(g) && cuadra(goles(true))) g = goles(true);

        const tarjetas = tipos => {
            const r = { local: [], visitante: [] };
            evs.filter(e => e.type === 'Card' && tipos.includes(e.detail)).forEach(e =>
                r[lado(e.team.id)].push({ jugador: e.player.name + (e.detail === 'Second Yellow card' ? ' (2.ª amarilla)' : ''), min: min(e) }));
            return r;
        };

        const st = f.statistics || [];
        const sl = st.find(s => s.team.id === H), sv = st.find(s => s.team.id === A);
        const val = (s, t) => { const x = s.statistics.find(i => i.type === t); return x && x.value != null ? x.value : 0; };
        const estadisticas = sl && sv
            ? Object.keys(ES).filter(t => sl.statistics.some(i => i.type === t)).map(t => ({ label: ES[t], local: val(sl, t), visitante: val(sv, t) }))
            : [];

        const li = f.lineups || [];
        const lh = li.find(x => x.team.id === H), la = li.find(x => x.team.id === A);
        const once = x => x.startXI.map(j => `${j.player.number} · ${j.player.name}`);

        return {
            goles: g, rojas: tarjetas(['Red Card', 'Second Yellow card']), amarillas: tarjetas(['Yellow Card']),
            estadisticas, alineaciones: lh && la ? { local: once(lh), visitante: once(la) } : null,
            arbitro: f.fixture.referee, estadio: f.fixture.venue && f.fixture.venue.name,
            ciudad: f.fixture.venue && f.fixture.venue.city, fin: E_FIJOS.includes(f.fixture.status.short)
        };
    }

    async function cargarDetalle(p) {
        if (!(p.apiId || MAPA[p.id])) await sincronizar(claveFecha(p));
        const id = p.apiId || MAPA[p.id];
        if (!id) return;
        const [f] = await pedir('/fixtures', { id, timezone: TZ });
        if (!f) return;
        aplicar(p, f);
        guardar('md-live', LIVE);
        DETALLE[p.id] = procesarDetalle(f);
        guardar('md-det-' + p.id, DETALLE[p.id]);
    }

    function iniciarDetalle(p, cb) {
        if (!API) return;
        DETALLE[p.id] = leer('md-det-' + p.id, null);
        if (DETALLE[p.id]) cb();
        const ini = new Date(p.inicio).getTime();
        const enCurso = () => Date.now() < ini + 175 * 60000;
        bucle(async () => {
            const cerrado = DETALLE[p.id] && DETALLE[p.id].fin;
            if (Date.now() < ini - 90 * 60000 || cerrado) return;   // alineaciones salen ~1 h antes
            try { await cargarDetalle(p); cb(); } catch (e) { console.warn('En vivo:', e.message); }
        }, () => CFG.intervaloDetalle || 60, () => enCurso() && !(DETALLE[p.id] && DETALLE[p.id].fin));
    }

    return { activo: !!API, iniciarLista, iniciarDetalle, detalleDe: id => DETALLE[id] };
})();
