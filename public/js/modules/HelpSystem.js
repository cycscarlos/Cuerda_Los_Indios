export default class HelpSystem {
    constructor() {
        this.init();
    }

    init() {
        // Wait for navbar to be loaded
        setTimeout(() => {
            const btn = document.getElementById('help-btn');
            if(btn) {
                btn.addEventListener('click', () => this.showHelpModal());
            }
        }, 500); // Small delay to ensure DOM injection
        
        // Auto-start tour if first visit to inventory
        if (window.location.pathname.includes('inventory.html')) {
            const seenTour = localStorage.getItem('seen_tour');
            if (!seenTour) {
                // Wait for DataTables
                setTimeout(() => this.startTour(), 1000);
            }
        }
    }

    startTour() {
        if (!window.introJs) return console.warn('Intro.js not loaded');

        const intro = introJs();
        intro.setOptions({
            steps: [
                {
                    intro: "¡Bienvenido al sistema de gestión de Cuerda Los Indios! Hagamos un recorrido rápido."
                },
                {
                    element: '.inventory-table',
                    intro: "Aquí está tu inventario de aves. Puedes ordenar por columnas y buscar por placa."
                },
                {
                    element: '.btn-cart',
                    intro: "Usa este botón para añadir un ejemplar al carrito de venta."
                },
                {
                    element: 'a[href*="genealogy.html"]',
                    intro: "Haz clic en el árbol para ver el linaje de 3 generaciones."
                },
                {
                    element: '#help-btn',
                    intro: "Si necesitas ayuda, este botón abre el manual de usuario."
                }
            ],
            nextLabel: 'Siguiente',
            prevLabel: 'Atrás',
            doneLabel: 'Entendido'
        });

        intro.oncomplete(() => {
            localStorage.setItem('seen_tour', 'true');
        });

        intro.onexit(() => {
            localStorage.setItem('seen_tour', 'true');
        });

        intro.start();
    }

    showHelpModal() {
        // Simple Modal Injection
        if (document.getElementById('help-modal')) {
            document.getElementById('help-modal').showModal();
            return;
        }

        const modal = document.createElement('dialog');
        modal.id = 'help-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close" onclick="document.getElementById('help-modal').close()">&times;</span>
                <h2>Manual de Usuario Rápido</h2>
                <div class="help-body">
                    <h3>1. Gestión de Inventario</h3>
                    <p>Utiliza la tabla para ver el estado de tus ejemplares. La <strong>Placa</strong> es el identificador único.</p>
                    
                    <h3>2. Proceso de Venta</h3>
                    <ol>
                        <li>Selecciona los ejemplares con el botón 🛒.</li>
                        <li>Abre el carrito (barra lateral derecha).</li>
                        <li>Revisa el total (USD estricto).</li>
                        <li>Haz clic en "Confirmar Compra" e ingresa los datos del cliente.</li>
                    </ol>
                    <p><strong>IMPORTANTE:</strong> Una vez confirmada la venta, la transacción es final y los ejemplares pasan a estado "Vendido".</p>

                    <h3>3. Genealogía</h3>
                    <p>El árbol genealógico permite navegar entre ancestros. Si un ancestro aparece gris, no tiene registro en el sistema.</p>
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="document.getElementById('help-modal').close()">Cerrar</button>
                    <button class="btn btn-primary" onclick="localStorage.removeItem('seen_tour'); location.reload();">Reiniciar Tour</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.showModal();
    }
}
