<template>
    <div v-if="isLoading" class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const isLoading = ref(false);
const router = useRouter();

onMounted(() => {
  router.beforeEach((to, from, next) => {
    isLoading.value = true;
    next();
  });

  router.afterEach(() => {
    isLoading.value = false;
  });
});

onUnmounted(() => {
  router.beforeEach(() => {});  // Reset on unmount
  router.afterEach(() => {});   // Reset on unmount
});
  
  </script>
  
  <style scoped>
  .spinner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 8px solid #7b7cf2;
    border-radius: 50%;
    border-top-color: #7b7cf2;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  </style>
  