const PENDIENTE = 'Por confirmar';
let ultimoHTML = '';
const pick = (a, b) => (a && (a.local.length || a.visitante.length)) ? a : b;

function fila(label, valor) {
    return `<div class="dato"><span class="dato-label">${label}</span><span class="dato-valor">${valor || PENDIENTE}</span></div>`;
}


function eventosHTML(lista, icono) {
    return (lista || []).map(e =>
        `<div class="evento"><span>${icono}</span><span>${e.jugador}</span><span class="min">${e.min}</span></div>`
    ).join('');
}

function estadisticaHTML(e) {
    const a = parseFloat(e.local), b = parseFloat(e.visitante);
    const pct = (a + b) ? Math.round(a / (a + b) * 100) : 50;
    return `
        <div class="stat">
            <div class="stat-fila">
                <span class="stat-v">${e.local}</span>
                <span class="stat-l">${e.label}</span>
                <span class="stat-v">${e.visitante}</span>
            </div>
            <div class="stat-barra"><i style="width:${pct}%"></i></div>
        </div>`;
}

function renderDetalle() {
    const cont = document.getElementById('detalle-container');
    const id = Number(new URLSearchParams(location.search).get('id'));
    const p = PARTIDOS.find(x => x.id === id);

    if (!p) {
        cont.innerHTML = '<p class="vacio">Partido no encontrado.</p>';
        return;
    }

    const D = EnVivo.detalleDe(p.id) || {};   // datos de la API (si hay)
    document.title = `${p.local} vs ${p.visitante} - Matchday`;
    const estado = estadoPartido(p);
    const mar = marcadorDe(p);
    const hayMarcador = mar && estado !== 'prog';

    const centro = hayMarcador
        ? `<div class="marcador-grande">${mar[0]} <span>-</span> ${mar[1]}</div>`
        : `<div class="vs-grande">VS</div>`;

    let html = `
        <section class="tarjeta hero">
            <div class="hero-liga">${banderaHTML(p.liga)}<span>${LIGAS[p.liga].nombre}</span></div>
            <div class="hero-fecha">${fechaLarga(p)}</div>
            <div class="hero-equipos">
                <div class="hero-equipo">
                    ${escudoHTML(p.local, 'escudo-grande')}
                    <span>${p.local}</span>
                </div>
                ${centro}
                <div class="hero-equipo">
                    ${escudoHTML(p.visitante, 'escudo-grande')}
                    <span>${p.visitante}</span>
                </div>
            </div>
            ${estado === 'vivo' ? `<div class="hero-minuto">${etiquetaTiempo(p)}</div>` : ''}
            <span class="estado-badge estado-${estado}">${ETIQUETA_ESTADO[estado]}</span>
        </section>

        <section class="tarjeta">
            <h2>Información del partido</h2>
            ${fila('Estadio', D.estadio || p.estadio)}
            ${fila('Ciudad', D.ciudad || p.ciudad)}
            ${fila('Jornada', p.jornada)}
            ${fila('Árbitro', D.arbitro || p.arbitro)}
            ${fila('Transmisión', p.tv)}
        </section>`;


    // Goles y tarjetas
    const gl = pick(D.goles, p.goles), ro = pick(D.rojas, p.rojas), am = D.amarillas;
    if ([gl, ro, am].some(x => x && (x.local.length || x.visitante.length))) {
        const lado = k => eventosHTML(gl && gl[k], '⚽') + eventosHTML(am && am[k], '🟨') + eventosHTML(ro && ro[k], '🟥');
        html += `<section class="tarjeta"><h2>Goles y tarjetas</h2>
            <div class="eventos-grid">
                <div>${lado('local')}</div>
                <div class="der">${lado('visitante')}</div>
            </div></section>`;
    }

    // Estadísticas
    const est = D.estadisticas && D.estadisticas.length ? D.estadisticas : p.estadisticas;
    if (est && est.length) {
        html += `<section class="tarjeta"><h2>Estadísticas del equipo</h2>${est.map(estadisticaHTML).join('')}</section>`;
    }


    // Cara a cara
    html += `<section class="tarjeta"><h2>Cara a cara</h2>`;
    if (p.h2h && p.h2h.length) {
        html += p.h2h.map(m => `
            <div class="h2h-fila">
                <span class="h2h-fecha">${m.fecha}</span>
                <span class="h2h-eq">${m.local}</span>
                <span class="h2h-res">${m.marcador}</span>
                <span class="h2h-eq der">${m.visitante}</span>
            </div>`).join('');
    } else {
        html += `<p class="vacio-mini">${PENDIENTE}</p>`;
    }
    html += `</section>`;

    // Alineaciones
    html += `<section class="tarjeta"><h2>Alineaciones</h2>`;
    const ali = D.alineaciones || p.alineaciones;
    if (ali) {
        const lista = arr => arr.map(j => `<li>${j}</li>`).join('');
        html += `
            <div class="alineaciones">
                <div><h3>${p.local}</h3><ul>${lista(ali.local)}</ul></div>
                <div><h3>${p.visitante}</h3><ul>${lista(ali.visitante)}</ul></div>
            </div>`;
    } else {
        html += `<p class="vacio-mini">${PENDIENTE}</p>`;
    }
    html += `</section>`;

    if (html !== ultimoHTML) { cont.innerHTML = html; ultimoHTML = html; }
}

document.addEventListener('DOMContentLoaded', () => {
    renderDetalle();
    const p = PARTIDOS.find(x => x.id === Number(new URLSearchParams(location.search).get('id')));
    if (p) EnVivo.iniciarDetalle(p, renderDetalle);   // consulta la API (si hay apiUrl)
    setInterval(renderDetalle, 20000);                // minuto corriendo entre consultas
});
