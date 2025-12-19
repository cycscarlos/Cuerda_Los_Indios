import Store from './Store.js';
import ApiService from './ApiService.js';

export default class Cart {
    constructor(store, apiService) {
        this.store = store;
        this.api = apiService;
        this.init();
    }

    init() {
        // Create Cart Floating UI or Sidebar if not exists
        if (!document.getElementById('cart-container')) {
            this.createCartUI();
        }
        
        // Subscribe to store to update UI
        this.store.subscribe((state) => {
            this.renderCart(state.cart);
        });
    }

    createCartUI() {
        const cartDiv = document.createElement('div');
        cartDiv.id = 'cart-container';
        cartDiv.className = 'cart-sidebar hidden'; // Add CSS for this
        cartDiv.innerHTML = `
            <div class="cart-header">
                <h3>Carrito de Compras</h3>
                <button id="close-cart" class="btn-close">X</button>
            </div>
            <div id="cart-items" class="cart-items">
                <!-- Items go here -->
            </div>
            <div class="cart-footer">
                <p>Total: <span id="cart-total">$0.00</span></p>
                <button id="checkout-btn" class="btn btn-primary w-full">Confirmar Compra</button>
            </div>
        `;
        document.body.appendChild(cartDiv);

        // Events
        document.getElementById('close-cart').addEventListener('click', () => this.toggleCart(false));
        document.getElementById('checkout-btn').addEventListener('click', () => this.startCheckout());
    }

    renderCart(cartItems) {
        const container = document.getElementById('cart-items');
        const totalEl = document.getElementById('cart-total');
        const cartContainer = document.getElementById('cart-container');
        
        container.innerHTML = '';
        
        if (cartItems.length === 0) {
            container.innerHTML = '<p class="text-center">Carrito vacío</p>';
            totalEl.textContent = '$0.00';
            // Optional: Hide cart if empty? Or just keep it accessible.
            return;
        }

        let total = 0;
        cartItems.forEach(item => {
            total += Number(item.priceAtAdd) || 0;
            const itemEl = document.createElement('div');
            itemEl.className = 'cart-item';
            itemEl.innerHTML = `
                <div class="cart-item-info">
                    <strong>${item.name || item.plate}</strong>
                    <span>$${item.priceAtAdd}</span>
                </div>
                <button class="btn-remove-item" data-id="${item.id}">X</button>
            `;
            // Remove Event
            itemEl.querySelector('.btn-remove-item').addEventListener('click', () => {
                this.store.removeFromCart(item.id);
            });
            container.appendChild(itemEl);
        });

        totalEl.textContent = `$${total.toFixed(2)}`;
    }

    toggleCart(show) {
        const el = document.getElementById('cart-container');
        if (show) el.classList.remove('hidden');
        else el.classList.add('hidden');
    }

    async startCheckout() {
        // Security Check
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'admin') {
            alert('Acceso Denegado: Solo administradores pueden confirmar ventas.');
            return;
        }

        const cart = this.store.getState().cart;
        if (cart.length === 0) return alert('El carrito está vacío');
        
        // ... rest of function
        const name = prompt('Nombre del Comprador:');
        if (!name) return;
        const docId = prompt('Cédula/ID:');
        const phone = prompt('Teléfono:');
        const email = prompt('Email (Opcional):');

        const customerFunc = { fullName: name, docId, phone, email };

        try {
            if(confirm(`¿Confirmar venta por $${this.store.getCartTotal().toFixed(2)}?`)) {
                await this.api.createSale(customerFunc, cart);
                alert('Venta registrada con éxito!');
                this.store.clearCart();
                this.toggleCart(false);
                // Trigger refresh?
                window.location.reload(); 
            }
        } catch (e) {
            alert('Error al registrar venta: ' + e.message);
        }
    }
}
