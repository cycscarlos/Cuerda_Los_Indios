let currentPage = 1;
const itemsPerPage = 8;
let currentFilteredRoosters = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchRoosters();
    setupFilters();
});

async function fetchRoosters() {
    try {
        const response = await fetch('./data/roosters.json');
        allRoosters = await response.json();
        currentFilteredRoosters = allRoosters; // Init with all
        renderGallery();
    } catch (error) {
        console.error('Error loading roosters:', error);
        document.getElementById('rooster-gallery').innerHTML = '<p>Error al cargar los datos.</p>';
    }
}

function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // UI Update
            buttons.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');

            const filterValue = btn.getAttribute('data-filter');
            
            if (filterValue === 'all') {
                currentFilteredRoosters = allRoosters;
            } else {
                currentFilteredRoosters = allRoosters.filter(r => r.gender === filterValue);
            }
            currentPage = 1; // Reset to first page
            renderGallery();
        });
    });
}


function renderGallery() {
    const gallery = document.getElementById('rooster-gallery');
    const pagination = document.getElementById('pagination');
    gallery.innerHTML = '';
    
    if (currentFilteredRoosters.length === 0) {
        gallery.innerHTML = '<p>No hay ejemplares disponibles.</p>';
        if(pagination) pagination.innerHTML = '';
        return;
    }

    // Pagination Logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = currentFilteredRoosters.slice(startIndex, endIndex);
    const totalPages = Math.ceil(currentFilteredRoosters.length / itemsPerPage);

    itemsToShow.forEach(rooster => {
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <img src="${rooster.image}" alt="${rooster.name}" class="card-image" onerror="this.src='https://placehold.co/400x320?text=No+Image'">
                    <div class="card-details-front">
                        <span class="btn btn-sm btn-secondary pointer-events-none">Ver Genealogía</span>
                    </div>
                </div>
                <div class="flip-card-back">
                    <h3 class="mb-sm">${rooster.name}</h3>
                    <div class="genealogy-tree w-full" style="text-align: left;">
                        <div class="genealogy-item"><span class="genealogy-label"><strong>Padre:</strong></span> ${rooster.genealogy.father}</div>
                        <div class="genealogy-item"><span class="genealogy-label"><strong>Madre:</strong></span> ${rooster.genealogy.mother}</div>
                        <div class="genealogy-item"><span class="genealogy-label"><strong>Marca No.:</strong></span> ${rooster.brand || 'N/A'}</div>
                        <div class="genealogy-item"><span class="genealogy-label"><strong>Placa No.:</strong></span> ${rooster.plate || 'N/A'}</div>
                    </div>
                    <div class="mt-md w-full text-center">
                        <a href="contact.html?rooster=${rooster.id}" class="btn btn-primary">Contactar</a>
                    </div>
                </div>
            </div>
        `;
        gallery.appendChild(card);
    });

    // Render Pagination Controls
    if(pagination) renderPaginationControls(totalPages);
}

function renderPaginationControls(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    // Always render controls, just disable them if needed
    // if (totalPages <= 1) return;

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary btn-sm';
    prevBtn.textContent = 'Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderGallery();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    if(currentPage === 1) prevBtn.style.opacity = '0.5';
    pagination.appendChild(prevBtn);

    // Page info
    const info = document.createElement('span');
    info.textContent = `Página ${currentPage} de ${totalPages}`;
    info.style.alignSelf = 'center';
    info.style.fontWeight = 'bold';
    pagination.appendChild(info);

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-secondary btn-sm';
    nextBtn.textContent = 'Siguiente';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderGallery();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
    if(currentPage === totalPages) nextBtn.style.opacity = '0.5';
    pagination.appendChild(nextBtn);
}
