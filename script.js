let allVideos = [];

const monthNames = {
    "01": "Gennaio", "02": "Febbraio", "03": "Marzo", "04": "Aprile",
    "05": "Maggio", "06": "Giugno", "07": "Luglio", "08": "Agosto",
    "09": "Settembre", "10": "Ottobre", "11": "Novembre", "12": "Dicembre"
};

async function loadGallery() {
    try {
        const response = await fetch('data.json');
        allVideos = await response.json();
        
        allVideos.reverse();

        renderPeople(allVideos);
        renderMonthsAndYears(allVideos);
        renderAlbums(allVideos);
        renderVideos(allVideos);
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
    }
}

function renderPeople(videos) {
    const container = document.getElementById('people-albums');
    const hiddenPeople = ["Fava", "Itallo", "Gio","Fabio"];
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

    let html = '<strong>Persone: </strong>' + 
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button>` +
        peopleSorted.map(p => 
            `<button class="album-btn" onclick="filterByPerson('${p}')">${p} (${counts[p]})</button>`
        ).join('');

    const availableHiddenPeople = hiddenPeople.filter(p => otherCounts[p] > 0);

    if (availableHiddenPeople.length > 0) {
        html += ` <button class="album-btn" onclick="toggleOtherPeople()"><strong>Altro ▾</strong></button>` +
            `<span id="other-people-container" style="display: none; margin-left: 4px;">` +
            availableHiddenPeople.map(p => 
                `<button class="album-btn" onclick="filterByPerson('${p}')">${p} (${otherCounts[p]})</button>`
            ).join('') +
            `</span>`;
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

    dateContainer.innerHTML = '<strong>Periodi: </strong>' + 
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button>` +
        activePeriods.map(p => {
            const [m, y] = p.split('/');
            const label = `${monthNames[m]} ${y}`;
            return `<button class="album-btn" onclick="filterByMonthYear('${m}', '${y}')">${label}</button>`;
        }).join('');
}

function renderAlbums(videos) {
    const container = document.getElementById('collection-albums');
    let counts = {};
    videos.forEach(v => {
        counts[v.Album] = (counts[v.Album] || 0) + 1;
    });

    let albumsSorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    albumsSorted = albumsSorted.filter(a => a !== "Timelapse" && a !== "Carnevale di Ivrea" && a !== "Altro" && a !== "Video Fabio");
    
    if (counts["Timelapse"]) albumsSorted.push("Timelapse");
    if (counts["Carnevale di Ivrea"]) albumsSorted.push("Carnevale di Ivrea");
    if (counts["Altro"]) albumsSorted.push("Altro");
    if (counts["Video Fabio"]) albumsSorted.push("Video Fabio");

    container.innerHTML = '<strong>Album: </strong>' + 
        `<button class="album-btn" onclick="resetFilters()"><strong>Tutti i video</strong> (${allVideos.length})</button>` +
        albumsSorted.map(a => 
            `<button class="album-btn" onclick="filterByAlbum('${a}')">${a} (${counts[a]})</button>`
        ).join('');
}

window.filterByPerson = (personName) => {
    const filtered = allVideos.filter(v => {
        if (!v.Persone) return false;
        if (Array.isArray(v.Persone)) {
            return v.Persone.includes(personName);
        }
        return v.Persone === personName;
    });
    renderVideos(filtered);
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

    renderVideos(filtered);
};

window.filterByAlbum = (albumName) => {
    const filtered = allVideos.filter(v => v.Album === albumName);
    renderVideos(filtered);
};

window.resetFilters = () => {
    renderVideos(allVideos);
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

function renderVideos(videoList) {
    currentVideosList = videoList;
    const container = document.getElementById('video-container');
    
    container.innerHTML = videoList.map((v, index) => {
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
    }).join('');
}

window.openModal = (index) => {
    const modal = document.getElementById('video-modal');
    const modalBody = document.getElementById('modal-body');
    const v = currentVideosList[index];
    
    const videoId = getYoutubeId(v.Link);
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const personeDisplay = Array.isArray(v.Persone) ? v.Persone.join(', ') : v.Persone;

    modalBody.innerHTML = `
        <img src="${thumbnailUrl}" class="modal-thumbnail-large" alt="${v.Nome}">
        
        <a href="${v.Link}" target="_blank" class="watch-link" style="margin-bottom: 20px;">Guarda su YouTube</a>
        
        <div class="info-section">
            <h4>Informazioni generali</h4>
            <p><strong>Nome:</strong> ${v.Nome}</p>
            <p><strong>Persone:</strong> ${personeDisplay}</p>
            <p><strong>Data:</strong> ${v.Data}</p>
            <p><strong>Visuale:</strong> ${v.Visuale || '/'}</p>
            <p><strong>Album:</strong> ${v.Album}</p>
        </div>
        <hr>
        <div class="info-section">
            <h4>Altre informazioni</h4>
            <p><strong>Nome originale video:</strong> ${v["Nome originale video"] || '/'}</p>
            <p><strong>Data caricamento:</strong> ${v["Data di caricamento"]}</p>
            <p><strong>Stato Caricamento:</strong> ${v.Caricamento}</p>
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