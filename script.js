let allVideos = [];

const monthNames = {
    "01": "Gennaio", "02": "Febbraio", "03": "Marzo", "04": "Aprile",
    "05": "Maggio", "06": "Giugno", "07": "Luglio", "08": "Agosto",
    "09": "Settembre", "10": "Ottobre", "11": "Novembre", "12": "Dicembre"
};

async function loadGallery() {
    try {
        const response = await fetch('data.json?v=1.6');
        allVideos = await response.json();
        
        allVideos.reverse();

        renderPeople(allVideos);
        renderMonthsAndYears(allVideos);
        renderAlbums(allVideos);
        renderVisuals(allVideos);
        renderVideos(allVideos);
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
    }
}

function renderPeople(videos) {
    const container = document.getElementById('people-albums');
    const hiddenPeople = ["Fava", "Itallo", "Gio", "Minetto", "Fabio"];
    let counts = {};
    let otherCounts = {};

    videos.forEach(v => {
        if (!v.Persone || v.Persone === "/") return;
        
        const personeNelVideo = Array.isArray(v.Persone) ? v.Persone : [v.Persone];
        personeNelVideo.forEach(p => {
            if (p && p !== "/") {
                if (hiddenPeople.includes(p)) {
                    otherCounts[p] = (otherCounts[p] || 0) + 1;
                } else {
                    counts[p] = (counts[p] || 0) + 1;
                }
            }
        });
    });

    const peopleSorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    let html = '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 10px;"><strong>Persone:</strong>' +
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button></div>` +
        '<div class="filter-row">' +
        peopleSorted.map(p => 
            `<button class="album-btn" onclick="filterByPerson('${p}')">${p} (${counts[p]})</button>`
        ).join('') +
        '</div>';

    const availableHiddenPeople = hiddenPeople.filter(p => otherCounts[p] > 0);

    if (availableHiddenPeople.length > 0) {
        html += '<div class="filter-row" style="margin-top: 8px;">' +
            `<button class="album-btn" onclick="toggleOtherPeople()"><strong>Altro ▾</strong></button>` +
            `<span id="other-people-container" style="display: none; margin-left: 4px;">` +
            availableHiddenPeople.map(p => 
                `<button class="album-btn" onclick="filterByPerson('${p}')">${p} (${otherCounts[p]})</button>`
            ).join('') +
            `</span></div>`;
    }

    container.innerHTML = html;
}

window.toggleOtherPeople = () => {
    const container = document.getElementById('other-people-container');
    if (container) {
        const isHidden = container.style.display === 'none';
        container.style.display = isHidden ? 'inline' : 'none';
    }
};

function renderMonthsAndYears(videos) {
    const dateContainer = document.getElementById('date-albums');
    let activePeriods = [];

    videos.forEach(v => {
        const [_, month, year] = v.Data.split('/');
        if (year !== "2020") {
            const periodKey = `${month}/${year}`;
            if (!activePeriods.includes(periodKey)) {
                activePeriods.push(periodKey);
            }
        }
    });

    activePeriods.sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        if (yearB !== yearA) return yearB - yearA;
        return monthB - monthA;
    });

    dateContainer.innerHTML = '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 10px;"><strong>Periodi:</strong>' + 
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button></div>` + 
        '<div class="filter-row">' +
        activePeriods.map(p => {
            const [m, y] = p.split('/');
            const label = `${monthNames[m]} ${y}`;
            return `<button class="album-btn" onclick="filterByMonthYear('${m}', '${y}')">${label}</button>`;
        }).join('') +
        '</div>' +
        '<div id="days-container" class="filter-row" style="margin-top: 8px; display: none;"></div>';
}

