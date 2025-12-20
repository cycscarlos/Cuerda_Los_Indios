/**
 * Simple Authentication Module
 * Manages user session using localStorage for persistence.
 * NOTE: This is a basic implementation for demonstration. 
 * Real production apps should use Supabase Auth or secure sessions.
 */
import ApiService from './ApiService.js';

export default class Auth {
    constructor() {
        this.user = JSON.parse(localStorage.getItem('user')) || null;
        this.api = new ApiService();
    }

    async login(username, password) {
        try {
            const user = await this.api.verifyUser(username, password);
            if (user) {
                this.user = user;
                localStorage.setItem('user', JSON.stringify(this.user));
                return user;
            }
            return null;
        } catch (e) {
            console.error("Login attempt failed", e);
            return null;
        }
    }

    logout() {
        this.user = null;
        localStorage.removeItem('user');
        window.location.reload();
    }

    isAdmin() {
        return this.user && this.user.role === 'admin';
    }

    isEmployee() {
        return this.user && (this.user.role === 'empleado' || this.user.role === 'admin');
    }

    canDelete() {
        return this.isAdmin();
    }

    canEdit() {
        return this.isEmployee();
    }

    isAuthenticated() {
        return !!this.user;
    }

    getUser() {
        return this.user;
    }
}
