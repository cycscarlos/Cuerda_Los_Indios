/**
 * Handles Dynamic Template Injection (Navbar/Footer)
 */
export default class TemplateLoader {
    
    static async loadComponents() {
        // We will define the HTML strings here for now to avoid multiple fetch requests until SSI/Partials are set up.
        // In a larger app, fetch('/partials/nav.html') would be better.
        
        const navbarHTML = `
        <div class="container nav-content">
            <a href="index.html" class="logo">Cuerda Los Indios</a>
            <button class="menu-toggle" id="mobile-menu" aria-label="Abrir menú">
            <span></span>
            <span></span>
            <span></span>
            </button>
            <ul class="nav-links">
            <li><a href="index.html">Inicio</a></li>
            <li><a href="instalaciones.html">Instalaciones</a></li>
            <li><a href="gallery.html">Galería</a></li>
            <li><a href="inventory.html">Inventario</a></li>
            <li><a href="contact.html">Contacto</a></li>
            <li><button id="cart-btn" class="nav-btn-icon" title="Ver Carrito"><i class="fas fa-shopping-cart"></i> <span id="cart-count">0</span></button></li>
            <li><button id="help-btn" class="nav-btn-icon" title="Ayuda / Manual"><i class="fas fa-question-circle"></i></button></li>
            </ul>
        </div>`;

        const footerHTML = `
        <div class="container">
            <p>&copy; 2025 Cuerda Los Indios. Todos los derechos reservados.</p>
        </div>`;

        // Inject Navbar
        const navPlaceholder = document.getElementById('navbar-placeholder');
        if (navPlaceholder) {
            navPlaceholder.innerHTML = navbarHTML;
            navPlaceholder.classList.add('navbar'); // Add the class required for styling

            // Dynamic Admin Link
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData && userData.role === 'admin') {
                    const navLinks = navPlaceholder.querySelector('.nav-links');
                    const adminLi = document.createElement('li');
                    adminLi.innerHTML = `<a href="admin_dashboard.html" style="color: #d4af37 !important; font-weight: 700;"> <i class="fas fa-crown"></i> Panel Admin</a>`;
                    
                    // Insert before Cart (which is the first button usually) or just append to end of list
                    // Current list: Home, Inst, Gal, Inv, Cont, Cart, Help
                    // Let's insert it before the Cart button for visibility
                    const cartBtn = navPlaceholder.querySelector('#cart-btn');
                    if (cartBtn && cartBtn.parentElement) {
                        navLinks.insertBefore(adminLi, cartBtn.parentElement);
                    } else {
                        navLinks.appendChild(adminLi);
                    }
                }
            } catch (e) {
                console.error("Auth check failed", e);
            }

            // Dynamic Logout Button
             try {
                const userData = JSON.parse(localStorage.getItem('user'));
                if (userData) {
                    const navLinks = navPlaceholder.querySelector('.nav-links');
                    const logoutLi = document.createElement('li');
                    logoutLi.innerHTML = `<a href="#" id="logout-btn" style="color: #ff6b6b;"><i class="fas fa-sign-out-alt"></i> Salir</a>`;
                    
                    // Add listener
                    logoutLi.addEventListener('click', (e) => {
                        e.preventDefault();
                        localStorage.removeItem('user');
                        window.location.href = 'login.html';
                    });

                    navLinks.appendChild(logoutLi);
                }
            } catch (e) { console.error(e); }
        }

        // Inject Footer
        const footerPlaceholder = document.getElementById('footer-placeholder');
        if (footerPlaceholder) {
            footerPlaceholder.innerHTML = footerHTML;
        }

        // Inject Global Floating Logo
        const logoImg = document.createElement('img');
        logoImg.id = 'floating-logo';
        logoImg.src = 'images/logoLosIndios.png';
        logoImg.alt = 'Logo Cuerda Los Indios';
        document.body.appendChild(logoImg);

        // Initialize Mobile Menu Logic after injection
        this.initMobileMenu();
    }

    static initMobileMenu() {
        const menuToggle = document.getElementById('mobile-menu');
        const navLinks = document.querySelector('.nav-links');

        if (menuToggle && navLinks) {
            menuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
    }
}
