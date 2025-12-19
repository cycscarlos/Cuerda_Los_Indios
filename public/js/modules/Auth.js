/**
 * Simple Authentication Module
 * Manages user session using localStorage for persistence.
 * NOTE: This is a basic implementation for demonstration. 
 * Real production apps should use Supabase Auth or secure sessions.
 */
export default class Auth {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
    }

    login(username, password) {
        // Simple hardcoded validation as requested
        // In a real app, this would verify against DB or API
        if (username === 'admin' && password === 'admin123') {
            this.user = { username, role: 'admin' };
            localStorage.setItem('user', JSON.stringify(this.user));
            return true;
        }
        return false;
    }

    logout() {
        this.user = null;
        localStorage.removeItem('user');
        window.location.reload();
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    isAuthenticated() {
        return !!this.user;
    }

    getUser() {
        return this.user;
    }
}
