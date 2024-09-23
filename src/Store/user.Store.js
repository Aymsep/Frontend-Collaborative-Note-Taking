import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi, getProfile } from '../api/auth.api';
import { saveToken, getToken, removeToken } from '../Utils/token.Utils';
import { io } from 'socket.io-client';

const url = import.meta.env.VITE_BASE_URL ? import.meta.env.VITE_BASE_URL : 'http://localhost:3000'
console.log('url', url)
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
    // Initialize WebSocket
    initializeWebSocket() {
      if (!this.socket && this.isAuthenticated && this.user) {
        this.socket = io(url, {
          transports: ['websocket'],
          query: {
            userId: this.user.id,
            username: this.user.username,
          },
        });

        this.socket.on('connect', () => {
          console.log('WebSocket connected');
        });

        // Listen for 'onlineUsers' event
        this.socket.on('onlineUsers', (users) => {
          this.onlineUsers = users.filter(user => user.id !== this.user.id); // Exclude current user
        });

        // Handle WebSocket disconnection
        this.socket.on('disconnect', () => {
        });

        // Handle errors during WebSocket connection
        this.socket.on('connect_error', (err) => {
        });
      }
    },

    // Auto-login for page reloads
    autoLogin() {
      if (this.isAuthenticated && !this.user) {
        this.fetchProfile();
      }

      if (this.isAuthenticated) {
        this.initializeWebSocket();
      }
    },

    // Login action
    async login(formData) {
      this.setLoading(true);
      this.error = null; // Clear previous errors

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
      this.error = null;

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
      this.error = null;

      try {
        const { data } = await getProfile();
        this.user = data;
        this.initializeWebSocket();
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
      this.disconnectWebSocket(); // Disconnect WebSocket on logout
    },

    // Disconnect WebSocket on logout
    disconnectWebSocket() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    },

    // Handle authentication success
    handleAuthSuccess({ access_token, user }) {
      this.token = access_token;
      this.user = user;
      saveToken(access_token);
    },

    // Handle errors
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
