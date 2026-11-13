if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Matchday PWA inicializada.'))
        .catch(err => console.error(err));
}

/* Recuerda la vista y la liga mientras dure la sesión (al volver desde un partido) */
const guardarSes = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };
const leerSes = (k, def) => { try { return sessionStorage.getItem(k) || def; } catch (e) { return def; } };

let ligaActiva = leerSes('md-liga', 'todas');
let vista = leerSes('md-vista', 'partidos');      // 'partidos' | 'posiciones'
if (ligaActiva !== 'todas' && !LIGAS[ligaActiva]) ligaActiva = 'todas';
if (vista !== 'posiciones') vista = 'partidos';
if (vista === 'posiciones' && ligaActiva === 'todas') ligaActiva = Object.keys(LIGAS)[0];

function renderizarVistas() {
    const barra = document.getElementById('vistas');
    barra.innerHTML = [['partidos', 'Partidos'], ['posiciones', 'Posiciones']].map(([k, label]) =>
        `<button class="vista-btn ${k === vista ? 'activo' : ''}" data-vista="${k}" aria-pressed="${k === vista}">${label}</button>`
    ).join('');
    barra.querySelectorAll('.vista-btn').forEach(btn =>
        btn.addEventListener('click', () => cambiarVista(btn.dataset.vista)));
}

function cambiarVista(v) {
    if (v === vista) return;
    vista = v;
    // La tabla es de una sola competición: si estaba en "Todas", se empieza por la primera
    if (vista === 'posiciones' && ligaActiva === 'todas') ligaActiva = Object.keys(LIGAS)[0];
    guardarSes('md-vista', vista);
    guardarSes('md-liga', ligaActiva);
    renderizarVistas();
    renderizarFiltros();
    renderizarContenido();
}

function renderizarFiltros() {
    const barra = document.getElementById('filtros');
    const ligas = Object.entries(LIGAS).map(([k, v]) => [k, v.corto]);
    const items = vista === 'posiciones' ? ligas : [['todas', 'Todas'], ...ligas];
    barra.innerHTML = items.map(([k, label]) =>
        `<button class="chip ${k === ligaActiva ? 'activo' : ''}" data-liga="${k}">${k === 'todas' ? '' : banderaHTML(k, 'bandera-chip')}${label}</button>`
    ).join('');
    barra.querySelectorAll('.chip').forEach(btn => {
        btn.addEventListener('click', () => {
            ligaActiva = btn.dataset.liga;
            guardarSes('md-liga', ligaActiva);
            renderizarFiltros();
            renderizarContenido();
        });
    });
    // con 12 competiciones el chip activo puede quedar fuera de pantalla
    const activo = barra.querySelector('.chip.activo');
    if (activo && activo.scrollIntoView) {
        try { activo.scrollIntoView({ inline: 'center', block: 'nearest' }); } catch (e) {}
    }
}

function renderizarContenido() {
    if (vista === 'posiciones') {
        Posiciones.render(document.getElementById('partidos-container'), ligaActiva);
    } else {
        Posiciones.cancelar();
        renderizarPartidos();
    }
}

/* Actualiza solo lo que cambia (hora/minuto, marcador, estado) sin redibujar la lista */
function pintarFila(el, p) {
    const estado = estadoPartido(p);
    const mar = estado !== 'prog' && marcadorDe(p);
    el.querySelector('.info-tiempo').innerHTML = estado === 'vivo'
        ? `<span class="star-icon">☆</span><span class="min-vivo">${etiquetaTiempo(p)}</span>`
        : `<span class="star-icon">☆</span><span>${fechaCorta(p)}</span>`;
    const g = el.querySelector('.goles');
    g.className = 'goles' + (estado === 'vivo' ? ' vivo' : '');
    g.innerHTML = mar ? `<span>${mar[0]}</span><span>${mar[1]}</span>` : '';
    const b = el.querySelector('.estado-badge');
    b.className = `estado-badge estado-${estado}`;
    b.textContent = ETIQUETA_ESTADO[estado];
}

function actualizarFilas() {
    document.querySelectorAll('.partido[data-id]').forEach(el =>
        pintarFila(el, PARTIDOS.find(p => p.id === Number(el.dataset.id))));
}

function renderizarPartidos() {
    const container = document.getElementById('partidos-container');
    container.innerHTML = '';

    const lista = PARTIDOS
        .filter(p => ligaActiva === 'todas' || p.liga === ligaActiva)
        .sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

    if (!lista.length) {
        container.innerHTML = '<p class="vacio">No hay partidos para esta liga.</p>';
        return;
    }

    // Agrupar por liga respetando el orden de LIGAS
    Object.keys(LIGAS).forEach(clave => {
        const partidos = lista.filter(p => p.liga === clave);
        if (!partidos.length) return;

        const header = document.createElement('div');
        header.className = 'torneo-header' + (LIGAS[clave].tema ? ` tema-${LIGAS[clave].tema}` : '');
        header.innerHTML = `${banderaHTML(clave)}<span>${LIGAS[clave].nombre}</span>`;
        container.appendChild(header);

        const bloque = document.createElement('div');
        bloque.className = 'contenedor-partidos';

        partidos.forEach(p => {
            const tema = temaFinal(p);   // 'oro' | 'plata' | null
            const fila = document.createElement('a');
            fila.className = 'partido' + (tema ? ` final-${tema}` : '');
            fila.href = `detalle.html?id=${p.id}`;
            fila.dataset.id = p.id;
            fila.innerHTML = `
                <div class="info-tiempo"></div>
                <div class="equipos-contenedor">
                    <div class="fila-equipo">${escudoHTML(p.local)}<span>${p.local}</span></div>
                    <div class="fila-equipo">${escudoHTML(p.visitante)}<span>${p.visitante}</span></div>
                </div>
                <div class="goles"></div>
                <div class="acciones-partido">
                    ${tema ? '<span class="tag-final">FINAL</span>' : ''}
                    <span class="estado-badge"></span>
                    <span class="chevron">›</span>
                </div>`;
            pintarFila(fila, p);
            bloque.appendChild(fila);
        });

        container.appendChild(bloque);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarVistas();
    renderizarFiltros();
    renderizarContenido();
    EnVivo.iniciarLista(actualizarFilas);       // consulta la API (si hay apiUrl en config.js)
    setInterval(actualizarFilas, 20000);        // mantiene el minuto corriendo entre consultas
});
