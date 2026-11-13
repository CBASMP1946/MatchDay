/* ============================================================
   MATCHDAY - Tablas de posiciones (API-Football /standings, a través de tu proxy).
   Una consulta por competición, guardada en el teléfono (cachePosicionesMin en config.js)
   para gastar poco del cupo diario. Solo se pide cuando abres la pestaña "Posiciones".
   ============================================================ */
const Posiciones = (() => {
    const CFG = (typeof MATCHDAY_CONFIG !== 'undefined' && MATCHDAY_CONFIG) || {};
    const TEMPORADA = CFG.temporada || 2026;
    const TTL_MIN = CFG.cachePosicionesMin || 60;

    /* Competición de Matchday -> id de la liga en API-Football */
    const LIGA_API = {
        pl: 39, laliga: 140, seriea: 135, bundesliga: 78, ligue1: 61,
        colombia: 239, mexico: 262, argentina: 128, brasil: 71, mls: 253,
        libertadores: 13, sudamericana: 11
    };

    const COLOR = { azul: '#1f5eff', naranja: '#f5a623', verde: '#22c55e', rojo: '#ff4d5e', teal: '#2fb6a3' };
    const guardar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
    const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) || def; } catch (e) { return def; } };
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const seleccion = {};   // liga -> grupo elegido (índice o 'todos')
    let turno = 0;          // descarta respuestas viejas si el usuario cambia de liga/vista rápido

    /* ---------- Datos ---------- */
    function procesar(resp) {
        const grupos = (resp && resp[0] && resp[0].league && resp[0].league.standings) || [];
        return grupos.filter(g => g && g.length).map(g => ({
            nombre: String(g[0].group || '').replace(/^Group\b/i, 'Grupo'),
            filas: g.map(r => ({
                pos: r.rank, nombre: r.team.name, logo: r.team.logo,
                pts: r.points, dg: r.goalsDiff,
                pj: r.all.played, g: r.all.win, e: r.all.draw, p: r.all.lose,
                gf: r.all.goals['for'], gc: r.all.goals.against,
                forma: r.form || '', desc: r.description || '', upd: r.update || ''
            }))
        }));
    }

    async function cargar(liga, forzar) {
        const clave = 'md-pos-' + liga;
        const guardado = leer(clave, null);
        if (guardado && !forzar && Date.now() - guardado.t < TTL_MIN * 60000) return { datos: guardado, viejo: false };
        try {
            const resp = await EnVivo.pedir('/standings', { league: LIGA_API[liga], season: TEMPORADA });
            const datos = { t: Date.now(), grupos: procesar(resp) };
            guardar(clave, datos);
            return { datos, viejo: false };
        } catch (e) {
            if (guardado) return { datos: guardado, viejo: true };   // mejor una tabla vieja que nada
            throw e;
        }
    }

    /* ---------- Presentación ---------- */
    const hace = t => {
        const m = Math.round((Date.now() - t) / 60000);
        if (m < 1) return 'ahora';
        if (m < 60) return `hace ${m} min`;
        const h = Math.round(m / 60);
        return h < 24 ? `hace ${h} h` : `hace ${Math.round(h / 24)} d`;
    };

    /* Color de la franja según lo que da la posición (lo dice la API en "description") */
    function zona(liga, d) {
        if (!d) return '';
        if (LIGAS[liga].copa) return /sudamericana|play-?off/i.test(d) ? 'naranja' : (/relegat/i.test(d) ? 'rojo' : 'azul');
        if (/conference/i.test(d)) return 'verde';
        if (/europa|sudamericana/i.test(d)) return 'naranja';
        if (/relegat|descenso/i.test(d)) return 'rojo';
        if (/champions|libertadores|promotion|ascenso/i.test(d)) return 'azul';
        return 'teal';   // liguilla, playoffs, octavos...
    }

    function limpiar(d) {
        return d.replace(/\s*\([^)]*\)/g, '').trim()
            .replace(/^Promotion\s*-\s*/i, 'Clasifica a ')
            .replace(/^Promotion$/i, 'Ascenso')
            .replace(/Relegation/i, 'Descenso')
            .replace(/Round of 16/i, 'Octavos de final')
            .replace(/Knockout round play-?offs?/i, 'Playoffs de eliminación')
            .replace(/Play-?offs?/i, 'Playoffs');
    }

    /* Si el equipo existe en la app se muestra con su nombre y escudo; si no, con los de la API */
    function equipoHTML(liga, f, nombres) {
        let mejor = null, s = 0;
        nombres.forEach(n => { const v = EnVivo.sim(n, f.nombre); if (v > s) { s = v; mejor = n; } });
        if (mejor && s >= 0.7) return `${escudoHTML(mejor)}<span>${esc(mejor)}</span>`;
        const ini = iniciales(f.nombre);
        const img = f.logo
            ? `<img src="${esc(f.logo)}" class="escudo" alt="" loading="lazy" referrerpolicy="no-referrer" data-ini="${ini}" onerror="escudoFallback(this)">`
            : `<span class="escudo escudo-iniciales">${ini}</span>`;
        return `${img}<span>${esc(f.nombre)}</span>`;
    }

    const formaHTML = s => s ? [...s.slice(-5)].map(c =>
        `<i class="f-${c === 'W' ? 'g' : c === 'D' ? 'e' : 'p'}"></i>`).join('') : '';

    function tablaHTML(liga, g, nombres, titulo) {
        const filas = g.filas.map(f => {
            const z = zona(liga, f.desc);
            const dg = f.dg > 0 ? '+' + f.dg : f.dg;
            return `<tr${z ? ` class="z-${z}"` : ''}>
                <td class="c-pos"><span class="pos-num">${f.pos}</span></td>
                <td class="c-eq"><div class="pos-eq">${equipoHTML(liga, f, nombres)}</div></td>
                <td>${f.pj}</td><td>${f.g}</td><td>${f.e}</td><td>${f.p}</td>
                <td class="c-ancho">${f.gf}</td><td class="c-ancho">${f.gc}</td>
                <td>${dg}</td><td class="c-pts">${f.pts}</td>
                <td class="c-ancho c-forma">${formaHTML(f.forma)}</td>
            </tr>`;
        }).join('');
        return `<div class="pos-bloque">
            ${titulo ? `<div class="pos-titulo">${esc(titulo)}</div>` : ''}
            <div class="pos-scroll"><table class="pos-tabla">
                <thead><tr><th class="c-pos">#</th><th class="c-eq">Equipo</th>
                    <th>PJ</th><th>G</th><th>E</th><th>P</th>
                    <th class="c-ancho">GF</th><th class="c-ancho">GC</th><th>DG</th><th>Pts</th>
                    <th class="c-ancho c-forma">Forma</th></tr></thead>
                <tbody>${filas}</tbody>
            </table></div></div>`;
    }

    /* Grupo que se muestra al abrir: la fase más reciente (por fecha de actualización) */
    function porDefecto(liga, grupos) {
        if (grupos.length < 2) return 0;
        if (LIGAS[liga].copa) return 'todos';
        const acumulada = n => /reclasific|relegation|descenso|acumulad|aggregate|general/i.test(n);
        let mejor = 0, max = '';
        grupos.forEach((g, i) => {
            if (acumulada(g.nombre)) return;
            const u = g.filas.reduce((m, f) => f.upd > m ? f.upd : m, '');
            if (u > max) { max = u; mejor = i; }
        });
        return mejor;
    }

    function pintar(cont, liga, r) {
        const { grupos, t } = r.datos;
        if (!grupos.length) {
            cont.innerHTML = '<p class="vacio">Esta competición aún no tiene tabla de posiciones.</p>';
            return;
        }
        let sel = seleccion[liga];
        if (!(sel === 'todos' ? grupos.length > 1 : grupos[sel])) sel = porDefecto(liga, grupos);

        const ambito = LIGAS[liga].copa ? PARTIDOS : PARTIDOS.filter(p => p.liga === liga);
        const nombres = [...new Set(ambito.flatMap(p => [p.local, p.visitante]))];
        const visibles = sel === 'todos' ? grupos : [grupos[sel]];
        const conTitulo = grupos.length > 1;

        const usados = [];
        visibles.forEach(g => g.filas.forEach(f => {
            const z = zona(liga, f.desc);
            if (z && !usados.some(u => u.z === z && u.txt === limpiar(f.desc))) usados.push({ z, txt: limpiar(f.desc) });
        }));

        const select = grupos.length > 1
            ? `<select class="pos-select" aria-label="Grupo">${grupos.map((g, i) =>
                `<option value="${i}"${sel === i ? ' selected' : ''}>${esc(g.nombre || 'Tabla')}</option>`).join('')}
                <option value="todos"${sel === 'todos' ? ' selected' : ''}>Todos los grupos</option></select>`
            : '';
        const reciente = Date.now() - t < 5 * 60000;
        const tema = LIGAS[liga].tema;

        cont.innerHTML = `
            <div class="pos-controles">
                ${select}
                <span class="pos-info">${r.viejo ? 'Sin conexión con la API · ' : ''}Actualizado ${hace(t)}</span>
                <button class="pos-refrescar" aria-label="Actualizar tabla"${reciente ? ' disabled' : ''}>↻</button>
            </div>
            <div class="${tema ? 'tema-' + tema : ''}">
                ${visibles.map(g => tablaHTML(liga, g, nombres, conTitulo ? g.nombre : '')).join('')}
            </div>
            ${usados.length ? `<div class="pos-leyenda">${usados.map(u =>
                `<span><i style="background:${COLOR[u.z]}"></i>${esc(u.txt)}</span>`).join('')}</div>` : ''}`;

        const s = cont.querySelector('.pos-select');
        if (s) s.addEventListener('change', () => {
            seleccion[liga] = s.value === 'todos' ? 'todos' : Number(s.value);
            pintar(cont, liga, r);
        });
        const b = cont.querySelector('.pos-refrescar');
        if (b) b.addEventListener('click', () => render(cont, liga, true));
    }

    async function render(cont, liga, forzar) {
        const mio = ++turno;
        if (!EnVivo.activo) {
            cont.innerHTML = '<p class="vacio">Para ver las tablas de posiciones configura <b>apiUrl</b> en config.js (mira LEEME.md).</p>';
            return;
        }
        if (!LIGA_API[liga]) {
            cont.innerHTML = '<p class="vacio">Esta competición no tiene tabla disponible.</p>';
            return;
        }
        cont.innerHTML = '<p class="vacio">Cargando tabla…</p>';
        try {
            const r = await cargar(liga, forzar);
            if (mio === turno) pintar(cont, liga, r);
        } catch (e) {
            if (mio !== turno) return;
            const pausa = /rateLimit|en pausa/i.test(e.message);
            cont.innerHTML = `<p class="vacio">${pausa
                ? 'La API está en pausa por el límite de consultas. Prueba de nuevo en un minuto.'
                : 'No se pudo cargar la tabla.'}<br><button class="pos-reintentar">Reintentar</button></p>`;
            cont.querySelector('.pos-reintentar').addEventListener('click', () => render(cont, liga, false));
        }
    }

    /* Al volver a la lista de partidos, una respuesta tardía no debe pisarla */
    const cancelar = () => { turno++; };

    return { render, cancelar };
})();
