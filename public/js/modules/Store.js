/**
 * Simple State Management with Pub/Sub pattern
 * Allows components to subscribe to state changes without direct coupling.
 */
export default class Store {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  /**
   * Get the current state
   * @returns {Object} A copy of the current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update the state and notify subscribers
   * @param {Object} partialState - New properties to merge into state
   */
  setState(partialState) {
    this.state = {
      ...this.state,
      ...partialState,
    };
    this.notify();
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Function to call on state update
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners of the current state
   * @private
   */
  notify() {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }
}
