let allRoosters = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchRoosters();
    setupFilters();
});

async function fetchRoosters() {
    try {
        const response = await fetch('/api/roosters');
        allRoosters = await response.json();
        renderGallery(allRoosters);
    } catch (error) {
        console.error('Error loading roosters:', error);
        document.getElementById('rooster-gallery').innerHTML = '<p>Error al cargar los datos.</p>';
    }
}

function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            buttons.forEach(b => b.classList.remove('btn-primary'));
            buttons.forEach(b => b.classList.add('btn-secondary')); // Reset style
            
            // Add active style to clicked
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');

            const filterValue = btn.getAttribute('data-filter');
            
            if (filterValue === 'all') {
                renderGallery(allRoosters);
            } else {
                const filtered = allRoosters.filter(r => r.gender === filterValue);
                renderGallery(filtered);
            }
        });
    });
}


function renderGallery(roosters) {
    const gallery = document.getElementById('rooster-gallery');
    gallery.innerHTML = '';
    
    if (roosters.length === 0) {
        gallery.innerHTML = '<p>No hay ejemplares disponibles.</p>';
        return;
    }

    roosters.forEach(rooster => {
        const card = document.createElement('div');
        card.className = 'flip-card';
        
        // Construct the inner HTML
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <!-- Placeholder image if actual image fails or is missing, but trying to use src from JSON -->
                    <img src="${rooster.image}" alt="${rooster.name}" class="card-image" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
                    <div class="card-details-front">
                        <h3>${rooster.name}</h3>
                        <p class="text-muted">${rooster.line || 'Linaje Desconocido'}</p>
                        <span class="btn btn-sm btn-secondary mt-xs pointer-events-none">Ver Genealogía</span>
                    </div>
                </div>
                <div class="flip-card-back">
                    <h3>Genealogía</h3>
                    <div class="genealogy-tree">
                        <div class="genealogy-item"><span class="genealogy-label">Padre:</span> ${rooster.genealogy.father}</div>
                        <div class="genealogy-item"><span class="genealogy-label">Madre:</span> ${rooster.genealogy.mother}</div>
                        <div class="genealogy-item"><span class="genealogy-label">Línea:</span> ${rooster.genealogy.line}</div>
                    </div>
                    <p style="font-size: 0.9rem; margin-bottom: 1rem;">${rooster.description}</p>
                    <div class="flex-gap-1" style="justify-content: center;">
                        <a href="contact.html?rooster=${rooster.id}" class="btn btn-primary">Contactar</a>
                        <button class="btn btn-secondary">Comprar</button>
                    </div>
                </div>
            </div>
        `;
        gallery.appendChild(card);
    });
}
