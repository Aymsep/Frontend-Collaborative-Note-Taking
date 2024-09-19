import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../Store/user.Store';
import { useNotesStore } from '../Store/note.Store';
import Dashboard from '../Views/Dashboard.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../Views/Login.vue'),
    meta: { guest: true }, // Only allow guest (not logged-in users)
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../Views/Signup.vue'),
    meta: { guest: true }, // Only allow guest (not logged-in users)
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }, // Only allow authenticated users
    beforeEnter: async (to, from, next) => {
      const userStore = useUserStore();
      const noteStore = useNotesStore();

      if (!userStore.isAuthenticated) {
        next('/login');
      } else {
        await userStore.fetchProfile();
        await noteStore.fetchNotes();
        next();
      }
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../Views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global route guard to handle authentication and guest routes
router.beforeEach((to, from, next) => {
  const userStore = useUserStore(); // Access the user store

  // Check if the route requires authentication
  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!userStore.isAuthenticated) {
      // Redirect to login if not authenticated
      next('/login');
    } else {
      // Proceed to the route if authenticated
      next();
    }
  } 
  // Check if the route is for guests
  else if (to.matched.some((record) => record.meta.guest)) {
    if (userStore.isAuthenticated) {
      // Redirect to dashboard if already authenticated
      next('/');
    } else {
      // Allow access if not authenticated
      next();
    }
  } 
  // For any other route
  else {
    next(); // Proceed as normal
  }
});

export default router;
