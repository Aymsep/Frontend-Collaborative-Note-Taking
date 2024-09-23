<template>
    <div class="avatar-container" @mouseover="showModal = true" @mouseleave="showModal = false">
      <div class="avatar-circle">
        <span>{{ firstLetter() }}</span>
      </div>
      <div v-if="showModal" class="avatar-modal">
        <button @click="handleLogout">Logout</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import {useUserStore} from '../../Store/user.Store'
  import { useRouter } from 'vue-router';
  
  const showModal = ref(false);
  const {logout,user} = useUserStore();
  const router = useRouter();
  
  const firstLetter = () => {
    return user?.username.charAt(0).toUpperCase();
  };
  
  const handleLogout = async () => {
    try {
      logout();
      router.push('/login');
    } catch (error) {
      console.log(error);
    }
}

  </script>
  
  <style scoped>
  .avatar-container {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .avatar-circle {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #6800ff;
    font-size: 24px;
    font-weight: bold;
    cursor: pointer;
  }
  
  .avatar-modal {
    position: absolute;
    top: 50px;
    background-color: white;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    left: -60px;
  }
  
  .avatar-modal button {
    background-color: #6800ff;
    color: white;
    border: none;
    padding: 8px 16px;
    cursor: pointer;
    border-radius: 4px;
  }
  
  .avatar-modal button:hover {
    background-color: #4500cc;
  }
  </style>
  