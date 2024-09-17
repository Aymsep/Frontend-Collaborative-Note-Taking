import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi, getProfile } from '../api/auth.api';
import { saveToken, getToken, removeToken } from '../Utils/token.Utils';
import { io } from 'socket.io-client';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || null,
    user: null,
    socket: null, // WebSocket instance
    loading: false,
    error: null,
    notes: [],
    onlineUsers: [], // Track online users
  }),

  actions: {
    initializeWebSocket() {
      // Initialize WebSocket only if not already initialized and if the user is authenticated
      if (!this.socket && this.isAuthenticated && this.user) {
        this.socket = io('http://localhost:3000', {
          transports: ['websocket'],
          query: {
            userId: this.user.id,
            username: this.user.username,
          },
        });

        // Listen for 'onlineUsers' event to get updated list of online users
        this.socket.on('onlineUsers', (users) => {
          console.log('Online users:', users);
          this.onlineUsers = users.filter(user => user.id !== this.user.id); // Exclude current user
        });

        // Handle WebSocket disconnection or other custom logic as needed
        this.socket.on('disconnect', () => {
          console.log('WebSocket disconnected');
        });
      }
    },

    // Call this method when app starts, on page reloads or when user is already authenticated
    autoLogin() {
      if (this.isAuthenticated && !this.user) {
        // Fetch user profile (e.g., from backend)
        this.fetchProfile();
      }

      // Initialize WebSocket connection if the user is already authenticated
      if (this.isAuthenticated) {
        this.initializeWebSocket();
      }
    },

    // Login action
    async login(formData) {
      this.setLoading(true);

      try {
        const { data } = await loginApi(formData);
        this.handleAuthSuccess(data);
        this.initializeWebSocket(); // Initialize WebSocket after successful login
      } catch (err) {
        this.handleError(err, 'Login failed');
      } finally {
        this.setLoading(false);
      }
    },

    // Register action
    async register(formData) {
      this.setLoading(true);

      try {
        const { data } = await registerApi(formData);
        this.handleAuthSuccess(data);
        this.initializeWebSocket(); // Initialize WebSocket after successful registration
      } catch (err) {
        this.handleError(err, 'Registration failed');
      } finally {
        this.setLoading(false);
      }
    },

    // Fetch user profile
    async fetchProfile() {
      this.setLoading(true);

      try {
        const { data } = await getProfile();
        this.user = data;
        this.initializeWebSocket(); // Ensure WebSocket is initialized after profile fetch
      } catch (err) {
        this.handleError(err, 'Failed to fetch profile');
      } finally {
        this.setLoading(false);
      }
    },

    // Logout action
    logout() {
      this.token = null;
      this.user = null;
      this.notes = [];
      removeToken();
      this.disconnectWebSocket(); // Disconnect WebSocket during logout
    },

    // Disconnect WebSocket and clean up on logout
    disconnectWebSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    },

    // Auth success handler
    handleAuthSuccess({ access_token, user }) {
      this.token = access_token;
      this.user = user;
      saveToken(access_token);
    },

    // Error handler
    handleError(err, defaultMessage) {
      this.error = err.response?.data?.message || defaultMessage;
    },

    // Set loading state
    setLoading(state) {
      this.loading = state;
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
    getUserId: (state) => state.user?.id,
  },
});