function renderAlbums(videos) {
    const container = document.getElementById('collection-albums');
    let counts = {};
    videos.forEach(v => {
        counts[v.Album] = (counts[v.Album] || 0) + 1;
    });

    let albumsSorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    
    const specialKeys = ["Timelapse", "Carnevale di Ivrea", "Altro", "Video Fabio"];
    let mainAlbums = albumsSorted.filter(a => !specialKeys.includes(a));
    let specialAlbums = specialKeys.filter(a => counts[a]);

    let html = '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 10px;"><strong>Album:</strong>' + 
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button></div>` + 
        '<div class="filter-row">' +
        mainAlbums.map(a => 
            `<button class="album-btn" onclick="filterByAlbum('${a}')">${a} (${counts[a]})</button>`
        ).join('') +
        '</div>';

    if (specialAlbums.length > 0) {
        html += '<div class="filter-row" style="margin-top: 8px;">' +
            specialAlbums.map(a => 
                `<button class="album-btn" onclick="filterByAlbum('${a}')">${a} (${counts[a]})</button>`
            ).join('') +
            '</div>';
    }

    container.innerHTML = html;
}

function renderVisuals(videos) {
    const container = document.getElementById('visual-albums');
    if (!container) return;

    let counts = {};

    videos.forEach(v => {
        if (!v.Visuale || v.Visuale === "/") return;
        counts[v.Visuale] = (counts[v.Visuale] || 0) + 1;
    });

    let visualsSorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

    if (counts["Fabio"]) {
        visualsSorted = visualsSorted.filter(v => v !== "Fabio");
        visualsSorted.push("Fabio");
    }

    let html = '<div style="margin-bottom: 6px; display: flex; align-items: center; gap: 10px;"><strong>Visuale:</strong>' +
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button></div>` +
        '<div class="filter-row">' +
        visualsSorted.map(v => 
            `<button class="album-btn" onclick="filterByVisual('${v}')">${v} (${counts[v]})</button>`
        ).join('') +
        '</div>';

    container.innerHTML = html;
}

window.filterByPerson = (personName) => {
    const filtered = allVideos.filter(v => {
        if (!v.Persone) return false;
        if (Array.isArray(v.Persone)) {
            return v.Persone.includes(personName);
        }
        return v.Persone === personName;
    });
    renderVideos(filtered, personName !== "Fabio");
};

window.filterByMonthYear = (monthCode, year) => {
    const filtered = allVideos.filter(v => {
        const [_, m, y] = v.Data.split('/');
        return y === year && m === monthCode;
    });

    filtered.sort((a, b) => {
        const dayA = parseInt(a.Data.split('/')[0], 10);
        const dayB = parseInt(b.Data.split('/')[0], 10);
        return dayB - dayA;
    });

    renderVideos(filtered, true);

    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        let dayCounts = {};

        filtered.forEach(v => {
            dayCounts[v.Data] = true;
        });

        const sortedDates = Object.keys(dayCounts).sort((a, b) => {
            return parseInt(b.split('/')[0], 10) - parseInt(a.split('/')[0], 10);
        });

        daysContainer.innerHTML = sortedDates.map(fullDate => {
            const [day, month] = fullDate.split('/');
            const label = `${day}/${month}`;
            return `<button class="album-btn" onclick="filterByExactDate('${fullDate}')">${label}</button>`;
        }).join('');

        daysContainer.style.display = 'flex';
    }
};

window.filterByExactDate = (fullDate) => {
    const filtered = allVideos.filter(v => v.Data === fullDate);
    currentVideosList = filtered;
    const container = document.getElementById('video-container');

    const [dayStr, monthCode, year] = fullDate.split('/');
    const day = parseInt(dayStr, 10); 
    const label = `${day} ${monthNames[monthCode]} ${year}`;

    const cardsHtml = filtered.map((v, index) => createVideoCardHtml(v, index)).join('');

    container.innerHTML = `
        <div class="month-section" style="grid-column: 1 / -1; width: 100%; margin-bottom: 25px;">
            <h2 class="month-title" style="font-size: 1.3rem; margin: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">${label}</h2>
            <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                ${cardsHtml}
            </div>
        </div>
    `;
};

window.filterByAlbum = (albumName) => {
    const filtered = allVideos.filter(v => v.Album === albumName);
    renderVideos(filtered, albumName !== "Video Fabio");
};

window.filterByVisual = (visualName) => {
    const filtered = allVideos.filter(v => v.Visuale === visualName);
    renderVideos(filtered, visualName !== "Fabio");
};

window.resetFilters = () => {
    renderVideos(allVideos);
    const daysContainer = document.getElementById('days-container');
    if (daysContainer) {
        daysContainer.style.display = 'none';
        daysContainer.innerHTML = '';
    }
};

function getYoutubeId(url) {
    try {
        if (!url || !url.includes('http')) return 'error'; 
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split('?')[0];
        }
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('v');
    } catch (e) {
        return 'error';
    }
}

