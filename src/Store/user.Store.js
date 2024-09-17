import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi, getProfile } from '../api/auth.api';
import { saveToken, getToken, removeToken } from '../Utils/token.Utils';
import { useRouter } from 'vue-router';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: getToken() || null,
    user: null,
    loading: false,
    error: null,
    notes: [],
  }),

  actions: {
    // Login action
    async login(formData) {
      this.setLoading(true);

      try {
        const { data } = await loginApi(formData);
        this.handleAuthSuccess(data);
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

      const router = useRouter();
      router.push('/login');
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
