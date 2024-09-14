import { defineStore } from 'pinia';
import { login as loginApi, register as registerApi, getProfile } from '../api/auth.api';
import { getMyNotes } from '../api/notes.api';
import { useRouter } from 'vue-router';
import { nextTick } from 'vue';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null,
    loading: false,
    error: null,
    notes:[]
  }),
  
  actions: {
    // Login action
    async login(formData,router) {
      this.loading = true;
      this.error = null;

      try {
        const response = await loginApi(formData);
        const { access_token,user } = response.data;

        // Save token and set state
        this.token = access_token;
        this.user = user;
        console.log('user',this.user)
        localStorage.setItem('token', access_token);

        
        router.push('/');
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed';
      } finally {
        this.loading = false;
      }
    },

    // Register action
    async register(formData,router) {
      this.loading = true;
      this.error = null;

      try {
        const response = await registerApi(formData);
        const { access_token,user } = response.data;

        // Save token and set state
        this.token = access_token;
        this.user = user;
        localStorage.setItem('token', access_token);
        // Redirect to dashboard
        router.push('/');
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed';
      } finally {
        this.loading = false;
      }
    },

    // Fetch user profile
    async fetchProfile() {
        try {
            this.loading = true;
            // Fetch profile
            const profileResponse = await getProfile();
            this.user = profileResponse.data;
          } catch (err) {
            console.error('Failed to fetch profile and notes', err);
          }finally {
            this.loading = false
      }
      },

    // Logout action
    logout(router) {
      this.token = null;
      this.user = null;
      this.notes = [];
      localStorage.removeItem('token');
      
      router.push('/login');  // Redirect after the state update is processed
    },
  },

  getters: {
    isAuthenticated: (state) => !!state.token,
  },
});