let currentVideosList = [];

function renderVideos(videoList, groupByMonth = true) {
    currentVideosList = videoList;
    const container = document.getElementById('video-container');

    if (!groupByMonth) {
        container.innerHTML = videoList.map((v, index) => createVideoCardHtml(v, index)).join('');
        return;
    }

    let groups = {};
    let groupKeys = [];

    videoList.forEach((v, index) => {
        const parts = v.Data.split('/');
        if (parts.length < 3) return;
        const [day, month, year] = parts;

        let key;
        if (year === "2020" || v.Album === "Video Fabio") {
            key = "Video Fabio";
        } else {
            key = `${month}/${year}`;
        }

        if (!groups[key]) {
            groups[key] = [];
            groupKeys.push(key);
        }
        groups[key].push({ video: v, originalIndex: index });
    });

    groupKeys.sort((a, b) => {
        if (a === "Video Fabio") return 1;
        if (b === "Video Fabio") return -1;

        const [mA, yA] = a.split('/');
        const [mB, yB] = b.split('/');
        if (yB !== yA) return parseInt(yB, 10) - parseInt(yA, 10);
        return parseInt(mB, 10) - parseInt(mA, 10);
    });

    container.innerHTML = groupKeys.map(key => {
        let label;
        if (key === "Video Fabio") {
            label = "Video Fabio";
        } else {
            const [m, y] = key.split('/');
            label = `${monthNames[m]} ${y}`;
        }

        const cardsHtml = groups[key].map(item => createVideoCardHtml(item.video, item.originalIndex)).join('');

        return `
            <div class="month-section" style="grid-column: 1 / -1; width: 100%; margin-bottom: 25px;">
                <h2 class="month-title" style="font-size: 1.3rem; margin: 15px 0; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 6px;">${label}</h2>
                <div class="video-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
                    ${cardsHtml}
                </div>
            </div>
        `;
    }).join('');
}

function createVideoCardHtml(v, index) {
    const videoId = getYoutubeId(v.Link);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return `
    <div class="video-card">
        <div class="thumbnail-container" onclick="openModal(${index})">
            <img src="${thumbnailUrl}" alt="Miniatura ${v.Nome}" class="video-thumbnail">
        </div>
        <div class="video-title-main">${v.Nome}</div>
        <a href="${v.Link}" target="_blank" class="watch-link">Guarda su YouTube</a>
    </div>
    `;
}

window.openModal = (index) => {
    const modal = document.getElementById('video-modal');
    const modalBody = document.getElementById('modal-body');
    const v = currentVideosList[index];
    
    const videoId = getYoutubeId(v.Link);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const personeDisplay = Array.isArray(v.Persone) ? v.Persone.join(', ') : v.Persone;

    const risoluzioneVideo = v.Risoluzione || '1080p (Full HD)';
    const fotogrammiVideo = v.Fotogrammi || v.fotogrammiVideo || '60 FPS';

    modalBody.innerHTML = `
        <img src="${thumbnailUrl}" class="modal-thumbnail-large" alt="${v.Nome}">
        
        <a href="${v.Link}" target="_blank" class="watch-link" style="margin-bottom: 20px;">Guarda su YouTube</a>
        
        <div class="info-section">
            <h4>Informazioni generali</h4>
            <p><strong>Nome:</strong> ${v.Nome}</p>
            <p><strong>Data:</strong> ${v.Data}</p>
            <p><strong>Persone:</strong> ${personeDisplay}</p>
            <p><strong>Visuale:</strong> ${v.Visuale || '/'}</p>
            <p><strong>Album:</strong> ${v.Album}</p>
        </div>
        <hr>
        <div class="info-section">
            <h4>Altre informazioni</h4>
            <p><strong>Nome originale video:</strong> ${v["Nome originale video"] || '/'}</p>
            <p><strong>Data caricamento:</strong> ${v["Data di caricamento"]}</p>
            <p><strong>Risoluzione:</strong> ${risoluzioneVideo}</p>
            <p><strong>Fotogrammi:</strong> ${fotogrammiVideo}</p>
        </div>
    `;
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
};

window.closeModal = () => {
    document.getElementById('video-modal').style.display = "none";
    document.body.style.overflow = "auto";
};

loadGallery();