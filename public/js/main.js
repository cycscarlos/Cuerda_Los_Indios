import Store from './modules/Store.js';
import ApiService from './modules/ApiService.js';
import Render from './modules/Render.js';
import TemplateLoader from './modules/TemplateLoader.js';
import Cart from './modules/Cart.js';
import Auth from './modules/Auth.js';
import HelpSystem from './modules/HelpSystem.js';

// Initialize Services
const api = new ApiService();
const auth = new Auth();
const help = new HelpSystem(); // Init Help System
const store = new Store({
    roosters: [],
    filteredRoosters: [],
    filter: 'all',
    currentPage: 1,
    itemsPerPage: 8,
    loading: true,
    error: null,
    cart: []
});
const cart = new Cart(store, api); // Initialize Cart

// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 1. Load UI Templates
        await TemplateLoader.loadComponents();

        // 2. Determine Page Context
        const galleryContainer = document.getElementById('rooster-gallery');
        const inventoryBody = document.getElementById('inventory-body');

        // SECURITY CHECK: Force Login for Inventory Page
        if (inventoryBody) {
            if (!auth.isAuthenticated()) {
                console.warn("Unauthorized access to inventory. Redirecting...");
                window.location.href = 'login.html';
                return; // Stop execution
            }
        }

        // 3. Fetch Data
        if (galleryContainer || inventoryBody) {
            await loadData();
        }

        // 4. Setup Page Specific Logic
        if (galleryContainer) initGallery(galleryContainer);
        if (inventoryBody) initInventory(inventoryBody);
    } catch (criticalError) {
        console.error("CRITICAL APP ERROR:", criticalError);
        // Optionally show user friendly message
        document.body.innerHTML += `<div style="color: red; padding: 20px; text-align: center;">Error iniciando la aplicación: ${criticalError.message}</div>`;
    }
});

async function loadData() {
    try {
        const roosters = await api.getRoosters();
        store.setState({ 
            roosters: roosters, 
            filteredRoosters: roosters,
            loading: false 
        });
    } catch (error) {
        store.setState({ error: 'Error al cargar datos.', loading: false });
    }
}

// --- Logic for Gallery Page ---
function initGallery(container) {
    // Setup Filter Buttons
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterType = btn.getAttribute('data-filter');
            
            // Update UI State for Buttons
            buttons.forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');

            // Apply Filter Logic
            const state = store.getState();
            let filtered = state.roosters;
            if (filterType !== 'all') {
                filtered = state.roosters.filter(r => r.gender === filterType);
            }
            
            store.setState({ 
                filter: filterType, 
                filteredRoosters: filtered, 
                currentPage: 1 
            });
        });
    });

    // Subscribe to Store Updates
    store.subscribe((state) => {
        renderGalleryView(container, state);
    });

    // Initial Render
    renderGalleryView(container, store.getState());
}

function renderGalleryView(container, state) {
    container.innerHTML = '';
    const pagination = document.getElementById('pagination');

    if (state.loading) {
        container.innerHTML = '<p>Cargando ...</p>';
        return;
    }

    if (state.error) {
        container.innerHTML = `<p>${state.error}</p>`;
        return;
    }

    if (state.filteredRoosters.length === 0) {
        container.innerHTML = '<p>No hay ejemplares disponibles.</p>';
        if(pagination) pagination.innerHTML = '';
        return;
    }

    // Pagination Logic
    const { currentPage, itemsPerPage, filteredRoosters } = state;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = filteredRoosters.slice(startIndex, endIndex);
    const totalPages = Math.ceil(filteredRoosters.length / itemsPerPage);

    // Render Cards
    itemsToShow.forEach(rooster => {
        const card = Render.createRoosterCard(rooster);
        container.appendChild(card);
    });

    // Render Pagination Controls
    if(pagination) renderPagination(pagination, currentPage, totalPages);
}

function renderPagination(container, currentPage, totalPages) {
    container.innerHTML = '';
    
    // Prev
    const prevBtn = document.createElement('button');
    prevBtn.className = 'btn btn-secondary btn-sm';
    prevBtn.textContent = 'Anterior';
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            store.setState({ currentPage: currentPage - 1 });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    if(currentPage === 1) prevBtn.style.opacity = '0.5';
    container.appendChild(prevBtn);

    // Info
    const info = document.createElement('span');
    info.textContent = `Página ${currentPage} de ${totalPages}`;
    info.style.alignSelf = 'center';
    info.style.fontWeight = 'bold';
    container.appendChild(info);

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-secondary btn-sm';
    nextBtn.textContent = 'Siguiente';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            store.setState({ currentPage: currentPage + 1 });
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
    if(currentPage === totalPages) nextBtn.style.opacity = '0.5';
    container.appendChild(nextBtn);
}


