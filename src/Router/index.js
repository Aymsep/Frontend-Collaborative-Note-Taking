import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../Store/user.Store';
import { useNotesStore } from '../Store/note.Store';
// import { isAuthenticated } from '@/services/auth'; // assuming auth service

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: ()=> import('../Views/Login.vue'),
    meta: { guest: true }, // Only allow guest (not logged-in users)
  },
  {
    path: '/signup',
    name: 'Signup',
    component: ()=> import('../Views/Signup.vue'),
    meta: { guest: true }, // Only allow guest (not logged-in users)
  },
  {
    path: '/',
    name: 'Dashboard',
    component: ()=> import('../Views/Dashboard.vue'),
    meta: { requiresAuth: true }, // Only allow authenticated users
    beforeEnter: async (to, from, next) => {
      const userStore = useUserStore();
      const noteStore = useNotesStore()

      if (!userStore.isAuthenticated) {
        next('/login');
      } else {
        await userStore.fetchProfile();  // Fetch user profile on dashboard entry
        await noteStore.fetchNotes();  // Fetch user profile on dashboard entry
        next();
      }
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: ()=> import('../Views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});


router.beforeEach((to, from, next) => {
  const userStore = useUserStore();  // Access user state from the store

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!userStore.isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else if (to.matched.some(record => record.meta.guest)) {
    if (userStore.isAuthenticated) {
      next('/');
    } else {
      next();
    }
  } else {
    next();
  }
});



export default router;
