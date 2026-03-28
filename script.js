let allVideos = [];

async function loadGallery() {
    try {
        const response = await fetch('data.json');
        allVideos = await response.json();

        allVideos.sort((a, b) => {
            const dateA = new Date(a.Data.split('/').reverse().join('-'));
            const dateB = new Date(b.Data.split('/').reverse().join('-'));
            return dateB - dateA;
        });

        renderAlbums(allVideos);
        renderVideos(allVideos);
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
    }
}

function renderAlbums(videos) {
    const peopleContainer = document.getElementById('people-albums');
    const dateContainer = document.getElementById('date-albums');

    let counts = {};
    videos.forEach(v => {
        counts[v.Album] = (counts[v.Album] || 0) + 1;
    });

    let albumsSorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    
    albumsSorted = albumsSorted.filter(a => a !== "Timelapse" && a !== "Altro" && a !== "Video Fabio");
    
    if (counts["Timelapse"]) albumsSorted.push("Timelapse");
    if (counts["Altro"]) albumsSorted.push("Altro");
    if (counts["Video Fabio"]) albumsSorted.push("Video Fabio");

    peopleContainer.innerHTML = '' + 
        `<button class="album-btn" onclick="renderVideos(allVideos)">Tutti (${allVideos.length})</button>` +
        albumsSorted.map(a => 
            `<button class="album-btn" onclick="filterByAlbum('${a}')">${a} (${counts[a]})</button>`
        ).join('');

    const uniqueDates = [...new Set(videos.map(v => v.Data))].sort((a, b) => 
        new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-'))
    );

    dateContainer.innerHTML = '' + uniqueDates.map(d => 
        `<button class="album-btn" onclick="filterByDate('${d}')">${d}</button>`
    ).join('');
}

function getYoutubeId(url) {
    if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split('?')[0];
    }
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
}

function renderVideos(videoList) {
    const container = document.getElementById('video-container');
    
    container.innerHTML = videoList.map(v => {
        const personeDisplay = Array.isArray(v.Persone) ? v.Persone.join(', ') : v.Persone;
        const videoId = getYoutubeId(v.Link);
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

        return `
        <div class="video-card">
            <div class="thumbnail-container">
                <img src="${thumbnailUrl}" alt="Miniatura ${v.Nome}" class="video-thumbnail">
            </div>
            <a href="${v.Link}" target="_blank" class="watch-link">Guarda su YouTube</a>
            
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
                <p><strong>Stato:</strong> ${v.Caricamento}</p>
            </div>
        </div>
        `;
    }).join('');
}

window.filterByAlbum = (albumName) => {
    const filtered = allVideos.filter(v => v.Album === albumName);
    renderVideos(filtered);
};

window.filterByDate = (date) => {
    const filtered = allVideos.filter(v => v.Data === date);
    renderVideos(filtered);
};

loadGallery();