// --- Logic for Inventory Page ---
function initInventory(tbody) {
    // Force Login Security Check
    if (!auth.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    // Initial Render
    const state = store.getState();
    if(state.roosters.length > 0) {
        renderInventoryView(tbody, state.roosters);
        checkUrlSearch();
    }

    // Subscribe
    store.subscribe((state) => {
        // If logic dictates re-render on search, handle it.
        // For DataTables + Store, we might be careful not to redraw unnecessarily.
        // But for Soft Delete updates, we need to refresh.
        if(document.querySelector('.inventory-table')) {
             renderInventoryView(tbody, state.roosters);
             checkUrlSearch();
        }
    });

    setupModal();
}

function checkUrlSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    if (search && $.fn.DataTable) {
         // Tiny timeout to ensure DT is ready
         setTimeout(() => {
            const table = $('.inventory-table').DataTable();
            table.search(search).draw();
         }, 100);
    }
}

function renderInventoryView(tbody, roosters) {
    const isAdmin = auth.isAdmin();
    Render.renderInventoryTable(roosters, '.inventory-table', isAdmin);
    
    // Attach Event Listeners to Buttons (Delegation on Tbody/Table)
    // We can use jQuery for delegation which persists across redraws if attached to wrapper
    $('.inventory-table tbody').off('click').on('click', 'button', async function(e) {
        e.stopPropagation(); // Prevent bubbling issues
        
        if (!auth.isAdmin()) return alert("Acceso denegado");
        
        const btn = $(this);
        const id = btn.data('id');
        const rooster = roosters.find(r => r.id === id); // NOTE: ID might be string/UUID

        if (btn.hasClass('btn-cart')) {
            store.addToCart(rooster);
            alert(`"${rooster.name}" añadido al carrito.`);
        } else if (btn.hasClass('btn-delete')) {
            if(confirm(`¿Estás seguro de eliminar a ${rooster.name}?`)) {
                try {
                    await api.deleteRooster(id);
                    alert('Eliminado correctamente.');
                    // Reload data
                    const newRoosters = await api.getRoosters();
                    store.setState({ roosters: newRoosters });
                } catch(err) {
                    alert('Error al eliminar: ' + err.message);
                }
            }
        } else if (btn.hasClass('btn-edit')) {
            openModal(rooster);
        }
    });
}

// Modal Logic
function setupModal() {
    const modal = document.getElementById('crud-modal');
    if (!modal) return;
    
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-modal');
    const form = document.getElementById('rooster-form');

    const closeModal = () => modal.close();
    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Handle empty foreign keys
        if(data.father_id === "") data.father_id = null;
        if(data.mother_id === "") data.mother_id = null;
        
        try {
            if (data.id) {
                await api.updateRooster(data.id, data);
                alert('Actualizado correctamente');
            } else {
                delete data.id; // New record
                await api.createRooster(data);
                alert('Creado correctamente');
            }
            modal.close();
            // Reload
            const newRoosters = await api.getRoosters();
            store.setState({ roosters: newRoosters });
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        }
    };
}

function openModal(rooster) {
    const modal = document.getElementById('crud-modal');
    const form = document.getElementById('rooster-form');
    
    form.id.value = rooster.id;
    form.plate.value = rooster.plate || '';
    form.name.value = rooster.name || '';
    form.gender.value = rooster.gender;
    form.birth_date.value = rooster.birth_date || '';
    form.price.value = rooster.price || '';
    form.status.value = rooster.status || 'Disponible';
    
    // Populate Parents
    const state = store.getState();
    const potentialFathers = state.roosters.filter(r => r.gender === 'Macho' && r.id !== rooster.id);
    const potentialMothers = state.roosters.filter(r => r.gender === 'Hembra' && r.id !== rooster.id);
    
    const fatherSelect = form.father_id;
    fatherSelect.innerHTML = '<option value="">Seleccione...</option>';
    potentialFathers.forEach(r => {
        fatherSelect.innerHTML += `<option value="${r.id}" ${r.id === rooster.father_id ? 'selected' : ''}>${r.name} (${r.plate})</option>`;
    });

    const motherSelect = form.mother_id;
    fatherSelect.innerHTML = '<option value="">Seleccione...</option>'; // NOTE: Typo in original code was here too possibly? But let's fix logic.
    // Actually, line 493 in original used motherSelect.
    
    motherSelect.innerHTML = '<option value="">Seleccione...</option>';
    potentialMothers.forEach(r => {
        motherSelect.innerHTML += `<option value="${r.id}" ${r.id === rooster.mother_id ? 'selected' : ''}>${r.name} (${r.plate})</option>`;
    });

    modal.showModal();
}
