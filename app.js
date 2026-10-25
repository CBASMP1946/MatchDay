if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('Matchday PWA inicializada.'))
        .catch(err => console.error(err));
}

let ligaActiva = 'todas';

function renderizarFiltros() {
    const barra = document.getElementById('filtros');
    const items = [['todas', 'Todas'], ...Object.entries(LIGAS).map(([k, v]) => [k, v.corto])];
    barra.innerHTML = items.map(([k, label]) =>
        `<button class="chip ${k === ligaActiva ? 'activo' : ''}" data-liga="${k}">${k === 'todas' ? '' : banderaHTML(k, 'bandera-chip')}${label}</button>`
    ).join('');
    barra.querySelectorAll('.chip').forEach(btn => {
        btn.addEventListener('click', () => {
            ligaActiva = btn.dataset.liga;
            renderizarFiltros();
            renderizarPartidos();
        });
    });
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
        header.className = 'torneo-header';
        header.innerHTML = `${banderaHTML(clave)}<span>${LIGAS[clave].nombre}</span>`;
        container.appendChild(header);

        const bloque = document.createElement('div');
        bloque.className = 'contenedor-partidos';

        partidos.forEach(p => {
            const fila = document.createElement('a');
            fila.className = 'partido';
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
    renderizarFiltros();
    renderizarPartidos();
    EnVivo.iniciarLista(actualizarFilas);       // consulta la API (si hay apiUrl en config.js)
    setInterval(actualizarFilas, 20000);        // mantiene el minuto corriendo entre consultas
});
