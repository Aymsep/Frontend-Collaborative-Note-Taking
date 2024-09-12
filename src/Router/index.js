import { createRouter, createWebHistory } from 'vue-router';
// import { isAuthenticated } from '@/services/auth'; // assuming auth service

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: ()=> import('../Views/Login.vue'),
    meta: { requiresGuest: true }, // Only allow guest (not logged-in users)
  },
  {
    path: '/signup',
    name: 'Signup',
    component: ()=> import('../Views/Signup.vue'),
    meta: { requiresGuest: true }, // Only allow guest (not logged-in users)
  },
  {
    path: '/',
    name: 'Dashboard',
    component: ()=> import('../Views/Dashboard.vue'),
    meta: { requiresAuth: true }, // Only allow authenticated users
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
  const loggedIn = false; 

  if (to.matched.some(record => record.meta.requiresAuth) && !loggedIn) { 
    next({ name: 'Login' }); 
  } else if (to.matched.some(record => record.meta.requiresGuest) && loggedIn) {
    next({ name: 'Dashboard' }); 
  } else {
    next();
  }
});



export default router;
